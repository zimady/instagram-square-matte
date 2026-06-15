# Instagram Square Matte

A tiny static web app/PWA for creating Instagram-ready square images.

## What it does

- Outputs a 1080 × 1080 JPEG
- Uses a white background
- Lets you choose a margin of 0, 5, 10, 15, or 20 px
- Resizes the source image so its longest edge fits within the selected margin
- Centres the image on the square canvas
- Works offline after first load when hosted over HTTPS
- Processes images locally in the browser; images are not uploaded anywhere

## Recommended photo workflow

Export your photo as JPEG in sRGB before using this tool. Browser canvas output is suitable for Instagram-ready derivative files, but it is not intended to preserve archival metadata or ICC profiles.

## Free hosting on GitHub Pages

1. Create a new public GitHub repository.
2. Upload these files to the repository root.
3. Go to Settings → Pages.
4. Under Build and deployment, choose Deploy from a branch.
5. Select the `main` branch and `/root`.
6. Save.
7. Open the GitHub Pages URL on Android.
8. In Chrome, use Add to Home screen / Install app.

## Files

- `index.html` — app shell
- `styles.css` — layout and styling
- `app.js` — image processing
- `manifest.json` — installable PWA metadata
- `sw.js` — offline caching
- `icon.svg` — app icon
