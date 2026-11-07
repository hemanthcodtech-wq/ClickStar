# ClickStar

Full-stack application with Vite/React frontend and Express backend connected to Neon DB (PostgreSQL) and Cloudinary.

## Project Structure

```
ClickStar/
├── client/         # React + Vite frontend
└── server/         # Express backend with Neon DB & Cloudinary
```

## Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Variables in [`.env`](file:///Users/hemanthkancharla/Documents/zewotech/ClickStar/server/.env):
   - `PORT`: Port for the Express server (default: `5000`)
   - `DATABASE_URL`: Connection string from your [Neon Console](https://console.neon.tech)
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
   - `CLIENT_URL`: Client URL for CORS (default: `http://localhost:5173`)

3. Run the backend:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/posts` - Fetch all posts / uploaded media from Neon DB
- `POST /api/posts` - Upload image (Cloudinary) and save metadata (Neon DB)
  - `Content-Type: multipart/form-data`
  - Body: `image` (file), `title` (text), `description` (text)
- `DELETE /api/posts/:id` - Delete post from Neon DB and remove asset from Cloudinary

