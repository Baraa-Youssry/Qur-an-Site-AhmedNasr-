# Sacred Echoes — Project Wiki

> **Reciter:** Ahmed Abdelrazek Nasr
> **Live URL:** *(to be configured)*
> **Stack:** React 18 + Tailwind CSS · Node.js/Express · Supabase (PostgreSQL + Auth) · Cloudflare R2 · Netlify + Render

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Tech Stack & Versions](#2-tech-stack--versions)
3. [Environment Variables](#3-environment-variables)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [File Structure](#6-file-structure)
7. [Design System](#7-design-system)
8. [Key Workflows](#8-key-workflows)
9. [Deployment](#9-deployment)
10. [Troubleshooting](#10-troubleshooting)
11. [TODO / Future Work](#11-todo--future-work)

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Client (Browser)                       │
│  React 18 + Tailwind + Zustand + i18next + React Router  │
│  Hosted on Netlify (custom domain, HTTPS)                │
└────────┬────────────────────────────────────────┬────────┘
         │                                         │
         │ REST API (HTTPS)                        │ CDN (direct)
         │                                         │
┌────────▼─────────────────────┐    ┌──────────────▼──────────┐
│   Backend API (Express)       │    │   Cloudflare R2           │
│   Node.js on Render          │    │   Audio + Image files     │
│   JWT auth via Supabase      │    │   Zero egress fees        │
│   Multer → R2 uploads        │    │   CDN URLs                │
└────────┬─────────────────────┘    └─────────────────────────┘
         │
┌────────▼─────────────────────┐
│   Supabase (Cloud)            │
│   PostgreSQL (data only)       │
│   Auth (login + password reset)│
│   No storage used             │
└──────────────────────────────┘
```

### Key Decisions

- **Auth:** Supabase Auth JWT passed directly to backend. Backend validates via `supabase.auth.getUser(token)`. No custom JWT signing, no password_reset_tokens table, no cron job.
- **Audio storage:** Cloudflare R2 (not Supabase Storage) — zero egress fees, 10GB free, global CDN.
- **Upload flow:** Browser → Backend (Multer memory) → R2 (S3 SDK). Backend extracts audio duration via `music-metadata`.
- **RLS:** Enabled on all Supabase tables. Public read for published content, service_role for all writes.
- **i18n:** Arabic (RTL, default) + English (LTR). Language toggle switches `dir` and `lang` on `<html>`.
- **Theme:** Dark mode (default, Deep Navy) + Light mode (Warm Parchment). Class-based toggle via Zustand + localStorage.

---

## 2. Tech Stack & Versions

### Backend
| Package | Version | Purpose |
|---|---|---|
| express | ^4.21 | HTTP framework |
| @supabase/supabase-js | ^2.49 | DB + Auth client |
| @aws-sdk/client-s3 | ^3.700 | R2 S3-compatible uploads |
| @aws-sdk/lib-storage | ^3.700 | Multipart upload helper |
| multer | ^1.4.5 | File upload middleware (memoryStorage) |
| music-metadata | ^10.9 | Extract audio duration from buffer |
| zod | ^3.24 | Env var validation |
| helmet | ^8.0 | Security headers |
| cors | ^2.8 | CORS with multiple origins |
| express-rate-limit | ^7.5 | Rate limiting (login) |
| morgan | ^1.10 | HTTP logging |
| dotenv | ^16.4 | Environment variables |
| nodemon | ^3.1 | Dev auto-restart |
| pg | ^8.x | Migration runner (dev only) |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| react | ^18.3 | UI framework |
| react-router-dom | ^6.28 | Client-side routing |
| tailwindcss | ^3.4 | Utility-first CSS |
| zustand | ^5.0 | State management (player, auth, theme) |
| @tanstack/react-query | ^5.66 | Server state + caching |
| axios | ^1.7 | HTTP client (unwraps response.data) |
| howler | ^2.2 | Audio playback engine |
| wavesurfer.js | ^7.9 | Audio waveform visualization |
| i18next + react-i18next | ^24/^15 | Internationalization |
| react-helmet-async | ^2.0 | SEO meta tags |
| react-hot-toast | ^2.4 | Toast notifications |
| react-icons | ^5.4 | Icon library (Fi, Hi, Fa) |
| @dnd-kit/core | ^6.3 | Drag-and-drop (installed, available) |
| vite | ^6.0 | Build tool |

---

## 3. Environment Variables

### Backend (`backend/.env`)
```
PORT=4000
SUPABASE_URL=https://kzkscmugoxqzynkzchos.supabase.co
SUPABASE_SERVICE_KEY=<from Supabase Settings → API → service_role>
R2_ACCOUNT_ID=591c9d88adc3460c47be197c88c5b9a5
R2_ACCESS_KEY_ID=<from Cloudflare R2 API Tokens>
R2_SECRET_ACCESS_KEY=<from Cloudflare R2 API Tokens>
R2_ENDPOINT=https://591c9d88adc3460c47be197c88c5b9a5.r2.cloudflarestorage.com
R2_AUDIO_BUCKET=quran-audio
R2_IMAGES_BUCKET=quran-images
R2_AUDIO_PUBLIC_URL=https://pub-099e6da140c84cee965d03954f5825d3.r2.dev
R2_IMAGES_PUBLIC_URL=https://pub-4518d703cdd5452abbd504a9af489714.r2.dev
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000/api
```

### Production Changes
- Backend `CLIENT_URL` → your Netlify domain
- Frontend `VITE_API_URL` → your Render API URL
- Add `netlify.toml` for SPA redirects

---

## 4. Database Schema

All tables in Supabase PostgreSQL with RLS enabled.

### `surahs`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | Auto-increment |
| number | SMALLINT 1-114 | UNIQUE |
| name_ar | VARCHAR(100) | Arabic name |
| name_en | VARCHAR(100) | English name |
| revelation | VARCHAR(10) | 'Makki' or 'Madani' |
| ayah_count | SMALLINT | Number of ayahs |
| audio_url | TEXT | R2 public URL |
| audio_path | TEXT | R2 storage key (for deletion) |
| duration_sec | INTEGER | Extracted via music-metadata |
| file_size_kb | INTEGER | For storage indicator |
| is_published | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### `clips`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| title_ar / title_en | VARCHAR(200) | Bilingual titles |
| description_ar / description_en | TEXT | Optional |
| youtube_url | TEXT | Full URL |
| youtube_id | VARCHAR(20) | Extracted for iframe |
| sort_order | SMALLINT | For drag reorder |
| is_published | BOOLEAN | Default false |
| created_at / updated_at | TIMESTAMPTZ | |

### `social_links`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| platform | VARCHAR(50) | youtube, instagram, etc. |
| url | TEXT | |
| sort_order | SMALLINT | |
| is_active | BOOLEAN | Default true |

### `site_settings`
| Column | Type | Notes |
|---|---|---|
| key | VARCHAR(100) PK | |
| value | TEXT | |

Seeded keys: `reciter_name_ar`, `reciter_name_en`, `bio_ar`, `bio_en`, `contact_email`, `profile_image_url`

### `milestones`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| year | VARCHAR(20) | e.g. "2010" |
| title_ar / title_en | VARCHAR(200) | |
| description_ar / description_en | TEXT | Optional |
| sort_order | SMALLINT | |
| is_active | BOOLEAN | Default true |

### Indexes
- `idx_surahs_number` on surahs(number)
- `idx_surahs_published` on surahs(is_published)
- `idx_clips_sort` on clips(sort_order)
- `idx_clips_published` on clips(is_published)
- `idx_social_links_sort` on social_links(sort_order)
- `idx_milestones_sort` on milestones(sort_order)

### RLS Policies
- Public: SELECT on published/active rows
- Service role: ALL operations (used by backend)

---

## 5. API Reference

Base URL: `http://localhost:4000/api`

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | No | Login with email+password, returns Supabase JWT |
| GET | `/me` | Yes | Get current admin user info |
| POST | `/forgot-password` | No | Sends Supabase password reset email |
| POST | `/reset-password` | No | Reset password using token |

### Surahs (`/api/surahs`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | All published surahs (by number) |
| GET | `/:id` | No | Single surah |
| GET | `/admin/all` | Yes | All surahs incl. drafts |
| GET | `/stats` | Yes | R2 storage usage in KB |
| POST | `/` | Yes | Create surah record |
| PUT | `/:id` | Yes | Update surah (replaces R2 file if URL changed) |
| DELETE | `/:id` | Yes | Delete surah + R2 file |

### Clips (`/api/clips`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Published clips (by sort_order) |
| GET | `/admin/all` | Yes | All clips |
| POST | `/` | Yes | Create clip (extracts YouTube ID) |
| PUT | `/:id` | Yes | Update clip |
| PUT | `/reorder` | Yes | Bulk update sort_order |
| DELETE | `/:id` | Yes | Delete clip |

### Settings (`/api/settings`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | All site_settings as key/value object |
| PUT | `/` | Yes | Upsert settings |
| GET | `/social-links` | No | Active social links |
| GET | `/social-links/admin/all` | Yes | All social links |
| POST | `/social-links` | Yes | Create social link |
| PUT | `/social-links/:id` | Yes | Update social link |
| DELETE | `/social-links/:id` | Yes | Delete social link |
| GET | `/milestones` | No | Active milestones |
| GET | `/milestones/admin/all` | Yes | All milestones |
| POST | `/milestones` | Yes | Create milestone |
| PUT | `/milestones/:id` | Yes | Update milestone |
| DELETE | `/milestones/:id` | Yes | Delete milestone |

### Upload (`/api/admin/upload`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/audio` | Yes | Upload MP3/AAC/WAV to R2 (max 50MB) |
| POST | `/image` | Yes | Upload JPEG/PNG/WebP to R2 (max 10MB) |

Audio upload returns: `{ publicUrl, storagePath, durationSec, fileSizeKb, totalStorageKb }`

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | `{ status: "ok", timestamp: "..." }` |

---

## 6. File Structure

```
project-root/
├── .gitignore
├── README.md
├── WIKI.md
├── Plan.md
├── design.md
├── keys.md                    # SECRETS — never commit
│
├── backend/
│   ├── .env                   # SECRETS — never commit
│   ├── package.json
│   ├── migrate.js             # One-time migration runner
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── src/
│       ├── app.js             # Express app + server config
│       ├── config/
│       │   ├── env.js         # Zod-validated env vars
│       │   └── supabase.js    # Supabase client init
│       ├── middleware/
│       │   ├── auth.js        # Supabase JWT validation
│       │   ├── errorHandler.js
│       │   ├── rateLimiter.js
│       │   └── validate.js    # Zod request validation
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── surahs.routes.js
│       │   ├── clips.routes.js
│       │   ├── settings.routes.js
│       │   └── upload.routes.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── surahs.controller.js
│       │   ├── clips.controller.js
│       │   ├── settings.controller.js
│       │   └── upload.controller.js
│       └── services/
│           ├── r2Storage.js   # Upload/delete/usage via S3 SDK
│           └── youtubeHelper.js
│
├── frontend/
│   ├── .env                   # SECRETS — never commit
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── netlify.toml
│   ├── public/
│   │   ├── favicon.svg
│   │   └── locales/
│   │       ├── ar/translation.json
│   │       └── en/translation.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Routes + providers
│       ├── index.css          # Tailwind + glassmorphism utilities
│       ├── store/
│       │   ├── playerStore.js
│       │   ├── authStore.js
│       │   └── themeStore.js
│       ├── hooks/
│       │   ├── useAudio.js    # Howler.js wrapper
│       │   └── useAdmin.jsx   # Auth guard
│       ├── services/
│       │   └── api.js         # Axios + all API functions
│       ├── i18n/
│       │   └── index.js
│       ├── utils/
│       │   └── formatters.js  # Duration, file size, Arabic numerals
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── Layout.jsx
│       │   ├── player/
│       │   │   ├── PersistentPlayer.jsx  # Waveform + controls
│       │   │   ├── Waveform.jsx          # wavesurfer.js
│       │   │   └── SurahCard.jsx        # Grid card
│       │   ├── clips/
│       │   │   └── ClipCard.jsx
│       │   ├── about/
│       │   │   └── Timeline.jsx
│       │   ├── admin/
│       │   │   └── AdminLayout.jsx
│       │   └── ui/
│       │       ├── Button.jsx
│       │       ├── Input.jsx
│       │       ├── Modal.jsx
│       │       ├── Spinner.jsx
│       │       ├── GlassCard.jsx
│       │       ├── ThemeToggle.jsx
│       │       └── LanguageToggle.jsx
│       └── pages/
│           ├── HomePage.jsx
│           ├── LibraryPage.jsx
│           ├── FeaturedClipsPage.jsx
│           ├── AboutPage.jsx
│           ├── ContactPage.jsx
│           └── admin/
│               ├── AdminLoginPage.jsx
│               ├── AdminDashboard.jsx
│               ├── AdminSurahs.jsx
│               ├── AdminClips.jsx
│               └── AdminSettings.jsx
```

---

## 7. Design System

### Color Palette

#### Dark Mode (default)
| Token | Hex | Usage |
|---|---|---|
| navy | `#050d1a` | Background |
| navy-light | `#0a1a2e` | Subtle bg variation |
| gold | `#c9a84c` | Primary accent, CTAs, active states |
| gold-light | `#e0c068` | Hover states |
| emerald | `#00c896` | Secondary accent, success, badges |

#### Light Mode
| Token | Hex | Usage |
|---|---|---|
| parchment | `#fdfdfb` | Background |
| gold-burnished | `#b08d36` | Primary accent |

### Typography
| Font | Usage |
|---|---|
| Amiri | Arabic text (headings + body) |
| Poppins | English headings |
| Inter | English body text |

### Glassmorphism Classes (in `index.css`)
| Class | Description |
|---|---|
| `.glass` | Semi-transparent bg + blur (dark) |
| `.glass-light` | White semi-transparent bg + blur (light) |
| `.glass-card` | Reusable card with hover effect, auto-switches dark/light |
| `.btn-primary` | Gold button with shadow |
| `.btn-secondary` | Outlined gold button |
| `.btn-danger` | Red outlined button |
| `.input-field` | Form input with focus ring |
| `.text-gradient` | Gold-to-emerald gradient text |

### RTL Rules
- `html[dir="rtl"] body` → Amiri font
- Navbar links and layout auto-flip via Tailwind RTL support
- Toast position: `top-left` in RTL, `top-right` in LTR

---

## 8. Key Workflows

### Admin Login
1. Enter email + password on `/admin/login`
2. Backend calls `supabase.auth.signInWithPassword()`
3. Returns Supabase access_token → stored in Zustand (persisted to localStorage)
4. All admin requests send `Authorization: Bearer <token>`
5. Backend validates via `supabase.auth.getUser(token)`
6. On 401 → auto-logout and redirect to login

### Upload Audio
1. Admin fills surah form + selects MP3 file
2. Frontend POSTs to `/api/admin/upload/audio` (multipart, 5min timeout)
3. Multer stores file in memory
4. Backend uploads buffer to R2 via `@aws-sdk/lib-storage`
5. Extracts duration via `music-metadata.parseBuffer()`
6. Returns `{ publicUrl, storagePath, durationSec, fileSizeKb }`
7. Frontend POSTs to `/api/surahs` with metadata + URLs

### Delete Surah
1. Frontend DELETEs `/api/surahs/:id`
2. Backend fetches `audio_path`, deletes from R2, then deletes DB row

### Audio Playback
1. User clicks play on SurahCard → `setCurrentSurah(surah)` in playerStore
2. `useAudio` hook creates Howler instance with `html5: true`
3. Waveform component loads via wavesurfer.js
4. PersistentPlayer shows: play/pause, waveform, speed controls, volume, download, close
5. Player survives navigation (rendered in Layout, outside Outlet)

### Theme Toggle
1. Toggles `dark` class on `<html>`
2. Persisted to localStorage via Zustand
3. Glassmorphism classes auto-switch via `:not(.dark)` CSS selectors

---

## 9. Deployment

### Backend → Render
1. Push to GitHub
2. Render → New Web Service → connect repo
3. Root directory: `backend`
4. Build: `npm install`
5. Start: `node src/app.js`
6. Add all env vars from `.env`

### Frontend → Netlify
1. Push to GitHub
2. Netlify → New Site → connect repo
3. Root directory: `frontend`
4. Build: `npm run build`
5. Publish: `dist`
6. Add `VITE_API_URL=https://your-api.onrender.com/api`

### Custom Domain
1. Netlify: Add domain → auto-provisions SSL
2. Render: Update `CLIENT_URL` env var
3. R2: Connect custom subdomain (optional)
4. Supabase: Update Site URL + Redirect URLs in Auth settings

### Cron Job (not needed)
Supabase handles password reset natively — no cron job required.

---

## 10. Troubleshooting

### Upload timeout (30s)
- Already fixed: Frontend timeout = 5min, Backend server timeout = 5min
- If still timing out: check R2 bucket region, try smaller file first

### `.map is not a function`
- Already fixed: Added `response.data` unwrap in axios interceptor
- If recurring: check that the API returns an array, not wrapped object

### Missing icon import (e.g. FiVolume2)
- Already fixed: Added missing imports
- Pattern: check `react-icons/fi` exports — some icons have different names

### Supabase RLS blocking reads
- Backend uses `service_role` key which bypasses RLS
- If public reads fail: check RLS policies allow `SELECT` for `anon` role

### Audio not playing
- Howler uses `html5: true` for streaming
- Check R2 public URL is accessible in browser
- Check CORS headers on R2 bucket

### RTL not applying
- Check `html dir="rtl"` attribute is set
- Language toggle in LanguageToggle.jsx switches `document.documentElement.dir`

---

## 11. TODO / Future Work

- [ ] SEO: Add `react-snap` or consider SSR for better indexing
- [ ] PWA: Add service worker for offline audio caching
- [ ] Contact form: POST to backend → Nodemailer (needs SMTP setup)
- [ ] Custom domain setup
- [ ] Sitemap + robots.txt for Google indexing
- [ ] Lighthouse audit (target 90+ Performance)
- [ ] Mobile testing on iOS Safari + Android Chrome
- [ ] Load all 114 surah metadata via seed script
- [ ] Profile image upload tested end-to-end
- [ ] Add @dnd-kit drag-and-drop for clip reorder (installed, not yet wired)
- [ ] Add error boundaries for graceful crash handling
- [ ] Add loading skeletons for all pages
