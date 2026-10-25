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

## Systems

The available system categories are Visual and Motion. Existing browser-local drafts are preserved; when editing a draft with a retired category, select Visual or Motion before saving.

## Writing an article

The sample is a fictional writing guide, not a technical procedure. Its sections are What was the fault?, System affected, Resolution, Documentation or manual, and Images. Headings are unnumbered; only resolution steps use numbers. The form has fields for the manual title/revision/section and an optional HTTP(S) document link. Replace example details with your own tested findings. This template update keeps a downloadable browser-local backup of earlier sample edits; other local drafts remain unchanged.

## Fleet directory

The fleet page presents all ten simulator variants together in one directory. Each model opens its filtered knowledge base; the directory shows Visual and Motion counts and article availability. Layout styling for the directory and article template is in `fleet-sample.css`.

