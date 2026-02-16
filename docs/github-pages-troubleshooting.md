# GitHub Pages 404 Troubleshooting

If you see a GitHub Pages **404 File not found** page:

1. Confirm repository name matches the URL path exactly (case-sensitive):
   - `https://zoecsj.github.io/Quick-Draw-Tarot/`
2. Confirm Pages deployment is enabled for this repository.
3. This repo now includes `.github/workflows/deploy-pages.yml` to deploy on pushes to `main`.
4. Wait for the **Deploy static site to GitHub Pages** workflow to finish.
5. Re-open the site URL with the trailing slash.

This project also includes `.nojekyll` to ensure static files are served without Jekyll processing.
