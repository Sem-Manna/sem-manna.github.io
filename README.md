# Sem Manna's website

A local starting point built with [Max Grossmann's cyc](https://github.com/mrpg/cyc)
and Bootstrap 5.3.9. The About, CV, and Research structure comes from
[the current Google Site](https://sites.google.com/view/semmanna/).

## Start here on Windows

Open **this `semmanna.github.io` folder** as your editor workspace. It is the website
repository. Its parent, `z_Website`, also has a newly initialized Git repository;
use this inner repository for website changes. The old `../test` Hugo experiment
is unrelated and has been preserved.

From PowerShell in this folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1
```

Then open `public/index.html` in your browser. All CSS, JavaScript, and the portrait
are stored locally, so this preview works without a web server.

For a local HTTP preview instead:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory public
```

Open <http://127.0.0.1:8000/>. Press Ctrl+C to stop the server.
After editing a source file, run the build command again and refresh your browser.

The Windows build uses the Git Bash and Strawberry GCC/GNU Make tools already
installed on this computer. `-ExecutionPolicy Bypass` applies only to that process;
it does not change the saved PowerShell policy. Tool paths can be supplied with
`-BashPath`, `-MakePath`, and `-GccPath` if needed on another computer.
Builds run in a temporary folder to avoid Dropbox locking generated files.

On Linux, the original command is `make` (Bash, GNU Make/utilities, and a C compiler
are required). Shell scripts must be executable; `.gitattributes` preserves LF
line endings. If needed after a Windows copy, run `find . -name '*.sh' -exec chmod +x {} +`.

## How the website fits together

`content + meta + template + static → build → public`

| Folder | What to edit |
| --- | --- |
| `content/` | Page bodies: `index.html`, `cv.html`, `research.html`, `contact.html`. |
| `meta/` | Page titles and other values, e.g. `research.html.title`. |
| `template/default.html` | The shared page layout and asset links. |
| `template/menu.html` | Navigation links for all pages. |
| `template/footer.html` | The shared footer. |
| `static/style.css` | Your styles, loaded after Bootstrap. |
| `static/img/` | Images, including the portrait from the Google Site. |
| `static/cv/cv.pdf` | Your CV PDF, shown on the CV page. Replace this file to update it. |
| `static/vendor/bootstrap/` | Pinned Bootstrap CSS/JS and its license. |
| `public/` | Generated website. Rebuilt each time; **edit the source folders instead**. |

Try a first edit: change a sentence in `content/index.html`, build, and refresh.
To adjust spacing or colors, edit `static/style.css`. You can use Bootstrap classes
directly in the content and template HTML.

The sun/moon button after Research switches between light and dark themes. The
site initially follows the browser's system preference, then remembers a manual
choice. `static/theme.js` applies that choice before the stylesheets load. Local
file previews also carry the choice through navigation links. The theme palettes
are in `static/style.css`; the tripod telescope is `static/icons/telescope.svg`.

## Update your CV

Drop your PDF into `static/cv/` and name it **`cv.pdf`**, replacing the previous copy.
Then run the build command and refresh `public/cv.html`. The page embeds the PDF
in a scrollable viewer and provides a button to open it in a new tab. Browsers
without an embedded PDF viewer can use the same button.

The initial file is a copy of `Sem Manna - Short CV.pdf`. The original document
in your separate CV folder is unchanged; future edits there are not automatically
synced to this website. Keep the website filename `cv.pdf` so its URL stays stable.

## Editing pages

- `{{!!title!!}}` inserts the matching metadata file; `{{!!body!!}}` inserts the page body.
- `{{##menu.html##}}` includes a shared file. `{{##.slab##}}` supplies the relative
  path to the root: `.` for top-level pages and `..` for pages one folder below it.
- `{{^^bin/last_updated.sh^^}}` executes a helper during the build.
  Only use trusted content/templates with cyc, since these marks run commands.

The CV is served from `static/cv/cv.pdf`. Research entries and profile details
were copied from the live Google Site as a starting point.

To add a top-level page, create `content/new-page.html`, create
`meta/new-page.html.title`, and add its link in `template/menu.html`. Rebuild.

## Git and publishing

The GitHub repository is `https://github.com/Sem-Manna/sem-manna.github.io`.
`origin` points to `https://github.com/Sem-Manna/sem-manna.github.io.git`.
The local folder is still named `semmanna.github.io`; it does not need to match
the remote repository name.
The starter was imported as source files, without merging unrelated Git histories.
There is no need to pull Max's repository into yours. `git pull` here is for
updates to **your** GitHub repository.

The workflow in `.github/workflows/deploy.yml` builds with cyc and publishes
`public/` to GitHub Pages whenever changes are pushed to `main`. It restores
shell-script executable permissions for the Linux runner. Build output and
compiled helpers are ignored; commit the source files instead.

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
GitHub Pages requires a public repository on GitHub Free, or a supported paid
plan for private repositories. The website address is
<https://sem-manna.github.io/> once the first deployment succeeds.

For future updates, edit the source files, run the local build above, and check
the preview. Then run these commands from this inner website folder:

```powershell
git status
git add .
git commit -m "Update website"
git push origin main
```

Check the repository's **Actions** tab for the deployment result. You can also
run **Deploy website to GitHub Pages** manually from that tab. `UPSTREAM.md`
retains the original cyc documentation for reference.

## Source and adaptations

Imported from cyc commit `913611fe2c37a74a376d3da2fbd9f7613e3be302`.
`UPSTREAM.md` is its original README and `LICENSE` is its 0BSD license.
Bootstrap retains its MIT license in `static/vendor/bootstrap/LICENSE`.

Local adaptations add Bootstrap, personal pages, Windows build support, correct
Make recursion, support for flat content directories, and propagation of page
build failures.
