# My Music App

A modern React + Vite music web app using the YouTube Data API for search/metadata and the YouTube IFrame Player API for playback.

## Features
- YouTube music/video search
- Embedded YouTube player
- Play/pause, previous/next
- Queue
- Favorites stored in localStorage
- Recently played
- Basic playlists stored in localStorage
- Responsive dark UI
- Optional Brave/Chromium extension for controlling an open YouTube Music tab

## Setup

1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run:

```bash
npm install
```

4. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

5. Put your YouTube Data API key in `.env`:

```env
VITE_YOUTUBE_API_KEY=YOUR_KEY_HERE
```

6. Start:

```bash
npm run dev
```

Open the local URL shown by Vite.

## API key safety

Do not commit `.env`. The included `.gitignore` already ignores it. For a public production application, use a backend/proxy and restrict the Google API key by API and application where possible.

## Brave extension

The `extension/` directory contains an optional Manifest V3 extension. Load it in Brave at:

`brave://extensions/`

Enable Developer mode -> Load unpacked -> select the `extension` folder.

The extension is intended to control an already-open `music.youtube.com` tab. YouTube's DOM can change, so selectors may need maintenance.

## Important

This project does not download or extract YouTube audio. Playback is handled by the YouTube embedded player.
