# sem manna's website

[Edit](#edit) · [Preview](#preview) · [Publish](#publish) · [Troubleshooting](#troubleshooting) · [Appendix](#appendix)

**Work in the inner `semmanna.github.io` folder.** Open it in your editor and run
the commands below in PowerShell from that folder.

The routine is **edit → preview → push → check deployment**.

## Edit

| To change… | Open… |
| --- | --- |
| About text, contact details, profile links | [content/index.html](content/index.html) |
| Research entries, abstracts, coauthor links | [content/research.html](content/research.html) |
| Your CV | Replace [static/cv/cv.pdf](static/cv/cv.pdf), keeping the same filename. |
| Colors, fonts, spacing | [static/style.css](static/style.css) |
| Header name and browser-tab titles | [template/default.html](template/default.html) |
| Navigation / footer | [template/menu.html](template/menu.html) / [template/footer.html](template/footer.html) |
| Portrait | Replace [static/img/sem-manna.jpg](static/img/sem-manna.jpg). |

Your separate CV folder is not synced automatically. The `public/` folder is
generated and overwritten on rebuild; make edits in the source files above.

## Preview

Build, then open the local site:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1
Invoke-Item .\public\index.html
```

After each edit, rebuild and refresh the browser. Check the changed page before
publishing.

## Publish

Review your changes, then save and upload them:

```powershell
git status
git diff
git add .
git commit -m "Describe your changes"
git push origin main
```

Every push to `main` starts **Deploy website to GitHub Pages**. Check the
[deployment status](https://github.com/Sem-Manna/sem-manna.github.io/actions):
the update is published after the run succeeds.

[Website](https://sem-manna.github.io/) · [GitHub repository](https://github.com/Sem-Manna/sem-manna.github.io) · [Deployment workflow](.github/workflows/deploy.yml)

## Troubleshooting

- **Preview looks unchanged:** rebuild, then refresh. Confirm you edited a source
  file rather than a generated file in `public/`.
- **Push succeeded, but the website did not update:** inspect the failed run in
  [Actions](https://github.com/Sem-Manna/sem-manna.github.io/actions). A push saves
  the source; the deployment must also succeed. Account errors must be resolved
  through GitHub before deployment can run.
- **Publish the latest version manually:** in Actions, select **Deploy website to
  GitHub Pages → Run workflow → main → Run workflow**.

## Appendix

<details>
<summary>Technical details, extra commands, and project background</summary>

### Files and templates

`content + meta + template + static → build → public`

- [meta/](meta/) holds page headings and title values; [content/cv.html](content/cv.html)
  controls the CV viewer. [content/contact.html](content/contact.html) is a separate
  contact page, currently outside the main navigation.
- [static/theme.js](static/theme.js) controls the light/dark theme;
  [static/site.js](static/site.js) handles navigation and abstract animations.
  The header icon is [static/icons/telescope.svg](static/icons/telescope.svg).
- `{{!!title!!}}` and `{{!!body!!}}` insert metadata and content;
  `{{##menu.html##}}` includes a shared template.
- Keep [content/.slab](content/.slab): it contains `.` for top-level links.
  Nested pages need their own path file, e.g. `content/subfolder/.slab` containing
  `..`. This is not generated automatically.
- `{{^^bin/last_updated.sh^^}}` runs a build command. Use trusted content and
  templates with this generator.

### Add a page

Create `content/new-page.html` and `meta/new-page.html.title`, then add a link in
[template/menu.html](template/menu.html). Rebuild and preview.

### Other preview and build options

For an HTTP preview, build first, then run:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory public
```

Open <http://127.0.0.1:8000/>. Stop the server with **Ctrl+C**.

[build.ps1](build.ps1) uses the installed Git Bash and Strawberry GCC/GNU Make.
On another Windows computer, tool paths can be supplied with `-BashPath`,
`-MakePath`, and `-GccPath`. Builds use a temporary folder to avoid Dropbox locks.
`-ExecutionPolicy Bypass` applies only to the build process.

On Linux, with Bash, GNU Make/utilities, and a C compiler installed:

```bash
find . -type f -name '*.sh' -exec chmod +x {} +
make
```

### Repository and hosting

The local folder is `semmanna.github.io`; the renamed GitHub repository is
`Sem-Manna/sem-manna.github.io`. The parent `z_Website` repository and old `test/`
Hugo experiment are separate from this website.

Pages is configured to use **GitHub Actions**. The workflow builds on Ubuntu and
publishes `public/`. Generated output and compiled helpers are excluded from Git.

### Credits

Built with [cyc](https://github.com/mrpg/cyc) and Bootstrap 5.3.9. Initial content
came from the [original Google Site](https://sites.google.com/view/semmanna/).
The cyc import is based on commit `913611fe2c37a74a376d3da2fbd9f7613e3be302`.

[Original cyc documentation](UPSTREAM.md) · [cyc license](LICENSE) · [Bootstrap license](static/vendor/bootstrap/LICENSE) · [Asset credits](THIRD_PARTY.md)

</details>
