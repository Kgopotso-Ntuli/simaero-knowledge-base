# SIMAERO technical knowledge base

Public simulator fault knowledge base built with HTML, CSS and JavaScript.

Website: https://kgopotso-ntuli.github.io/simaero-knowledge-base/

## Hosting

GitHub Pages publishes the `main` branch, `/ (root)` folder. Updates committed to these website files are automatically published. No package installation or build is required.

## Files

- `index.html`: page structure and contribution form
- `styles.css` and `readability.css`: SIMAERO branding, larger type and higher contrast
- `app.js`: sample articles, search, filters, bookmarks and browser-local drafts
- `simaero.png`: supplied company logo
- `.nojekyll`: serves the files as plain static content

## Content and storage

One starter fault article is included as an example, not a reviewed maintenance procedure. Consult approved manufacturer documentation for actual maintenance.

New drafts, image attachments and bookmarks stay in the current browser. Attach up to three PNG, JPG or WebP images (10 MB input limit each); images are resized to fit browser storage and included in JSON exports. Saving a draft does not publish it to other technicians. Shared content currently requires an update to the website source and redeployment. A central database and individual sign-in can be added later.

This repository contains the static website only. GitHub Pages does not run a Node.js backend.

## Edit a fault

Open an article, choose **Edit fault**, change its details or images, and choose **Save changes**. The sample can be edited too; its browser-local version replaces the sample in that browser, without adding a duplicate. Changes persist after reload but are not published to other technicians. Export the article JSON to share your changes.

## ATA systems

The system selector contains 58 aircraft ATA chapters, grouped into Aircraft general, Aircraft systems, Structures, Propellers, Powerplant and Other technical references. This is a broad fixed-wing index for the jet and turboprop fleet, not a claim that every chapter applies to every aircraft variant. Use the current manufacturer manual to confirm applicability. Rotorcraft-only chapters and reserved numbers are excluded.

Visual, Motion, IOS and Misc remain simulator-specific categories. The generic Avionics category is also retained for existing drafts; use a specific ATA chapter for new aircraft-system faults. Aircraft ATA chapters are available in the library filter and in the add/edit form. Search also matches chapter numbers and titles.

References:

- ATA Standard Numbering System: https://ataebiz.org/standards/
- Aircraft-general and airframe chapter training index: https://www.aviationacademy.it/mydesk/wp-content/uploads/2023/09/ATA_Chapters.pdf
- FAA JASC reference (derived from ATA, with documented differences): https://sdrs.faa.gov/documents/JASC_Code.pdf
- EASA ATA references for modern aircraft systems: https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-continuing-airworthiness?erules-id=ERULES-1963177438-22314
- Technical documentation chapter grouping: https://www.fzt.haw-hamburg.de/pers/Scholz/paper/TannerPaper_ori.pdf

