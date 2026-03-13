# Pest Control Landing Page (Static)

## Run locally

- Open `index.html` directly in a browser, or
- Serve the folder:
  - PowerShell: `python -m http.server 8080` (from this `website/` folder), then open `http://localhost:8080`

## Edit HTML (split into partials)

- Edit files in `src/partials/`
- Rebuild `index.html`: `node website/build.cjs`

## Customize

- Company name/phone/email/address: edit `js/config.js`
- Colors/spacing: edit `styles.css`
- Language + theme: handled in `js/` (auto-detects system, then saves user toggles in localStorage)
- Contact form delivery:
  - Default: opens visitor email client (`mailto:`)
  - Recommended: set `CONTACT_FORM_ENDPOINT` in `js/config.js` to your form backend endpoint (Formspree/Getform/etc)

## Images

- Replace placeholder SVGs in `assets/` with real photos (same filenames to keep HTML unchanged).
