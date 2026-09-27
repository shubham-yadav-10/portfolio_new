"""
Build script for the portfolio.

Produces dist/index.html — a fully self-contained single file with the CSS,
JS, profile photo, favicon and CV inlined as data URIs. Useful for:
  - sharing the portfolio as one attachable file
  - hosting situations where only a single HTML file can be uploaded
  - the Freebuff preview tab (which serves only the HTML file itself)

The normal site is the multi-file structure in the project root
(index.html + css/ + js/ + assets/). To rebuild dist/, run:

    python build.py
"""
import base64
import re
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"


def read_bytes(path: Path) -> bytes:
    return path.read_bytes()


def b64(path: Path) -> str:
    return base64.b64encode(read_bytes(path)).decode()


def main() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
    js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")

    profile_b64 = b64(ROOT / "assets" / "img" / "profile.jpg")
    favicon_b64 = b64(ROOT / "assets" / "img" / "favicon.jpg")
    cv_b64 = b64(ROOT / "assets" / "docs" / "Shubham_Yadav_cv.pdf")

    # Inline CSS
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css"/>',
        "<style>\n" + css + "</style>",
    )
    # Inline JS
    html = html.replace(
        '<script src="js/main.js" defer></script>',
        "<script>\n" + js + "</script>",
    )
    # Inline favicon / touch icon
    html = html.replace(
        '<link rel="icon" type="image/jpeg" href="assets/img/favicon.jpg"/>',
        f'<link rel="icon" type="image/jpeg" href="data:image/jpeg;base64,{favicon_b64}"/>',
    )
    html = html.replace(
        '<link rel="apple-touch-icon" href="assets/img/favicon.jpg"/>',
        f'<link rel="apple-touch-icon" href="data:image/jpeg;base64,{favicon_b64}"/>',
    )
    # Inline social images
    html = html.replace(
        'property="og:image" content="assets/img/profile.jpg"',
        f'property="og:image" content="data:image/jpeg;base64,{profile_b64}"',
    )
    html = html.replace(
        'name="twitter:image" content="assets/img/profile.jpg"',
        f'name="twitter:image" content="data:image/jpeg;base64,{profile_b64}"',
    )
    # Inline profile images
    html = html.replace(
        'src="assets/img/profile.jpg"',
        f'src="data:image/jpeg;base64,{profile_b64}"',
    )
    # Inline CV (keep the download attribute so it saves as a file)
    html = re.sub(
        r'href="assets/docs/Shubham_Yadav_cv\.pdf"',
        f'data-cv href="data:application/pdf;base64,{cv_b64}"',
        html,
    )
    html = html.replace('data-cv ', "")

    assert "assets/" not in html, "unresolved asset reference remains"
    assert "styles.css" not in html and "main.js" not in html

    DIST.mkdir(exist_ok=True)
    out = DIST / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"Built {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
