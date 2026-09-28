# MediaSaver
(https://mediasaver-57yu.onrender.com)
> Download videos and audio from any supported social or media platform instantly.

MediaSaver is a high-performance, ad-free web application that takes any media link and provides direct, downloadable MP4 (video) or MP3 (audio) streams with exact file sizes and quality options.

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, JavaScript
- **Backend:** Node.js, Express
- **Core Libraries:** `yt-dlp-exec` (extraction), `fluent-ffmpeg` & `ffmpeg-static` (Audio extraction, MP3 conversion, lossless video muting)

## Features
- **Multi-Platform Support:** Extract media from 12+ major platforms including YouTube, Instagram, Facebook, X (Twitter), Reddit, LinkedIn, Snapchat, Pinterest, Threads, Vimeo, Twitch, and Dailymotion and from music plaforms.
- **All available formats:** Downloads all available formats of the media including video, audio, muted video and many more. 
- **Reliable Architecture:** High reliability without costly residential proxies, utilizing distributed multi-instance resolvers and specialized scrapers.


## Setup

### Prerequisites
- Node.js (v18 or newer)
*(FFmpeg is automatically managed via `ffmpeg-static`—no manual system installation required).*

### 1. Clone the repository
```bash
git clone https://github.com/PurushottamBarai/mediasaver.git
cd mediasaver
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

#### Environment Variables (Backend `.env` / Render Dashboard):
- `PORT` (default: `3001`): Backend server port.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Running Tests
Run the test suite against your local backend or production API:
```bash
# Test local backend (http://localhost:3001)
node test_urls.mjs

# Test production deployment
API_URL=https://mediasaver-57yu.onrender.com node test_urls.mjs
```

## Usage
1. Ensure both your backend (`http://localhost:3001`) and frontend (`http://localhost:5173`) servers are running.
2. Open the frontend in your browser.
3. Paste a supported media URL into the input field.
4. Select your preferred format: **Video (MP4)**, **Audio (MP3)**, or **Video (No Sound)**.
5. Click **Extract** to inspect the video details, duration, and available qualities.
6. Choose your desired quality from the dropdown (with file sizes displayed).
7. Click **Download file** to save the media immediately.

## Folder Structure
- `/frontend` — React SPA built with Vite containing all UI components, prerender scripts, and styling.
- `/backend` — Express API responsible for parsing URLs, running `yt-dlp`, specialized scrapers, multi-instance YouTube resolution, FFmpeg audio conversion, and streaming.

## Disclaimer
This project is built strictly for personal, educational, and fair-use archiving purposes. Users are responsible for ensuring their downloads respect copyright laws and the Terms of Service of the respective platforms.

