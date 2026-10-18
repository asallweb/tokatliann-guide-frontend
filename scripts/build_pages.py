"""Create a clean GitHub Pages artifact using only the Python standard library."""
from pathlib import Path
import runpy
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "work" / "pages"
LEGACY = {"cream.webp", "editorial.webp", "editorial-hq.png", "marble.webp",
          "product-study.webp", "routine.webp"}

runpy.run_path(str(ROOT / "work" / "build_preview.py"), run_name="__main__")
# This fixed output directory is the only directory this script may clean.
if OUTPUT.resolve() != (ROOT.resolve() / "work" / "pages") or OUTPUT.is_symlink():
    raise RuntimeError("Unsafe output directory")
if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
(OUTPUT / "guide").mkdir(parents=True)
shutil.copy2(ROOT / "index.html", OUTPUT / "index.html")
shutil.copy2(ROOT / "guide" / "index.html", OUTPUT / "guide" / "index.html")
shutil.copytree(ROOT / "guide" / "assets", OUTPUT / "guide" / "assets",
                ignore=shutil.ignore_patterns(*LEGACY, "__pycache__"))
(OUTPUT / ".nojekyll").touch()
files = list(OUTPUT.rglob("*"))
assert not any(item.suffix == ".php" for item in files)
assert not (OUTPUT / "docs").exists()
print(f"Pages artifact: {OUTPUT.relative_to(ROOT)}; "
      f"{sum(item.is_file() for item in files)} files")
