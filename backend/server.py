from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import fal_client
from PIL import Image
from reportlab.lib.pagesizes import A2
from reportlab.pdfgen import canvas
import aiohttp
import aiofiles
import io
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'postersmith_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# fal.ai config
os.environ["FAL_KEY"] = os.environ.get('FAL_KEY', '')

# Generated posters directory
POSTERS_DIR = ROOT_DIR / "generated_posters"
POSTERS_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI(title="PosterSmith AI")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# ============ MODELS ============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "creator"  # admin or creator
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class PosterRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=200)
    style_preset: Optional[str] = "minimalist"

class Poster(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    prompt: str
    style_preset: str
    wrapped_prompt: str
    preview_url: str
    jpg_url: str
    pdf_url: Optional[str] = None
    status: str = "pending"  # pending, generating, completed, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PosterResponse(BaseModel):
    id: str
    prompt: str
    style_preset: str
    preview_url: str
    jpg_url: str
    pdf_url: Optional[str]
    status: str
    created_at: datetime

class AdminUserUpdate(BaseModel):
    role: Optional[str] = None
    name: Optional[str] = None

# ============ STYLE PRESETS ============

STYLE_PRESETS = {
    "minimalist": "minimalist, lots of negative space, clean lines, limited color palette, Scandinavian wall art feel",
    "boho": "boho, earthy tones, organic shapes, hand-drawn feel, warm and cozy decor",
    "vintage": "vintage poster style, textured paper, muted colors, retro typography, classic illustration",
    "kids": "playful, child-friendly, bright colors, simple shapes, cute characters, nursery wall art",
    "abstract": "bold abstract art, strong shapes and color blocks, modern gallery aesthetic",
    "photo-real": "highly realistic photography-style image, soft lighting, cinematic mood"
}

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============ PROMPT WRAPPING ============

def build_wrapped_prompt(user_prompt: str, style_preset: str) -> str:
    style_description = STYLE_PRESETS.get(style_preset, STYLE_PRESETS["minimalist"])
    
    wrapped_prompt = f"""You are a professional poster designer.
Create a single vertical A2 wall art poster suitable for selling as a digital download on Etsy.
The poster should be in the style of {style_description}, with a clean, modern composition.

Technical guidelines:
- Aspect ratio: A2 portrait (approx 1 : 1.414).
- Designed to be printed at 300 DPI at A2 size, with enough detail to upscale cleanly to about 4961×7016 pixels.
- Keep all important elements at least 1 cm away from the edges; leave visually pleasing margins.
- Use high contrast and harmonious colors so the design reads clearly when printed and viewed from a distance.
- If text is included, it must be large, minimal, and easily readable; avoid long paragraphs and tiny fonts.
- Avoid watermarks, signatures, logos, brand names, copyrighted characters, or any recognizable IP.
- The design must look good when zoomed out (thumbnail), not just up close.
- No overly dark or muddy images that will print poorly.
- Avoid extreme micro-details that could turn to noise when printed.
- Encourage centered or balanced compositions that work well as wall decor.

Now design a poster based on this idea: '{user_prompt}'."""
    
    return wrapped_prompt

# ============ IMAGE PROCESSING ============

async def download_image(url: str) -> bytes:
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.read()
            raise HTTPException(status_code=500, detail="Failed to download generated image")

def upscale_image(image_data: bytes, target_width: int = 4961, target_height: int = 7016) -> Image.Image:
    """Upscale image to A2 at 300 DPI (4961 x 7016 pixels)"""
    img = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    
    # Use LANCZOS for high-quality upscaling
    upscaled = img.resize((target_width, target_height), Image.LANCZOS)
    
    return upscaled

def save_image_with_dpi(img: Image.Image, path: Path, dpi: int = 300) -> None:
    """Save image with embedded DPI metadata"""
    img.save(str(path), "JPEG", quality=95, dpi=(dpi, dpi))

def create_pdf(img: Image.Image, pdf_path: Path) -> None:
    """Create print-ready PDF at A2 size"""
    # A2 size in points (72 points per inch)
    width, height = A2
    
    # Save image temporarily
    temp_img_path = pdf_path.with_suffix('.temp.jpg')
    img.save(str(temp_img_path), "JPEG", quality=95)
    
    # Create PDF
    c = canvas.Canvas(str(pdf_path), pagesize=A2)
    c.drawImage(str(temp_img_path), 0, 0, width=width, height=height)
    c.save()
    
    # Clean up temp file
    temp_img_path.unlink()

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role="creator"
    )
    
    # Check if this is the first user - make them admin
    user_count = await db.users.count_documents({})
    if user_count == 0:
        user.role = "admin"
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.role)
    
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            created_at=user.created_at
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['role'])
    
    # Parse created_at
    created_at = user['created_at']
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            role=user['role'],
            created_at=created_at
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    created_at = current_user['created_at']
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        name=current_user['name'],
        role=current_user['role'],
        created_at=created_at
    )

# ============ POSTER ROUTES ============

@api_router.post("/generate-poster", response_model=PosterResponse)
async def generate_poster(request: PosterRequest, current_user: dict = Depends(get_current_user)):
    poster_id = str(uuid.uuid4())
    
    # Build wrapped prompt
    wrapped_prompt = build_wrapped_prompt(request.prompt, request.style_preset)
    
    # Create poster record
    poster = Poster(
        id=poster_id,
        user_id=current_user['id'],
        prompt=request.prompt,
        style_preset=request.style_preset,
        wrapped_prompt=wrapped_prompt,
        preview_url="",
        jpg_url="",
        status="generating"
    )
    
    poster_dict = poster.model_dump()
    poster_dict['created_at'] = poster_dict['created_at'].isoformat()
    await db.posters.insert_one(poster_dict)
    
    try:
        # Generate image with fal.ai FLUX
        # Using portrait A2 ratio: approximately 1536x2176 (1:1.414)
        handler = await fal_client.submit_async(
            "fal-ai/flux/dev",
            arguments={
                "prompt": wrapped_prompt,
                "image_size": {
                    "width": 1536,
                    "height": 2176
                },
                "num_images": 1,
                "enable_safety_checker": True
            }
        )
        
        result = await handler.get()
        
        if not result.get("images") or len(result["images"]) == 0:
            raise HTTPException(status_code=500, detail="No image generated")
        
        image_url = result["images"][0]["url"]
        
        # Download the generated image
        image_data = await download_image(image_url)
        
        # Upscale to A2 at 300 DPI
        upscaled_img = upscale_image(image_data)
        
        # Create preview (smaller version)
        preview_img = upscaled_img.copy()
        preview_img.thumbnail((800, 1132), Image.LANCZOS)
        
        # Save files
        preview_path = POSTERS_DIR / f"{poster_id}_preview.jpg"
        jpg_path = POSTERS_DIR / f"{poster_id}_full.jpg"
        pdf_path = POSTERS_DIR / f"{poster_id}.pdf"
        
        preview_img.save(str(preview_path), "JPEG", quality=85)
        save_image_with_dpi(upscaled_img, jpg_path)
        create_pdf(upscaled_img, pdf_path)
        
        # Update poster record with URLs
        preview_url = f"/api/posters/files/{poster_id}_preview.jpg"
        jpg_url = f"/api/posters/files/{poster_id}_full.jpg"
        pdf_url = f"/api/posters/files/{poster_id}.pdf"
        
        await db.posters.update_one(
            {"id": poster_id},
            {"$set": {
                "preview_url": preview_url,
                "jpg_url": jpg_url,
                "pdf_url": pdf_url,
                "status": "completed"
            }}
        )
        
        return PosterResponse(
            id=poster_id,
            prompt=request.prompt,
            style_preset=request.style_preset,
            preview_url=preview_url,
            jpg_url=jpg_url,
            pdf_url=pdf_url,
            status="completed",
            created_at=poster.created_at
        )
        
    except Exception as e:
        await db.posters.update_one(
            {"id": poster_id},
            {"$set": {"status": "failed"}}
        )
        logging.error(f"Poster generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Poster generation failed: {str(e)}")

@api_router.get("/posters", response_model=List[PosterResponse])
async def get_posters(current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user['id']}
    
    # Admin can see all posters
    if current_user.get('role') == 'admin':
        query = {}
    
    posters = await db.posters.find(query, {"_id": 0, "wrapped_prompt": 0}).sort("created_at", -1).to_list(100)
    
    result = []
    for p in posters:
        created_at = p['created_at']
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        result.append(PosterResponse(
            id=p['id'],
            prompt=p['prompt'],
            style_preset=p['style_preset'],
            preview_url=p.get('preview_url', ''),
            jpg_url=p.get('jpg_url', ''),
            pdf_url=p.get('pdf_url'),
            status=p['status'],
            created_at=created_at
        ))
    
    return result

@api_router.get("/posters/{poster_id}", response_model=PosterResponse)
async def get_poster(poster_id: str, current_user: dict = Depends(get_current_user)):
    query = {"id": poster_id}
    
    # Non-admin can only see their own posters
    if current_user.get('role') != 'admin':
        query["user_id"] = current_user['id']
    
    poster = await db.posters.find_one(query, {"_id": 0, "wrapped_prompt": 0})
    
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    created_at = poster['created_at']
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return PosterResponse(
        id=poster['id'],
        prompt=poster['prompt'],
        style_preset=poster['style_preset'],
        preview_url=poster.get('preview_url', ''),
        jpg_url=poster.get('jpg_url', ''),
        pdf_url=poster.get('pdf_url'),
        status=poster['status'],
        created_at=created_at
    )

@api_router.delete("/posters/{poster_id}")
async def delete_poster(poster_id: str, current_user: dict = Depends(get_current_user)):
    query = {"id": poster_id}
    
    # Non-admin can only delete their own posters
    if current_user.get('role') != 'admin':
        query["user_id"] = current_user['id']
    
    poster = await db.posters.find_one(query)
    
    if not poster:
        raise HTTPException(status_code=404, detail="Poster not found")
    
    # Delete files
    for suffix in ['_preview.jpg', '_full.jpg', '.pdf']:
        file_path = POSTERS_DIR / f"{poster_id}{suffix}"
        if file_path.exists():
            file_path.unlink()
    
    await db.posters.delete_one({"id": poster_id})
    
    return {"message": "Poster deleted successfully"}

# ============ ADMIN ROUTES ============

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    result = []
    for u in users:
        created_at = u['created_at']
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        result.append(UserResponse(
            id=u['id'],
            email=u['email'],
            name=u['name'],
            role=u['role'],
            created_at=created_at
        ))
    
    return result

@api_router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, update_data: AdminUserUpdate, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_fields = {}
    if update_data.role:
        if update_data.role not in ["admin", "creator"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        update_fields["role"] = update_data.role
    
    if update_data.name:
        update_fields["name"] = update_data.name
    
    if update_fields:
        await db.users.update_one({"id": user_id}, {"$set": update_fields})
        user.update(update_fields)
    
    created_at = user['created_at']
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserResponse(
        id=user['id'],
        email=user['email'],
        name=user['name'],
        role=user.get('role', update_data.role or 'creator'),
        created_at=created_at
    )

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin['id']:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user's posters
    user_posters = await db.posters.find({"user_id": user_id}).to_list(1000)
    for poster in user_posters:
        for suffix in ['_preview.jpg', '_full.jpg', '.pdf']:
            file_path = POSTERS_DIR / f"{poster['id']}{suffix}"
            if file_path.exists():
                file_path.unlink()
    
    await db.posters.delete_many({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

@api_router.get("/admin/stats")
async def get_stats(admin: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_posters = await db.posters.count_documents({})
    completed_posters = await db.posters.count_documents({"status": "completed"})
    failed_posters = await db.posters.count_documents({"status": "failed"})
    
    return {
        "total_users": total_users,
        "total_posters": total_posters,
        "completed_posters": completed_posters,
        "failed_posters": failed_posters
    }

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "PosterSmith AI API", "status": "healthy"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

# Serve generated poster files
app.mount("/api/posters/files", StaticFiles(directory=str(POSTERS_DIR)), name="poster_files")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
