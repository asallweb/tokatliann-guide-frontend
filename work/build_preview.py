"""Regenerate file:// preview from shared guide fragment; Python standard library only."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
shell=json.loads((ROOT/'work/source/shell.json').read_text(encoding='utf-8'))
fragment=(ROOT/'guide/guide.html').read_text(encoding='utf-8')
header=shell['header'].replace('class="header "','class="preview-shell header"')
footer=shell['footer'].replace('class="footer"','class="preview-shell footer"')
page="""<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Интерактивный гид TOKATLIANN: подбор ухода по состоянию кожи и образу жизни. Локальная демонстрация.">
<title>GUIDE — подбор ухода | TOKATLIANN</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="assets/fonts.css">
<link rel="stylesheet" href="assets/site-shell.css">
<link rel="stylesheet" href="assets/preview.css">
<link rel="stylesheet" href="assets/guide.css">
<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/guide-motion.js" defer></script>
<script src="assets/guide-data.js" defer></script>
<script src="assets/guide.js" defer></script>
<script src="assets/preview.js" defer></script>
</head><body>
<!-- Captured production shell: standalone preview only. Bitrix uses its own header/footer. -->
"""+header+'\n'+fragment+'\n'+footer+'\n</body></html>\n'
(ROOT/'guide/index.html').write_text(page,encoding='utf-8')
print('guide/index.html generated from shared guide/guide.html.')
