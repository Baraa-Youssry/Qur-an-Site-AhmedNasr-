# Qur'an Reciter Website — Full Implementation Plan

> **Target Stack:** React 18 + Tailwind CSS (Frontend) · Node.js / Express (Backend) · PostgreSQL on Supabase (Database + Storage) · Netlify (Frontend Hosting) · Render (Backend Hosting)
> **Languages:** Arabic (primary, RTL) + English (secondary, LTR toggle)
> **Design Directive:** Elegant, minimal, religiously respectful. Clean typography, calm palette (deep greens / gold / cream). Fully responsive.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Final Feature List](#2-final-feature-list)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [File & Folder Structure](#5-file--folder-structure)
6. [Phase 0 — Project Setup](#phase-0--project-setup)
7. [Phase 1 — Database & Storage Setup](#phase-1--database--storage-setup)
8. [Phase 2 — Backend API](#phase-2--backend-api)
9. [Phase 3 — Frontend Core](#phase-3--frontend-core)
10. [Phase 4 — Public Pages](#phase-4--public-pages)
11. [Phase 5 — Admin Dashboard](#phase-5--admin-dashboard)
12. [Phase 6 — Internationalization (i18n)](#phase-6--internationalization-i18n)
13. [Phase 7 — Testing](#phase-7--testing)
14. [Phase 8 — Deployment](#phase-8--deployment)
15. [Phase 9 — Post-Launch Checklist](#phase-9--post-launch-checklist)
16. [Environment Variables Reference](#environment-variables-reference)

---

## 1. Project Overview

A bilingual (Arabic primary / English secondary) website for a Qur'an reciter with:
- A public audio library of all 114 Surahs with in-browser playback and download.
- A featured clips page embedding YouTube videos.
- A secure admin dashboard for the reciter to manage all content.
- A persistent bottom audio player that survives navigation.
- A reciter bio/about page and a contact + social links section.

---

## 2. Final Feature List

### Public Site
| Feature | Notes |
|---|---|
| Surah audio library | All 114 Surahs, one recording each |
| Surah metadata | Number, Arabic name, transliterated name, Makki/Madani, Ayah count |
| Search & filter | By name or number; client-side filtering |
| In-browser audio playback | Persistent bottom player using Howler.js |
| Download button | Direct download from Supabase CDN URL |
| Featured clips page | YouTube iframe embeds only |
| About / Bio page | Reciter biography |
| Contact & social links | Configurable links (YouTube, Instagram, etc.) + optional contact form |
| Bilingual UI | Arabic (RTL) default; toggle to English (LTR) |
| SEO metadata | Per-page Open Graph + meta tags |
| Mobile-first responsive | All pages work on mobile, tablet, desktop |

### Admin Dashboard (private, authenticated)
| Feature | Notes |
|---|---|
| Login | Email + password via Supabase Auth |
| Password reset | Email-based reset link |
| Upload Surah audio | MP3/AAC, with metadata (name AR/EN, number, type) |
| Manage Surahs | Edit metadata, replace audio file, delete |
| Add YouTube clip | Title AR/EN, YouTube URL, description, thumbnail |
| Manage clips | Edit, reorder (drag-and-drop), publish/draft toggle, delete |
| Storage usage indicator | Show % of Supabase storage used |
| Social links manager | CRUD for social link entries shown on public site |
| Site settings | Reciter name, bio, contact email |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Client (Browser)                       │
│  React 18 + Tailwind + React Router + i18next + Zustand  │
│  Hosted on Netlify (custom domain, HTTPS)                │
└────────────────────┬─────────────────────────────────────┘
                     │ REST API (HTTPS)
┌────────────────────▼─────────────────────────────────────┐
│              Backend API (Node.js / Express)              │
│  JWT Auth middleware · Multer uploads · Supabase client  │
│  Hosted on Render (Web Service + Cron Job)               │
└────────────────────┬─────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────┐
│                  Supabase (Cloud)                         │
│  PostgreSQL DB · Storage (Audio files CDN) · Auth        │
└──────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **Supabase Storage** serves audio files directly to the browser via CDN public URLs. The backend never proxies audio bytes — it only manages metadata and signed upload URLs.
- **JWT tokens** issued by the backend after Supabase Auth confirms the admin's credentials.
- **Cron job on Render** runs nightly to clean up expired password reset tokens from the DB.
- **Frontend language direction** switches `<html dir="rtl/ltr">` and loads the correct i18n namespace.

---

## 4. Database Schema

### Table: `surahs`
```sql
CREATE TABLE surahs (
  id            SERIAL PRIMARY KEY,
  number        SMALLINT NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 114),
  name_ar       VARCHAR(100) NOT NULL,
  name_en       VARCHAR(100) NOT NULL,
  revelation    VARCHAR(10) NOT NULL CHECK (revelation IN ('Makki', 'Madani')),
  ayah_count    SMALLINT NOT NULL,
  audio_url     TEXT NOT NULL,         -- Supabase Storage public CDN URL
  audio_path    TEXT NOT NULL,         -- Internal storage path (for deletion)
  duration_sec  INTEGER,               -- Audio duration in seconds
  file_size_kb  INTEGER,               -- File size for storage indicator
  is_published  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `clips`
```sql
CREATE TABLE clips (
  id            SERIAL PRIMARY KEY,
  title_ar      VARCHAR(200) NOT NULL,
  title_en      VARCHAR(200) NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  youtube_url   TEXT NOT NULL,          -- Full YouTube URL
  youtube_id    VARCHAR(20) NOT NULL,   -- Extracted ID for iframe src
  sort_order    SMALLINT DEFAULT 0,
  is_published  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `social_links`
```sql
CREATE TABLE social_links (
  id         SERIAL PRIMARY KEY,
  platform   VARCHAR(50) NOT NULL,   -- e.g. 'youtube', 'instagram', 'twitter'
  url        TEXT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  is_active  BOOLEAN DEFAULT TRUE
);
```

### Table: `site_settings`
```sql
CREATE TABLE site_settings (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT
);
-- Seed rows: reciter_name_ar, reciter_name_en, bio_ar, bio_en, contact_email
```

### Table: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. File & Folder Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js          # Supabase client init
│   │   │   └── env.js               # Validated env vars (zod)
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verify middleware
│   │   │   ├── rateLimiter.js       # express-rate-limit configs
│   │   │   └── validate.js          # Zod request validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # POST /login, POST /forgot-password, POST /reset-password
│   │   │   ├── surahs.routes.js     # GET /surahs, POST/PUT/DELETE (admin)
│   │   │   ├── clips.routes.js      # GET /clips, POST/PUT/DELETE/reorder (admin)
│   │   │   ├── settings.routes.js   # GET/PUT site settings, social links
│   │   │   └── upload.routes.js     # POST /admin/upload (Multer → Supabase Storage)
│   │   ├── controllers/             # Business logic per route
│   │   ├── services/
│   │   │   ├── supabaseStorage.js   # Upload / delete / get storage usage
│   │   │   ├── emailService.js      # Nodemailer password reset emails
│   │   │   └── youtubeHelper.js     # Extract YouTube ID from URL
│   │   ├── jobs/
│   │   │   └── cleanExpiredTokens.js # Cron: delete expired reset tokens
│   │   └── app.js                   # Express app setup
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── locales/
│   │       ├── ar/
│   │       │   └── translation.json
│   │       └── en/
│   │           └── translation.json
│   ├── src/
│   │   ├── assets/               # Logo, decorative SVGs
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── player/
│   │   │   │   ├── PersistentPlayer.jsx   # Sticky bottom audio bar
│   │   │   │   └── SurahRow.jsx           # Row with play + download buttons
│   │   │   ├── clips/
│   │   │   │   └── ClipCard.jsx           # YouTube iframe card
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── SurahForm.jsx
│   │   │   │   ├── ClipForm.jsx
│   │   │   │   └── DraggableClipList.jsx  # Drag-and-drop reorder
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Toast.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── LanguageToggle.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LibraryPage.jsx        # 114 Surahs
│   │   │   ├── FeaturedClipsPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLoginPage.jsx
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminSurahs.jsx
│   │   │       ├── AdminClips.jsx
│   │   │       └── AdminSettings.jsx
│   │   ├── store/
│   │   │   ├── playerStore.js     # Zustand: current track, playing state
│   │   │   └── authStore.js       # Zustand: admin token, user
│   │   ├── hooks/
│   │   │   ├── useAudio.js        # Howler.js wrapper hook
│   │   │   └── useAdmin.js        # Admin auth guard hook
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + all API calls
│   │   ├── i18n/
│   │   │   └── index.js           # i18next config
│   │   ├── utils/
│   │   │   └── formatters.js      # Duration, file size, etc.
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind directives + CSS vars
│   ├── .env
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## Phase 0 — Project Setup

### Task 0.1 — Initialize Repositories
```bash
mkdir quran-reciter && cd quran-reciter
git init
mkdir backend frontend
```

### Task 0.2 — Backend Init
```bash
cd backend
npm init -y
npm install express cors helmet morgan dotenv zod \
  @supabase/supabase-js jsonwebtoken bcryptjs \
  multer multer-storage multer-s3 \
  nodemailer express-rate-limit express-validator \
  node-cron crypto
npm install --save-dev nodemon
```

Add to `package.json` scripts:
```json
"scripts": {
  "dev": "nodemon src/app.js",
  "start": "node src/app.js"
}
```

### Task 0.3 — Frontend Init
```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install react-router-dom@6 axios zustand \
  @tanstack/react-query howler \
  i18next react-i18next i18next-http-backend \
  @dnd-kit/core @dnd-kit/sortable \
  react-hot-toast
npm install --save-dev tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Task 0.4 — Tailwind Config
In `tailwind.config.js`, configure the color palette and font families:
```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#1a3a2a', light: '#2d5c40', dark: '#0f2219' },
        gold:     { DEFAULT: '#c9a84c', light: '#e0c068', dark: '#a08030' },
        cream:    { DEFAULT: '#f5f0e8', dark: '#e8e0d0' },
        surface:  '#ffffff',
      },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', 'serif'],
        latin:  ['"Crimson Pro"', 'serif'],
      },
    },
  },
};
```

Add Google Fonts to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Crimson+Pro:wght@400;500;600&display=swap" rel="stylesheet">
```

### Task 0.5 — Environment Files
Create `backend/.env`:
```
PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
JWT_EXPIRES_IN=7d
NODEMAILER_HOST=
NODEMAILER_PORT=587
NODEMAILER_USER=
NODEMAILER_PASS=
EMAIL_FROM=
CLIENT_URL=https://yourdomain.com
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:4000/api
```

---

## Phase 1 — Database & Storage Setup

### Task 1.1 — Create Supabase Project
1. Go to supabase.com → New Project.
2. Set a strong DB password. Save it.
3. Note your Project URL and `service_role` key.

### Task 1.2 — Run Migrations
In Supabase SQL Editor, run the schema from Section 4 in order:
1. `surahs`
2. `clips`
3. `social_links`
4. `site_settings`
5. `password_reset_tokens`

Seed `site_settings`:
```sql
INSERT INTO site_settings (key, value) VALUES
  ('reciter_name_ar', 'اسم القارئ'),
  ('reciter_name_en', 'Reciter Name'),
  ('bio_ar', ''),
  ('bio_en', ''),
  ('contact_email', '');
```

### Task 1.3 — Supabase Storage Bucket
1. Storage → New Bucket → name: `audio` → Public: **ON**
2. Set CORS policy to allow your domain and `localhost`.
3. Storage policy: allow public reads; allow authenticated service-role writes/deletes.

### Task 1.4 — Create DB Indexes
```sql
CREATE INDEX idx_surahs_number ON surahs(number);
CREATE INDEX idx_clips_sort    ON clips(sort_order);
CREATE INDEX idx_reset_tokens  ON password_reset_tokens(token_hash, expires_at);
```

---

## Phase 2 — Backend API

### Task 2.1 — Express App Shell (`src/app.js`)
```js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/surahs',   require('./routes/surahs.routes'));
app.use('/api/clips',    require('./routes/clips.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/admin',    require('./routes/upload.routes'));

app.listen(process.env.PORT || 4000);
```

### Task 2.2 — Auth Routes (`/api/auth`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/login` | Validate email+password via Supabase Auth, return JWT |
| `POST` | `/forgot-password` | Generate token, send reset email |
| `POST` | `/reset-password` | Validate token, update password in Supabase Auth |
| `GET`  | `/me` | Return current admin info (JWT protected) |

**Login flow:**
1. Accept `{ email, password }`.
2. Call `supabase.auth.signInWithPassword({ email, password })`.
3. On success, sign and return a JWT with `{ adminId, email }`.
4. Apply rate limiting: max 10 attempts per 15 minutes per IP.

**Password reset flow:**
1. `POST /forgot-password` → generate a 64-byte random token, hash it (SHA-256), store in `password_reset_tokens` with 1-hour expiry. Send unhashed token in email link: `CLIENT_URL/admin/reset-password?token=...`
2. `POST /reset-password` → hash the incoming token, look up unexpired record, call `supabase.auth.admin.updateUserById()` to update password, mark token as `used = true`.

### Task 2.3 — Surahs Routes (`/api/surahs`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Return all published Surahs ordered by number |
| `GET` | `/:id` | ❌ | Return a single Surah |
| `POST` | `/` | ✅ | Create Surah record (after audio upload) |
| `PUT` | `/:id` | ✅ | Update metadata or replace audio URL |
| `DELETE` | `/:id` | ✅ | Delete Surah + delete audio file from Storage |

### Task 2.4 — Clips Routes (`/api/clips`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Return all published clips ordered by `sort_order` |
| `POST` | `/` | ✅ | Create clip (extract YouTube ID from URL) |
| `PUT` | `/:id` | ✅ | Update clip metadata or toggle published |
| `PUT` | `/reorder` | ✅ | Accept `[{ id, sort_order }]` array, bulk update |
| `DELETE` | `/:id` | ✅ | Delete clip |

YouTube ID extraction utility:
```js
// services/youtubeHelper.js
function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
```

### Task 2.5 — Upload Route (`/api/admin/upload`)

**POST `/api/admin/upload/audio`** (JWT protected)
1. Use Multer with `memoryStorage()`.
2. Validate: MIME must be `audio/mpeg` or `audio/aac`. Max size: 50MB.
3. Upload buffer to Supabase Storage: `audio/surah-${number}.mp3`.
4. Return `{ publicUrl, storagePath, fileSizeKb }`.

```js
const { data, error } = await supabase.storage
  .from('audio')
  .upload(storagePath, fileBuffer, {
    contentType: file.mimetype,
    upsert: true,
  });
const { data: { publicUrl } } = supabase.storage
  .from('audio')
  .getPublicUrl(storagePath);
```

### Task 2.6 — Settings Routes (`/api/settings`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Return all site_settings key/value pairs |
| `PUT` | `/` | ✅ | Upsert settings by key |
| `GET` | `/social-links` | ❌ | Return all active social links |
| `POST` | `/social-links` | ✅ | Create a social link |
| `PUT` | `/social-links/:id` | ✅ | Update a social link |
| `DELETE` | `/social-links/:id` | ✅ | Delete a social link |

### Task 2.7 — Cron Job (`src/jobs/cleanExpiredTokens.js`)
```js
const cron = require('node-cron');
const supabase = require('../config/supabase');

// Runs every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  await supabase
    .from('password_reset_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString());
});
```

Import this in `app.js` so Render's cron instance keeps it alive.

---

## Phase 3 — Frontend Core

### Task 3.1 — React Router Setup (`App.jsx`)
```jsx
<Routes>
  {/* Public */}
  <Route path="/"           element={<Layout />}>
    <Route index            element={<HomePage />} />
    <Route path="library"   element={<LibraryPage />} />
    <Route path="clips"     element={<FeaturedClipsPage />} />
    <Route path="about"     element={<AboutPage />} />
    <Route path="contact"   element={<ContactPage />} />
  </Route>

  {/* Admin */}
  <Route path="/admin/login"          element={<AdminLoginPage />} />
  <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
  <Route path="/admin"                element={<AdminGuard><AdminLayout /></AdminGuard>}>
    <Route index                      element={<AdminDashboard />} />
    <Route path="surahs"              element={<AdminSurahs />} />
    <Route path="clips"               element={<AdminClips />} />
    <Route path="settings"            element={<AdminSettings />} />
  </Route>
</Routes>
```

`AdminGuard` reads `authStore` and redirects to `/admin/login` if no valid token.

### Task 3.2 — Zustand Stores

**`playerStore.js`**
```js
import { create } from 'zustand';
export const usePlayerStore = create((set) => ({
  currentSurah: null,     // Full surah object
  isPlaying: false,
  progress: 0,
  duration: 0,
  setCurrentSurah: (s) => set({ currentSurah: s, isPlaying: true }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setProgress: (v) => set({ progress: v }),
  setDuration: (v) => set({ duration: v }),
}));
```

**`authStore.js`**
```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create(persist((set) => ({
  token: null,
  admin: null,
  setAuth: (token, admin) => set({ token, admin }),
  logout: () => set({ token: null, admin: null }),
}), { name: 'admin-auth' }));
```

### Task 3.3 — Howler Audio Hook (`hooks/useAudio.js`)

```js
import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../store/playerStore';

export function useAudio() {
  const howlRef = useRef(null);
  const { currentSurah, isPlaying, setIsPlaying, setProgress, setDuration } = usePlayerStore();

  useEffect(() => {
    if (!currentSurah) return;
    if (howlRef.current) howlRef.current.unload();

    howlRef.current = new Howl({
      src: [currentSurah.audio_url],
      html5: true,
      onload: () => setDuration(howlRef.current.duration()),
      onend: () => setIsPlaying(false),
    });

    howlRef.current.play();

    const interval = setInterval(() => {
      if (howlRef.current?.playing()) {
        setProgress(howlRef.current.seek());
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentSurah]);

  useEffect(() => {
    if (!howlRef.current) return;
    isPlaying ? howlRef.current.play() : howlRef.current.pause();
  }, [isPlaying]);

  const seek = (seconds) => howlRef.current?.seek(seconds);
  return { seek };
}
```

### Task 3.4 — API Service Layer (`services/api.js`)
```js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Public
export const getSurahs    = () => api.get('/surahs');
export const getClips     = () => api.get('/clips');
export const getSettings  = () => api.get('/settings');
export const getSocialLinks = () => api.get('/settings/social-links');

// Admin Auth
export const login        = (data) => api.post('/auth/login', data);
export const forgotPwd    = (data) => api.post('/auth/forgot-password', data);
export const resetPwd     = (data) => api.post('/auth/reset-password', data);

// Admin Surahs
export const uploadAudio  = (formData) => api.post('/admin/upload/audio', formData);
export const createSurah  = (data) => api.post('/surahs', data);
export const updateSurah  = (id, data) => api.put(`/surahs/${id}`, data);
export const deleteSurah  = (id) => api.delete(`/surahs/${id}`);

// Admin Clips
export const createClip   = (data) => api.post('/clips', data);
export const updateClip   = (id, data) => api.put(`/clips/${id}`, data);
export const reorderClips = (data) => api.put('/clips/reorder', data);
export const deleteClip   = (id) => api.delete(`/clips/${id}`);

// Admin Settings
export const updateSettings   = (data) => api.put('/settings', data);
export const createSocialLink = (data) => api.post('/settings/social-links', data);
export const updateSocialLink = (id, d) => api.put(`/settings/social-links/${id}`, d);
export const deleteSocialLink = (id)   => api.delete(`/settings/social-links/${id}`);
```

---

## Phase 4 — Public Pages

### Task 4.1 — Layout & Navigation (`components/layout/`)

**Navbar:**
- Logo (right-aligned in RTL, left in LTR) + reciter name.
- Links: Home · Library · Featured Clips · About · Contact.
- Language toggle button (AR / EN) at the far end.
- Hamburger menu for mobile (slide-in drawer).
- Background: `primary.DEFAULT` with gold accent on active link.

**Footer:**
- Reciter name, copyright year.
- Social links icons row (from `social_links` table).
- Brief tagline.

**Persistent Audio Player (`components/player/PersistentPlayer.jsx`):**
- Fixed to bottom of screen, full width.
- Shows: Surah name (AR or EN), play/pause, seek slider, time elapsed / total.
- Only visible when `currentSurah !== null`.
- Uses `useAudio()` hook.
- Height: ~72px. Semi-transparent with backdrop blur.

### Task 4.2 — Library Page (`pages/LibraryPage.jsx`)

1. Fetch surahs via React Query: `useQuery(['surahs'], getSurahs)`.
2. Show a search input (filter by name AR/EN or number — client-side).
3. Render a list of `<SurahRow>` components.
4. Each row shows:
   - Surah number (in Arabic-Indic numerals in AR mode).
   - Arabic name + transliterated name.
   - Revelation type badge (مكية / مدنية).
   - Ayah count.
   - **Play** button → calls `setCurrentSurah(surah)` in playerStore.
   - **Download** button → `<a href={surah.audio_url} download>`.
5. Loading state: skeleton rows. Error state: retry prompt.

### Task 4.3 — Featured Clips Page (`pages/FeaturedClipsPage.jsx`)

1. Fetch clips via React Query.
2. Render a responsive grid of `<ClipCard>` components.
3. Each `ClipCard`:
   - Title (AR or EN based on language).
   - YouTube iframe: `https://www.youtube.com/embed/{youtube_id}` with `loading="lazy"`.
   - Iframe attributes: `allowfullscreen`, `title` for accessibility.
   - Description below iframe (optional).

```jsx
<iframe
  src={`https://www.youtube.com/embed/${clip.youtube_id}`}
  title={clip.title_ar}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  loading="lazy"
  className="w-full aspect-video rounded-lg"
/>
```

### Task 4.4 — Home Page (`pages/HomePage.jsx`)

- Hero section: large Arabic calligraphy / decorative Qur'an motif + reciter name.
- Brief intro (from `site_settings.bio_ar/en`, first 2 sentences).
- "Browse the Library" CTA button.
- Preview of 3 most recent featured clips.
- Social links row.

### Task 4.5 — About Page (`pages/AboutPage.jsx`)

- Full bio from `site_settings` (AR or EN).
- Profile image placeholder (served from Supabase Storage, optional).
- Career highlights (free-text field in settings).

### Task 4.6 — Contact Page (`pages/ContactPage.jsx`)

- Social links displayed as large icon cards with platform name.
- Contact email (click-to-email `mailto:` link).
- Optional: simple message form (name, email, message → POST to `/api/contact` → Nodemailer sends to reciter's email).

---

## Phase 5 — Admin Dashboard

### Task 5.1 — Login Page (`pages/admin/AdminLoginPage.jsx`)

- Email + password fields.
- "Forgot password?" link → shows email input → calls `forgotPwd()`.
- On success: store JWT in `authStore`, redirect to `/admin`.
- Rate limit errors shown gracefully ("Too many attempts, try in 15 minutes").

### Task 5.2 — Reset Password Page

- Reads `?token=` from URL.
- Shows new password + confirm fields.
- On submit: calls `resetPwd({ token, newPassword })`.
- On success: redirects to `/admin/login`.

### Task 5.3 — Dashboard Overview (`pages/admin/AdminDashboard.jsx`)

- Stats cards: Total Surahs uploaded, Total clips, Storage used (%).
- Quick navigation to Surahs, Clips, Settings.
- Storage usage bar: `(totalFileSizeKb / supabase_storage_limit_kb) * 100`.

### Task 5.4 — Admin Surahs (`pages/admin/AdminSurahs.jsx`)

**Upload flow:**
1. Form: Surah number, Arabic name, English name, revelation type, Ayah count.
2. File picker: MP3/AAC only.
3. On submit:
   - `POST /admin/upload/audio` → get `{ publicUrl, storagePath, fileSizeKb }`.
   - `POST /surahs` with metadata + URLs.
4. Progress bar during upload.
5. Surah list table with Edit / Delete actions.
6. Edit modal: can update metadata or re-upload audio.

### Task 5.5 — Admin Clips (`pages/admin/AdminClips.jsx`)

- Form: YouTube URL (auto-validates format + extracts ID), Title AR, Title EN, Description AR/EN, Published toggle.
- Clip list with drag-and-drop reorder (`@dnd-kit`).
- On reorder: optimistic UI update + `PUT /clips/reorder` call.
- Publish/Draft toggle per clip.
- Delete with confirmation modal.

### Task 5.6 — Admin Settings (`pages/admin/AdminSettings.jsx`)

**Three tabs:**

1. **Site Info** — reciter name (AR/EN), bio (AR/EN textarea), contact email.
2. **Social Links** — list of platform + URL entries. Add / Edit / Delete. Drag to reorder.
3. **Security** — Change password form (current password + new password).

---

## Phase 6 — Internationalization (i18n)

### Task 6.1 — i18next Configuration (`src/i18n/index.js`)
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'ar',
    fallbackLng: 'en',
    supportedLngs: ['ar', 'en'],
    backend: { loadPath: '/locales/{{lng}}/translation.json' },
    interpolation: { escapeValue: false },
  });

export default i18n;
```

### Task 6.2 — RTL / LTR Direction Switch (`LanguageToggle.jsx`)
```js
const { i18n } = useTranslation();
const toggle = () => {
  const next = i18n.language === 'ar' ? 'en' : 'ar';
  i18n.changeLanguage(next);
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = next;
};
```

### Task 6.3 — Translation Files

`public/locales/ar/translation.json`:
```json
{
  "nav": {
    "home": "الرئيسية",
    "library": "المكتبة الصوتية",
    "clips": "المقاطع المميزة",
    "about": "نبذة",
    "contact": "التواصل"
  },
  "library": {
    "search": "ابحث عن سورة...",
    "play": "تشغيل",
    "download": "تحميل",
    "makki": "مكية",
    "madani": "مدنية",
    "ayahs": "آية"
  },
  "player": {
    "nowPlaying": "جاري التشغيل"
  }
}
```

Mirror in `en/translation.json` with English values.

---

## Phase 7 — Testing

### Task 7.1 — Backend Tests
Use **Jest + Supertest**.

```
backend/tests/
├── auth.test.js      # Login, invalid creds, rate limit, reset flow
├── surahs.test.js    # CRUD + auth guard
├── clips.test.js     # CRUD + reorder + YouTube ID extraction
└── upload.test.js    # File type validation, size limit
```

Key test cases:
- `POST /api/auth/login` with wrong password returns 401.
- `POST /api/surahs` without JWT returns 401.
- Upload non-audio file returns 400.
- YouTube URL extraction for both `youtube.com/watch?v=` and `youtu.be/` formats.

### Task 7.2 — Frontend Tests
Use **Vitest + React Testing Library**.

```
frontend/src/__tests__/
├── SurahRow.test.jsx       # Play/Download buttons
├── PersistentPlayer.test.jsx
├── ClipCard.test.jsx       # Correct iframe src
├── playerStore.test.js
└── authStore.test.js
```

### Task 7.3 — Manual QA Checklist

- [ ] All 114 Surah rows render correctly.
- [ ] Audio plays in Chrome, Firefox, Safari, iOS Safari, Android Chrome.
- [ ] Persistent player survives navigating between pages.
- [ ] Download works on mobile (no inline preview).
- [ ] YouTube clips load lazily and play in-page.
- [ ] Language toggle switches direction and all text.
- [ ] Admin login, logout, and session expiry all work.
- [ ] Password reset email arrives and link works.
- [ ] Admin can upload, edit, delete a Surah.
- [ ] Admin can add, reorder, publish, delete a clip.
- [ ] All pages render correctly on 375px (iPhone SE) and 768px (iPad).

---

## Phase 8 — Deployment

### Task 8.1 — Deploy Backend to Render

1. Push `backend/` to a GitHub repository.
2. Render → New Web Service → connect repo.
3. Build command: `npm install`
4. Start command: `node src/app.js`
5. Add all environment variables from `.env` in Render's dashboard.
6. Note the service URL (e.g. `https://quran-api.onrender.com`).

**Render Cron Job:**
- Render → New Cron Job → same repo.
- Command: `node src/jobs/cleanExpiredTokens.js`
- Schedule: `0 2 * * *` (2 AM UTC daily).

### Task 8.2 — Deploy Frontend to Netlify

1. Push `frontend/` to GitHub.
2. Netlify → New Site → connect repo.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://quran-api.onrender.com/api`
6. Add a `netlify.toml` for SPA routing:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
7. Attach your custom domain and enable HTTPS (Netlify does this automatically).

### Task 8.3 — Update CORS

In `backend/.env` on Render, update:
```
CLIENT_URL=https://yourcustomdomain.com
```

### Task 8.4 — Supabase Production Config

1. In Supabase dashboard → Authentication → URL Configuration:
   - Site URL: `https://yourcustomdomain.com`
   - Redirect URLs: `https://yourcustomdomain.com/admin/reset-password`
2. Enable "Email" provider under Auth → Providers.
3. Set SMTP config under Auth → SMTP (use your Nodemailer credentials or Supabase's built-in).

---

## Phase 9 — Post-Launch Checklist

- [ ] All 114 Surah audio files uploaded via admin dashboard.
- [ ] Reciter bio and name set in Admin → Settings.
- [ ] Social links added and ordered.
- [ ] Featured clips added, ordered, and published.
- [ ] Custom domain resolves correctly with HTTPS.
- [ ] Test `mailto:` contact link on mobile.
- [ ] Confirm audio CDN URLs load quickly (test from a different region).
- [ ] Run Lighthouse audit on Library page — aim for 90+ Performance, 100 Accessibility.
- [ ] Confirm Google indexing via Google Search Console (submit sitemap).
- [ ] Add basic `robots.txt`: allow public pages, disallow `/admin/`.

---

## Environment Variables Reference

### Backend (Render)
| Variable | Description |
|---|---|
| `PORT` | Express port (Render sets this automatically) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase `service_role` secret key |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | Token lifespan, e.g. `7d` |
| `NODEMAILER_HOST` | SMTP host (e.g. smtp.gmail.com) |
| `NODEMAILER_PORT` | SMTP port (587 for TLS) |
| `NODEMAILER_USER` | SMTP username |
| `NODEMAILER_PASS` | SMTP password or app password |
| `EMAIL_FROM` | From address for reset emails |
| `CLIENT_URL` | Your Netlify domain (for CORS + email links) |

### Frontend (Netlify)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

*End of Implementation Plan*
