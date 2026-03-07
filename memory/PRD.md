# PosterSmith AI - Product Requirements Document

## Original Problem Statement
Build an AI web app for Etsy sellers of printable wall art. The app takes a 1-line idea from users and turns it into a fully print-ready, sellable digital poster for Etsy. Posters must always be sized for A2 at 300 DPI (4961×7016 pixels).

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI (Python) + MongoDB
- **Image Generation**: fal.ai FLUX.2 Dev
- **Image Processing**: Pillow (upscaling to A2 300DPI), ReportLab (PDF generation)
- **Authentication**: JWT-based with bcrypt password hashing
- **Storage**: Local file storage for generated posters

## User Personas
1. **Admin**: Full access - manage users, view all posters, generate posters, view platform stats
2. **Creator**: Generate posters, view/download/delete own posters

## Core Requirements (Static)
- A2 poster size: 42×59.4 cm (portrait)
- Print resolution: 300 DPI (4961×7016 pixels)
- Aspect ratio: 1:1.414 (A2 ratio)
- Output formats: JPG (300 DPI embedded) + PDF (print-ready)
- Style presets: minimalist, boho, vintage, kids, abstract, photo-real

## What's Been Implemented (March 7, 2026)

### Backend
- [x] User registration with automatic admin assignment for first user
- [x] JWT authentication with role-based access control
- [x] Poster generation API with fal.ai FLUX.2 integration
- [x] Prompt wrapping with professional design guidelines
- [x] Image upscaling to 4961×7016 px at 300 DPI
- [x] PDF generation at A2 size
- [x] Admin endpoints: stats, user management (CRUD)
- [x] Static file serving for generated posters

### Frontend
- [x] Landing page with professional "Modern Atelier" design
- [x] Login/Register pages with form validation
- [x] Workspace with A2 preview, prompt input, style selector
- [x] Dashboard with poster gallery, download, delete
- [x] Admin panel with stats and user management table
- [x] Protected routes with role-based access
- [x] Responsive design with Libre Baskerville + Manrope fonts

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Rate limiting for poster generation (prevent abuse)
- [ ] Loading state improvements (progress indicator during generation)

### P1 - High Priority
- [ ] Poster editing/regeneration with same prompt
- [ ] Multiple poster generation (batch mode)
- [ ] User profile settings page
- [ ] Password reset functionality

### P2 - Medium Priority
- [ ] Poster categories/tags for organization
- [ ] Search and filter in dashboard
- [ ] Download all posters as ZIP
- [ ] Watermarked preview before final download
- [ ] Usage analytics dashboard

### P3 - Future Enhancements
- [ ] Etsy listing integration (direct upload)
- [ ] Custom aspect ratios (A3, A4, square)
- [ ] Team/workspace collaboration
- [ ] Subscription/credits system
- [ ] Custom style preset creation

## Technical Notes
- fal.ai API key stored in backend/.env as FAL_KEY
- Generated files stored in /app/backend/generated_posters/
- MongoDB database: postersmith_db
- JWT secret: configured in backend/.env
