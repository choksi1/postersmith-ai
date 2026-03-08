# PosterSmith AI

An AI-powered web application for Etsy sellers to create print-ready wall art posters and generate SEO-optimized listings.

![PosterSmith AI](https://img.shields.io/badge/PosterSmith-AI-violet)
![React](https://img.shields.io/badge/React-19-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## Features

### Poster Generation
- **AI-Powered Design**: Generate stunning posters from a single line description using FLUX.2
- **6 Style Presets**: Minimalist, Boho, Vintage, Kids, Abstract, Photo-Real
- **Print-Ready Output**: A2 size (42×59.4 cm) at 300 DPI (4961×7016 pixels)
- **Multiple Formats**: Download as high-res JPG or print-ready PDF

### Listing Management
- **AI-Generated Content**: Create Etsy-optimized titles, descriptions, and tags using GPT-5.2
- **SEO Optimization**: Titles up to 140 characters, 13 tags (max 20 chars each)
- **Category Selection**: Primary and secondary Etsy categories
- **One-Click Copy**: Copy title, description, or tags to clipboard instantly

### User Management
- **Role-Based Access**: Admin and Creator roles
- **JWT Authentication**: Secure token-based authentication
- **Admin Dashboard**: User management and platform statistics

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Tailwind CSS, Shadcn UI |
| Backend | FastAPI (Python 3.11) |
| Database | MongoDB |
| Image Generation | fal.ai FLUX.2 |
| Text Generation | OpenAI GPT-5.2 |
| Image Processing | Pillow, ReportLab |

## Prerequisites

Before running locally, ensure you have:

- **Node.js** v18+ and **Yarn**
- **Python** 3.11+
- **MongoDB** running locally or a MongoDB Atlas connection string
- **fal.ai API Key** - Get from [fal.ai](https://fal.ai/dashboard/keys)

## Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── generated_posters/ # Generated poster files
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React app
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth)
│   │   └── components/ui/ # Shadcn UI components
│   ├── package.json       # Node dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   └── .env              # Frontend environment variables
└── README.md
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd postersmith-ai
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install
```

### 4. Environment Variables

#### Backend (`/backend/.env`)

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="postersmith_db"
CORS_ORIGINS="http://localhost:3000"
FAL_KEY="your-fal-ai-api-key"
JWT_SECRET="your-secret-key-change-in-production"
EMERGENT_LLM_KEY="your-openai-compatible-key"
```

#### Frontend (`/frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Running in Development Mode

### Option 1: Run Both Services Separately

#### Terminal 1 - Start Backend

```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

# Run FastAPI with hot reload
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will be available at `http://localhost:8001`

#### Terminal 2 - Start Frontend

```bash
cd frontend

# Run React development server
yarn start
```

The frontend will be available at `http://localhost:3000`

### Option 2: Using Scripts (if available)

```bash
# From project root
./scripts/start-dev.sh
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Posters

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-poster` | Generate a new poster |
| GET | `/api/posters` | Get all user's posters |
| GET | `/api/posters/{id}` | Get specific poster |
| DELETE | `/api/posters/{id}` | Delete a poster |

### Listings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/listings/generate` | Generate listing for poster |
| GET | `/api/listings` | Get all user's listings |
| GET | `/api/listings/{poster_id}` | Get specific listing |
| PUT | `/api/listings/{poster_id}` | Update listing |
| DELETE | `/api/listings/{poster_id}` | Delete listing |

### Admin (requires admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/{id}` | Update user role |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/stats` | Get platform statistics |

## Usage Guide

### 1. First-Time Setup

1. Register an account (first user automatically becomes admin)
2. Navigate to Workspace

### 2. Creating a Poster

1. Enter a one-line description (e.g., "A serene mountain landscape at sunset")
2. Select a style preset
3. Click "Generate Poster"
4. Download JPG or PDF when complete

### 3. Creating an Etsy Listing

1. Go to "Manage Listings"
2. Select a completed poster
3. Click "Generate & Save"
4. Review and edit the generated title, description, and tags
5. Copy content to your Etsy listing

## Poster Specifications

| Property | Value |
|----------|-------|
| Size | A2 (42 × 59.4 cm) |
| Resolution | 300 DPI |
| Dimensions | 4961 × 7016 pixels |
| Aspect Ratio | 1:1.414 (Portrait) |
| Formats | JPG (300 DPI embedded), PDF |

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community
```

### Port Already in Use

```bash
# Find process using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>
```

### Frontend Can't Connect to Backend

1. Ensure backend is running on port 8001
2. Check `REACT_APP_BACKEND_URL` in frontend `.env`
3. Verify CORS_ORIGINS includes your frontend URL

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for Etsy sellers
