# TOKATLIANN GUIDE — instructions for future agents

- Before UI or selection changes, read `docs/REQUIREMENTS.md`. It is the current requirement source; historical entries in CHANGELOG and ANALYSIS do not override it.
- For Bitrix, infoblocks, catalog data, admin fields, cache or deployment work, read `docs/BITRIX-INTEGRATION.md` before implementation.
- Work within this project folder. Preserve autonomous `file://` preview; use the actual site template header/footer for Bitrix. The user authorized a public GitHub repository and GitHub Pages static preview. Deployment to the live TOKATLIANN/Bitrix site and live data integration still belong to a separate stage.
- Use `guide/guide.html` as the shared markup source. Regenerate the standalone page with `python work/build_preview.py` after markup changes.
- Keep guide CSS inside `.tg-guide`, and maintain the sequential controller and data contract. Preserve the configurable default product until all three groups have valid selections.
- Verify affected interactions and responsive boundaries in a browser. For photo/footer changes, measure the photo frame against viewport height and the guide boundary after scrolling; full-page screenshots can alter viewport units during capture.
- Pages publication uses `.github/workflows/pages.yml` and `python scripts/build_pages.py`; publish only `work/pages`, never the PHP entry point or research files.
- Record requirement decisions in `docs/REQUIREMENTS.md`, implementation changes in `CHANGELOG.md`, and observed checks/limitations in `QA.md`. Keep each rule authoritative in one place and link to it from other documents.
