#!/usr/bin/env python3
from __future__ import annotations

import html
import re
import subprocess
import tempfile
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PAPER_DIR = ROOT / "assets" / "anabela-cardoso" / "papers"
POPPLER_BIN = Path("/Users/toddknipple/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm")
TESSERACT_BIN = Path("/opt/homebrew/bin/tesseract")
LOCAL_SOURCE_DIR = Path("/Users/toddknipple/Desktop/Anabela Cardoso")


PAPERS = [
    {
        "file": "A_Two_Year_Investigation_of_the_Allegedl.pdf",
        "slug": "anabela-cardoso-two-year-investigation-electronic-voices",
        "tag": "ITC / EVP",
        "type": "Research Paper",
        "title": "A Two-Year Investigation of the Allegedly Anomalous Electronic Voices or EVP",
        "description": "Formal EVP research report associated with NeuroQuantology publication history.",
    },
    {
        "file": "Instrumental_Transcommunication_ITC_Evid.pdf",
        "slug": "anabela-cardoso-instrumental-transcommunication-itc-evidence",
        "tag": "ITC",
        "type": "Research Paper",
        "title": "Instrumental Transcommunication (ITC) Evidence",
        "description": "Major ITC evidence paper available in PDF source format.",
    },
    {
        "file": "ITC_A_Transpersonal_Connection.docx",
        "slug": "anabela-cardoso-itc-transpersonal-connection",
        "tag": "ITC",
        "type": "Research Paper",
        "title": "ITC: A Transpersonal Connection",
        "description": "Documented discussion of ITC as a transpersonal communication field.",
    },
    {
        "file": "ITC_Voices_Contact_with_Another_Reality.pdf",
        "slug": "anabela-cardoso-itc-voices-contact-with-another-reality",
        "tag": "Voices",
        "type": "Reference Paper",
        "title": "ITC Voices: Contact with Another Reality",
        "description": "Voice-contact paper in PDF source form.",
    },
    {
        "file": "ITC_Personal_Results_and_Guidance_on_Met.doc",
        "slug": "anabela-cardoso-itc-personal-results-guidance-method",
        "tag": "Method",
        "type": "Technical Note",
        "title": "ITC Personal Results and Guidance on Method",
        "description": "Method-oriented document currently available as DOC source.",
    },
    {
        "file": "Introduction_to_the_radioelectric_freque.docx",
        "slug": "anabela-cardoso-introduction-radioelectric-frequencies",
        "tag": "Radio",
        "type": "Technical Note",
        "title": "Introduction to the Radioelectric Frequencies",
        "description": "Introductory material on radioelectric frequency work.",
    },
    {
        "file": "The_Radioelectric_Frequencies_of_Rio_do.pdf",
        "slug": "anabela-cardoso-radioelectric-frequencies-rio-do-tempo",
        "tag": "Radio",
        "type": "Research Paper",
        "title": "The Radioelectric Frequencies of Rio do Tempo",
        "description": "Radioelectric-frequency related paper in PDF source form.",
    },
    {
        "file": "ITC_Journal_42_radioelectric_frequencies.pdf",
        "slug": "anabela-cardoso-itc-journal-42-radioelectric-frequencies",
        "tag": "Journal",
        "type": "ITC Journal",
        "title": "ITC Journal 42: Radioelectric Frequencies",
        "description": "ITC Journal material connected to radioelectric-frequency discussion.",
    },
    {
        "file": "ANIMAL_VOICES_2_Surya_and_Nisha_my_belov.pdf",
        "slug": "anabela-cardoso-animal-voices-2-surya-nisha",
        "tag": "Animal Voices",
        "type": "Research Paper",
        "title": "Animal Voices 2: Surya and Nisha, My Beloved",
        "description": "Animal voice manifestation paper in PDF source form.",
    },
    {
        "file": "Animal_Voices_3_1_So_the_first_abandoned.docx",
        "slug": "anabela-cardoso-animal-voices-3-1-first-abandoned",
        "tag": "Animal Voices",
        "type": "Research Paper",
        "title": "Animal Voices 3.1: So the First Abandoned...",
        "description": "Animal voice and continuation material available in DOCX source form.",
    },
    {
        "file": "Animal_voices_and_other_manifestations_o.docx",
        "slug": "anabela-cardoso-animal-voices-other-manifestations",
        "tag": "Animals",
        "type": "Research Paper",
        "title": "Animal Voices and Other Manifestations",
        "description": "Documented animal voice and manifestation material.",
    },
    {
        "file": "The_soul_of_the_cat.docx",
        "slug": "anabela-cardoso-soul-of-the-cat",
        "tag": "Animals",
        "type": "Essay / Paper",
        "title": "The Soul of the Cat",
        "description": "Animal-consciousness and survival-related paper.",
    },
    {
        "file": "Paranormal_Review_ITC_paper.doc",
        "slug": "anabela-cardoso-paranormal-review-itc-paper",
        "tag": "Review",
        "type": "Review Paper",
        "title": "Paranormal Review ITC Paper",
        "description": "Review-format ITC paper available as DOC source.",
    },
    {
        "file": "Prof_Hans_Bender_on_F_Jurgensons_anomalo.pdf",
        "localFile": "Prof_Hans_Bender_on_F_Jurgensons_anomalo.pdf",
        "sourceHref": "",
        "sourceNote": "PDF pending R2 upload",
        "ocr": True,
        "slug": "anabela-cardoso-prof-hans-bender-friedrich-jurgenson-anomalous-voices",
        "tag": "History",
        "type": "Historical Research",
        "title": "Prof. Hans Bender on F. Jurgenson's Anomalous Voices",
        "description": "Historical EVP material connected to Friedrich Jurgenson and Hans Bender.",
    },
    {
        "file": "Jochem_Sotschek_in_ITC_Journal.pdf",
        "slug": "anabela-cardoso-jochem-sotschek-itc-journal",
        "tag": "Journal",
        "type": "ITC Journal",
        "title": "Jochem Sotschek in ITC Journal",
        "description": "ITC Journal material requiring source review.",
    },
    {
        "file": "Dear_readers_were_the_fascinating_occurr.docx",
        "slug": "anabela-cardoso-dear-readers-fascinating-occurrences",
        "tag": "Readers",
        "type": "Journal / Note",
        "title": "Dear Readers...",
        "description": "Document source requiring title confirmation and conversion.",
    },
    {
        "file": "Attachment_1_NOTE_on_the_witnesses_to_my.pdf",
        "slug": "anabela-cardoso-note-on-witnesses",
        "tag": "Attachment",
        "type": "Supplement",
        "title": "Note on the Witnesses to My...",
        "description": "Supplementary attachment source requiring title confirmation.",
    },
    {
        "file": "Attachment_2_Technicians_Message_transla.pdf",
        "slug": "anabela-cardoso-technicians-message-translation",
        "tag": "Attachment",
        "type": "Translation",
        "title": "Technicians' Message Translation",
        "description": "Translation attachment requiring review with the related paper.",
    },
    {
        "file": "NeuroQuantology_September_2012_Volume_10.pdf",
        "slug": "anabela-cardoso-neuroquantology-september-2012-volume-10",
        "tag": "Journal",
        "type": "Publication Source",
        "title": "NeuroQuantology, September 2012, Volume 10",
        "description": "Publication issue connected to the two-year EVP investigation report.",
    },
]


def clean_text(value: str) -> str:
    value = value.replace("\x00", " ")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n[ \t]+", "\n", value)
    value = re.sub(r"[ \t]+\n", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for index, page in enumerate(reader.pages, start=1):
        text = clean_text(page.extract_text() or "")
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def extract_pdf_ocr(path: Path) -> str:
    if not POPPLER_BIN.exists():
        raise FileNotFoundError(f"PDF renderer not found: {POPPLER_BIN}")
    if not TESSERACT_BIN.exists():
        raise FileNotFoundError(f"Tesseract OCR not found: {TESSERACT_BIN}")
    with tempfile.TemporaryDirectory() as tmp:
        prefix = Path(tmp) / "page"
        subprocess.run(
            [str(POPPLER_BIN), "-png", "-r", "220", str(path), str(prefix)],
            check=True,
            capture_output=True,
            text=True,
        )
        pages = []
        for image in sorted(Path(tmp).glob("page-*.png")):
            result = subprocess.run(
                [str(TESSERACT_BIN), str(image), "stdout", "-l", "eng"],
                check=True,
                capture_output=True,
                text=True,
            )
            page_text = clean_text(result.stdout)
            if page_text:
                pages.append(page_text)
        return "\n\n".join(pages)


def extract_doc(path: Path) -> str:
    result = subprocess.run(
        ["textutil", "-convert", "txt", "-stdout", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return clean_text(result.stdout)


def paragraph_html(text: str) -> str:
    blocks = []
    for raw_block in re.split(r"\n{2,}", text):
        lines = [line.strip() for line in raw_block.splitlines() if line.strip()]
        if not lines:
            continue
        block = " ".join(lines)
        block = re.sub(r"\s+", " ", block).strip()
        if not block:
            continue
        blocks.append(f"<p>{html.escape(block)}</p>")
    return "\n".join(blocks) or "<p>Text extraction was not available for this source document.</p>"


def article_page(paper: dict, body: str) -> str:
    source_href = paper.get("sourceHref")
    if source_href is None:
        source_href = f"assets/anabela-cardoso/papers/{paper['file']}"
    title = paper["title"]
    subtitle = f"Anabela Cardoso Collection - {paper['type']}"
    source_action = (
        f'<a class="portal-button portal-button-secondary" href="{html.escape(source_href)}" target="_blank" rel="noopener">Open Source Document</a>'
        if source_href else
        '<span class="portal-button portal-button-secondary portal-button-disabled">Source PDF pending R2 upload</span>'
    )
    conversion_note = (
        "This web version was converted from the source document for easier reading on the site. The original source document remains available above for comparison, citation, and preservation."
        if source_href else
        "This web version was converted from the oversized local source PDF for easier reading on the site. The original PDF source remains pending Cloudflare R2 upload and should be linked here after it is hosted."
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="description" content="{html.escape(title)} - {html.escape(paper['description'])}">
    <link rel="canonical" href="https://paranormalinitiative.com/{paper['slug']}.html">
    <title>{html.escape(title)} | Anabela Cardoso | The Paranormal Initiative</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="pp:title" content="{html.escape(title)}">
    <meta name="pp:subtitle" content="{html.escape(subtitle)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=15">
</head>
<body>
<div id="site-header"></div>

<section class="portal-hero lesson-hero">
    <p class="portal-kicker">Honorary Member Collection - {html.escape(paper['type'])}</p>
    <h2>{html.escape(title)}</h2>
    <p>{html.escape(paper['description'])}</p>
    <div class="portal-actions">
        <a class="portal-button" href="anabela-cardoso-profile.html">Anabela Cardoso Profile</a>
        <a class="portal-button portal-button-secondary" href="anabela-cardoso-papers.html">Paper Collection</a>
        {source_action}
    </div>
</section>

<section class="lesson-reading-section series-article">
    <article class="lesson-reading-block paper-single-textbox">
        <div class="lesson-reading-copy">
            <p><strong>Attribution.</strong> This document is presented as part of the Anabela Cardoso Honorary Member Collection on The Paranormal Initiative. Source material is shared with permission from Anabela Cardoso and remains attributed to her work.</p>
            <p><strong>Conversion note.</strong> {html.escape(conversion_note)}</p>
        </div>
        <h3>Full Text</h3>
        <div class="lesson-reading-copy anabela-converted-paper">
{body}
        </div>
    </article>
</section>

<div id="site-footer"></div>
<script src="includes.js"></script>
<script src="content-protection.js"></script>
</body>
</html>
"""


def collection_card(paper: dict) -> str:
    href = f"{paper['slug']}.html"
    source_href = paper.get("sourceHref")
    if source_href is None:
        source_href = f"assets/anabela-cardoso/papers/{paper['file']}"
    source_note = source_href or paper.get("sourceNote", "Source document pending")
    return f"""        <a class="study-resource-card" href="{html.escape(href)}">
            <div class="study-resource-card-media"><span>{html.escape(paper['tag'])}</span></div>
            <div class="study-resource-card-copy"><span>{html.escape(paper['type'])}</span><h3>{html.escape(paper['title'])}</h3><p>{html.escape(paper['description'])}</p><strong>Open readable article</strong><small>Source: {html.escape(source_note)}</small></div>
        </a>"""


def collection_page() -> str:
    cards = "\n".join(collection_card(paper) for paper in PAPERS)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="description" content="Anabela Cardoso research papers - a collection of EVP, ITC, and psychical research publications hosted by The Paranormal Initiative.">
    <link rel="canonical" href="https://paranormalinitiative.com/anabela-cardoso-papers.html">
    <title>Anabela Cardoso Papers | The Paranormal Initiative</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="pp:title" content="Anabela Cardoso Papers">
    <meta name="pp:subtitle" content="Honorary Member Collection - EVP / ITC Research">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css?v=15">
</head>
<body>
<div id="site-header"></div>

<section class="portal-hero">
    <p class="portal-kicker">Honorary Member Collection</p>
    <h2>Anabela Cardoso Papers</h2>
    <p>
        A dedicated Education Center collection for Anabela Cardoso's work in EVP, ITC, psychical research, animal voice manifestations, radioelectric frequencies, and survival-hypothesis research.
    </p>
    <p>
        These materials are organized for The Paranormal Initiative with permission from Anabela Cardoso. Each converted article includes a source-document link for attribution, comparison, and preservation.
    </p>
    <div class="portal-actions">
        <a class="portal-button" href="anabela-cardoso-profile.html">Honorary Member Profile</a>
        <a class="portal-button portal-button-secondary" href="education-area-evp-itc-research.html">EVP / ITC Topic Shelf</a>
    </div>
</section>

<section class="study-hub-layout education-intro-grid">
    <article class="study-hub-card">
        <h3>Collection Scope</h3>
        <p>
            This collection gathers Dr. Cardoso's papers and related materials for education, reference, and responsible study within the EVP and ITC research area.
        </p>
        <p>
            The publication goal is to preserve full papers where permission allows, keep attribution clear, and provide readable web versions alongside source documents.
        </p>
    </article>
    <aside class="study-hub-card">
        <h3>Reading Format</h3>
        <p>
            The cards below now open readable site articles instead of raw source documents. Source PDFs and DOC files remain linked from each article page for preservation and citation.
        </p>
    </aside>
</section>

<section class="learning-section study-library-section">
    <h2>Paper Inventory</h2>
    <p>
        This working collection currently contains {len(PAPERS)} converted source documents. The oversized Hans Bender source PDF has been converted into a readable article and remains marked for future R2 source-document hosting.
    </p>
    <div class="study-resource-grid anabela-paper-grid">
{cards}
    </div>
</section>

<div id="site-footer"></div>
<script src="includes.js"></script>
<script src="content-protection.js"></script>
</body>
</html>
"""


def main() -> None:
    generated = []
    for paper in PAPERS:
        path = PAPER_DIR / paper["file"]
        if not path.exists() and paper.get("localFile"):
            path = LOCAL_SOURCE_DIR / paper["localFile"]
        if not path.exists():
            raise FileNotFoundError(path)
        if paper.get("ocr"):
            text = extract_pdf_ocr(path)
        elif path.suffix.lower() == ".pdf":
            text = extract_pdf(path)
        elif path.suffix.lower() in {".doc", ".docx"}:
            text = extract_doc(path)
        else:
            raise ValueError(f"Unsupported source format: {path}")
        body = paragraph_html(text)
        output = ROOT / f"{paper['slug']}.html"
        output.write_text(article_page(paper, body), encoding="utf-8")
        generated.append(output.name)

    (ROOT / "anabela-cardoso-papers.html").write_text(collection_page(), encoding="utf-8")
    print(f"Generated {len(generated)} Anabela Cardoso article pages.")
    for name in generated:
        print(name)


if __name__ == "__main__":
    main()
