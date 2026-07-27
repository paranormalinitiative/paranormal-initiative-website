# ITC / EVP Historical Research Profiles Plan

## Purpose

The Paranormal Initiative should include a dedicated **ITC / EVP Historical Research Profiles** area inside the Education Center.

This section should not be treated as a simple author directory. It should become a professional historical research area for major figures connected to EVP, ITC, psychical research, survival research, anomalous communication studies, and related experimental work.

The goal is to give visitors a serious way to understand who shaped the field, what they contributed, what sources are available, and how their work connects to modern EVP / ITC research.

## Proposed Section Name

**Major ITC / EVP Research Figures**

Alternative names:

- ITC / EVP Historical Research Profiles
- Historical Figures in EVP and ITC Research
- EVP / ITC Research Pioneers
- Major Contributors to EVP and ITC Research

## Initial Profile Candidates

The first profile set should include well-known figures such as:

- Anabela Cardoso
- Friedrich Jürgenson
- Konstantin Raudive
- Marcello Bacci
- Sarah Estep
- George Meek
- William O'Neil
- Hans Bender
- Raymond Bayless
- Attila von Szalay

Additional profiles can be added later for other researchers, experimenters, writers, and historical figures connected to EVP, ITC, psychical research, parapsychology, survival research, and anomalous communication studies.

## Permission and Copyright Handling

This section must handle source material carefully.

For living people, permission is best whenever possible. Anabela Cardoso is the current example: permission was requested and she responded that relevant material from her work may be shared on the site.

For deceased researchers, The Paranormal Initiative can create biographical and historical profile pages. However, books, full papers, recordings, scans, images, and archival documents must be handled according to their copyright and permission status.

Each source should be classified before publication:

- Public domain material
- Material shared by an estate, archive, journal, author, or rights holder with permission
- Material that can be summarized and cited
- Material that should only be linked to
- Material that should not be reproduced fully unless permission is clear

When permission is unclear, the site should summarize, cite, and link rather than reproduce the full source.

## Profile Page Structure

Each major research figure should have a professional profile page with:

- Biography
- Field contribution
- Major publications
- Research methods
- Historical importance
- Selected quotations, only short and attributed
- Available papers or documents
- External archive links
- Related TPI notes
- Influence on modern EVP / ITC research

Where appropriate, pages should also include:

- Profile image or historically appropriate visual material
- Timeline of major work
- Known organizations, journals, or research groups
- Related terms and topics
- Language or translation notes
- Permission/source note

## Education Center Placement

This section should live in the Education Center and connect strongly to:

- EVP & ITC Research
- Historical & Cultural Research
- Consciousness & Human Experience
- Reporting & Documentation
- Repository Pathways

It should also be searchable through the site-wide search system.

## Anabela Cardoso Starting Point

Anabela Cardoso should be treated as the first fully developed major contributor profile.

Current direction:

- A special Major Contributor profile has been created and deployed.
- Her curriculum vitae is the biography foundation.
- Her profile image is staged under `assets/anabela-cardoso/`.
- Her research interests are listed on the profile.
- Her paper collection is staged in the Education Center through `anabela-cardoso-papers.html`.
- Her profile and collection are searchable and linked from the EVP / ITC Research shelf.
- Her static profile record appears in the Member & Contributor Access panel as a public-profile-only record, separate from D1 login accounts.
- Attribution and permission notes should remain visible.
- Documents that require translation or format conversion should be marked during the HTML conversion pass.

This creates the model for future profiles.

## Deployment Note

Cloudflare Workers static assets have a 25 MiB per-file limit. One Anabela source PDF, `Prof_Hans_Bender_on_F_Jurgensons_anomalo.pdf`, was 31.1 MiB and caused deployment failures.

Current handling:

- The oversized PDF is not deployed as a static asset.
- `.assetsignore` explicitly excludes that exact path.
- The paper collection card currently says `R2 upload needed`.
- The file should be uploaded to Cloudflare R2 later and linked from the collection page.

Future large papers, scans, recordings, or media files should go to R2 rather than the static site asset folder.

## Long-Term Value

This area would give The Paranormal Initiative real historical depth.

It shows that the site is not only a personal project or a general paranormal website. It becomes a serious research and education archive that preserves the people, methods, publications, experiments, and questions that shaped EVP and ITC research.

The section should help new investigators understand the field's history while giving experienced researchers a structured place to explore source material, biographies, and related research pathways.
