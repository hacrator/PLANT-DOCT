# Plant Doctor (AgroGard)

Take a photo of a sick plant, get the likely disease and the treatment, in English or Hindi.

Files: `index.html` is the website (GitHub Pages). `worker.js` is a small server (Cloudflare Workers, free plan) that holds your Anthropic API key.

## Put it online

1. **Server first.** At dash.cloudflare.com go to Workers & Pages > Create > Worker. Paste `worker.js` and deploy.
2. In the Worker's Settings > Variables add:
   - secret `ANTHROPIC_API_KEY` = your key from console.anthropic.com (set a monthly spend limit there)
   - text `ALLOWED_ORIGIN` = `https://YOUR-GITHUB-USERNAME.github.io` (no slash, no path)
3. Copy the Worker address (ends in `.workers.dev`) and paste it into `index.html` as the value of `const API=`.
4. **Website.** On github.com create a public repository, upload `index.html` and `README.md`.
5. Repository Settings > Pages > Deploy from a branch > `main` / root > Save.
6. After a minute the site is at `https://YOUR-GITHUB-USERNAME.github.io/REPO-NAME/`. Open it on a phone: the camera button opens the rear camera.

Each photo costs a small amount on your API key. Farmers should confirm any spray with their local Krishi Vigyan Kendra.
