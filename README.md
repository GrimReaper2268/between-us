# Between Us Web

A responsive mobile-friendly version of the romantic UAE-to-Kerala countdown.

## Run Locally

Open `index.html` directly in a browser, or use a tiny static server:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Add Your Own Music

Two options:

- Click **Music** in the app and choose an audio file from your device.
- Put your own file at `assets/music.mp3` before deploying.

Browsers do not allow websites to permanently remember a private local file path, so the file picker is session-based. For a deployed default song, use `assets/music.mp3`.

## Deploy

This is a static site. Push this folder to GitHub and enable GitHub Pages, or deploy it as-is to Netlify/Vercel/Cloudflare Pages.
