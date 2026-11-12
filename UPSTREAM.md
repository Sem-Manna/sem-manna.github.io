# cyc

`cyc` is a simple static site generator. `cyc` is orders of magnitudes faster and less bloated than its competitors.

As long as the documentation is lacking, I suggest the following: To learn how to use `cyc`, just clone this repository and run `make`. Use your browser to navigate to `public/index.html` and inspect the output pages generated as well as the source files in `content/` and `template/`. At some point, I will add more documentation.

[View the example website from this repository.](https://mrpg.github.io/) [View another website built with cyc.](https://max.pm/)

## Known bugs

None

## GitHub Actions workflow for deployment on GitHub Pages

Add this to `.github/workflows/deploy.yml` and enable “GitHub Actions” in the repository’s *Pages* settings. You may have to set “Deployment branches and tags” to “No restriction” in the repository’s *Environments* settings, `github-pages`.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: make

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## License

Everything in this repository is licensed under the **0BSD License** (Zero-Clause BSD). This applies retroactively. You are completely free to do anything with this code. No requirements, no attribution needed, no obligations of any kind. There is no warranty. See [LICENSE](LICENSE) for the complete 0BSD license text.
