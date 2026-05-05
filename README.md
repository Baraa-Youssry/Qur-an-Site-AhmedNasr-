<div align="center">

# Sacred Echoes

**A bilingual Qur'an reciter website for Sheikh Ahmed Abdelrazek Nasr**

[Live Demo](#) · [Admin Dashboard](#) · [Wiki](./WIKI.md)

</div>

---

## Overview

A modern, elegant web platform for a Qur'an reciter featuring:
- **Audio library** of all 114 Surahs with in-browser playback and download
- **Persistent waveform player** with speed control and volume
- **Featured clips** page with embedded YouTube videos
- **Biographical timeline** showcasing the reciter's journey
- **Admin dashboard** for content management (surahs, clips, settings)
- **Bilingual UI** — Arabic (RTL) and English (LTR) with toggle
- **Dark / Light mode** with glassmorphism design

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Tailwind CSS · Zustand · i18next |
| Backend | Node.js · Express |
| Database | PostgreSQL on Supabase (with Auth) |
| File Storage | Cloudflare R2 (zero egress fees) |
| Deployment | Netlify (frontend) · Render (backend) |

## Features

### Public Site
- 114-surah grid with search and Makki/Madani filter
- Persistent bottom audio player with waveform visualization
- Featured YouTube clips with lazy loading
- Biographical timeline on the About page
- Contact page with social links
- Dark mode (Deep Navy + Gold + Emerald) and Light mode
- Full RTL/LTR support

### Admin Dashboard
- Secure login via Supabase Auth
- Upload audio files directly to Cloudflare R2
- Manage surahs (create, edit, publish, delete)
- Manage clips (create, reorder, publish, delete)
- Site settings (reciter name, bio, profile image)
- Social links manager
- Milestone timeline editor
- Storage usage statistics

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (with tables migrated)
- Cloudflare R2 bucket with API tokens

### Installation

```bash
# Clone the repository
git clone https://github.com/MohamedFouad72/Ahmed-Abdelrazek-Nasr.git
cd Ahmed-Abdelrazek-Nasr

# Backend setup
cd backend
npm install
cp .env.example .env    # Fill in your credentials
npm run dev              # Starts on http://localhost:4000

# Frontend setup
cd ../frontend
npm install
cp .env.example .env    # Set VITE_API_URL
npm run dev              # Starts on http://localhost:5173
```

### Environment Variables

See [WIKI.md](./WIKI.md#3-environment-variables) for full reference.

**Backend `.env`:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
R2_AUDIO_BUCKET=quran-audio
R2_IMAGES_BUCKET=quran-images
R2_AUDIO_PUBLIC_URL=https://pub-xxx.r2.dev
R2_IMAGES_PUBLIC_URL=https://pub-xxx.r2.dev
CLIENT_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:4000/api
```

### Database Migration

Run `backend/migrations/001_initial_schema.sql` in the Supabase SQL Editor, or use:
```bash
cd backend && node migrate.js
```

## Project Structure

```
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/       # Supabase client, env validation
│   │   ├── middleware/   # Auth, rate limiting, error handling
│   │   ├── routes/       # API route definitions
│   │   ├── controllers/  # Business logic
│   │   └── services/     # R2 storage, YouTube helper
│   └── migrations/       # SQL schema
│
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/   # Reusable UI + layout
│   │   ├── pages/        # Route pages
│   │   ├── store/        # Zustand state
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client
│   │   └── i18n/         # Translations
│   └── public/locales/   # AR + EN translation files
│
├── WIKI.md           # Full project documentation
└── Plan.md           # Implementation plan
```

## Design

| Aspect | Detail |
|---|---|
| Dark background | `#050d1a` (Deep Navy) |
| Light background | `#fdfdfb` (Warm Parchment) |
| Primary accent | `#c9a84c` (Islamic Gold) |
| Secondary accent | `#00c896` (Emerald) |
| Arabic font | Amiri |
| English font | Poppins (headings) + Inter (body) |
| Visual style | Glassmorphism (frosted glass + blur) |

## Documentation

- **[WIKI.md](./WIKI.md)** — Architecture, API reference, database schema, workflows, troubleshooting
- **[Plan.md](./Plan.md)** — Original implementation plan
- **[design.md](./design.md)** — Design brief and visual specifications

## License

Private — All rights reserved.
