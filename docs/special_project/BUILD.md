Recommended build instructions for the project report

Overview
--------
This LaTeX project uses a custom class `project_report.cls` which relies on `fontspec` for Thai fonts. The class configures `biblatex` with the `biber` backend.

Recommended engine
------------------
- XeLaTeX (best for fontspec & Thai)
- Alternative: LuaLaTeX

Recommended tools
-----------------
- latexmk (wraps the full build pipeline; preferred)
- biber (biblatex backend)

Quick build (recommended from docs/special_project/)
---------------------------------------------------
latexmk -pdf -xelatex -use-biber Main.tex


Latexmk "-use-biber unknown option" fallback
--------------------------------------------
If your latexmk prints an error like:

	Latexmk: -use-biber unknown option

it means your installed latexmk version does not support the `-use-biber` option. Two safe workarounds:

1) Manual build (explicit runs)

```bash
xelatex Main.tex
biber Main
xelatex Main.tex
xelatex Main.tex
```

Run these commands from `docs/special_project/` (or adjust paths) — this is the sequence that `latexmk -use-biber` automates.

2) Use latexmk without `-use-biber`, but run `biber` in between

```bash
latexmk -pdf -xelatex Main.tex
biber Main
latexmk -pdf -xelatex Main.tex
```

This tells `latexmk` to build with XeLaTeX but because it didn't invoke `biber` automatically you run `biber` yourself and then let `latexmk` finish resolving references.

Check latexmk version and update
--------------------------------
To inspect your latexmk version:

```bash
latexmk -v
```

If it's old, update your TeX distribution (TeX Live) or latexmk. For TeX Live you can use `tlmgr` (if available) to update packages:

```bash
tlmgr update --self --all
```

On some Linux distributions the packaged latexmk may be behind. Installing or updating the full TeX Live distribution (or using the TeX Live installer) will bring a latexmk that supports `-use-biber`.

Notes
-----
- Overleaf uses recent TeX Live and will run `biber` automatically for you when `biblatex` is configured with `backend=biber`.
- If you prefer complete automation locally and your latexmk supports it, `latexmk -pdf -xelatex -use-biber Main.tex` is the most convenient.

Manual build steps
------------------
1. xelatex Main.tex
2. biber Main
3. xelatex Main.tex
4. xelatex Main.tex

Fonts
-----
The class expects the THSarabunNew font files to be available under `Class/Font/` (see `project_report.cls`), or installed system-wide. If you get font errors, either:
- Install THSarabunNew on your OS, or
- Copy the font files into `docs/special_project/Class/Font/` and re-run the build.

Troubleshooting
---------------
- If citations do not appear, ensure you used the `-use-biber` flag or run `biber Main` after the first LaTeX run.
- If you prefer BibTeX instead of biber, modify the class to use `backend=bibtex` in the biblatex package options (not recommended).

Notes
-----
- The project class already loads `biblatex` and adds `Project_999_Bibliography.bib` as a resource. The `Main.tex` file prints the bibliography via `\printbibliography`.
- For including minted code highlighting, you may need to run with `-shell-escape` or adjust the class to use `listings` (minted is not currently configured). Currently the class uses `listings` for code blocks.
