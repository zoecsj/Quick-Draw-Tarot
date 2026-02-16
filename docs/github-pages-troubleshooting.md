# GitHub Pages 404 Troubleshooting

If you see a GitHub Pages **404 File not found** page:

1. Confirm repository name matches the URL path exactly (case-sensitive):
   - `https://zoecsj.github.io/Quick-Draw-Tarot/`
2. Confirm Pages deployment is enabled for this repository.
3. Confirm **Settings → Pages → Build and deployment → Source** is set to **GitHub Actions**.
4. This repo includes `.github/workflows/deploy-pages.yml` and deploys on pushes to `main`, `master`, and `work`.
5. Wait for the **Deploy static site to GitHub Pages** workflow to finish successfully.
6. Re-open the exact URL with trailing slash:
   - `https://zoecsj.github.io/Quick-Draw-Tarot/`
   - `https://zoecsj.github.io/Quick-Draw-Tarot/spread/`

This project also includes `.nojekyll` to ensure static files are served without Jekyll processing.
