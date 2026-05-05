# How to Run with Ngrok

## Prerequisites
1. Install ngrok: https://ngrok.com/download
2. Sign up and get authtoken
3. Run: `ngrok config add-authtoken YOUR_TOKEN`

## Steps to Run

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:4000

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

### 3. Expose Backend with Ngrok (Terminal 3)
```bash
ngrok http 4000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.dev`)

### 4. Update Frontend Environment
Edit `frontend/.env` and set:
```
VITE_API_URL=https://abc123.ngrok-free.dev
```

### 5. Expose Frontend with Ngrok (Terminal 4)
```bash
ngrok http 5173
```
Copy the HTTPS URL (e.g., `https://def456.ngrok-free.dev`)

### 6. Access from Any Device
Open the frontend ngrok URL on any device (mobile, tablet, another network).

## Notes
- Backend CORS is configured to accept any URL containing 'ngrok'
- Frontend `allowedHosts` is set to `true` to accept any ngrok URL
- No custom domains needed - avoids ERR_NGROK_6030 error
- Each time you restart ngrok, URLs will change - update `frontend/.env` accordingly
