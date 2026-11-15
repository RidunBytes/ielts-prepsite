# IELTS Prepsite

A free IELTS trainer focused on **vocabulary for Speaking and Writing**. It is a plain static site (HTML, CSS and JavaScript). There is no build step, no backend and no account system, so it deploys to Vercel in about two minutes.

## What is inside

| Section | What it does |
| --- | --- |
| **Speaking** | Vocabulary for Part 1 (everyday answers) and Part 2 (the long turn), plus a Part 3 phrase set. Intermediate and Advanced levels. |
| **Writing** | Vocabulary for Task 1 (trends, proportions, maps, processes, overviews), Task 2 language (cause and effect, solutions, advantages, government) and seven essay topics. |
| **Cue cards** | 36 cards. One minute to plan, two minutes to speak, pacing stages, three support levels (Guided, Light, Exam), a planning-only drill, optional recording, and optional transcript analysis. |
| **Sentence builder** | Connector guide, combine two ideas into compound and complex sentences, write with a target word (with pattern checks), and a personal sentence notebook. |
| **Writing guides** | Paragraph plans and sentence frames for Task 1 report types and all eight Task 2 essay types. |
| **Review** | Spaced repetition: words return after 1, 3, 7, 14 and 30 days. |
| **Phrases** | Idioms, phrasal verbs, and speaking and writing phrase sets, each with a five-question check. |

Progress is saved in each visitor's own browser (localStorage). Nothing is uploaded, and every friend who uses the site has their own separate progress.

## Run it on your computer

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Put it on GitHub and Vercel

1. Create an empty repository on GitHub (https://github.com/new). Do not add a README, because this folder already has one.
2. In this folder, run (replace the URL with yours):

```bash
git init
git add .
git commit -m "IELTS Prepsite: speaking and writing trainer"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

3. Go to https://vercel.com/new, choose **Import Git Repository**, and pick the repo.
4. Set **Framework Preset** to **Other**. Leave Build Command, Output Directory and Install Command empty. Click **Deploy**.
5. Share the `*.vercel.app` link with friends.

After that, every `git push` to `main` redeploys automatically, and every branch gets its own preview link.

Prefer the command line? `npm i -g vercel`, then run `vercel --prod` in this folder.

## Adding or editing content

All content lives in `js/data/` as plain JavaScript arrays. No other file needs to change.

- **Words**: `vocab-speaking.js`, `vocab-writing.js`, `vocab-general.js`. Each word is
  `[word, part of speech, meaning, example with {the form used}, similar words, often used with]`.
  Put `{curly braces}` around the word as it appears in the example. They are used for highlighting and for fill-in-the-blank questions. Keep every word unique and give every topic both `inter` and `adv` lists.
- **Cue cards**: `cuecards.js`. Each card has a topic line, three bullets, a "why" line and a five-part sample plan separated by ` / `.
- **Phrase sets**: `phrases.js` and `phrases-extra.js`.
- **Connectors and practice pairs**: `connectors.js`.
- **Writing guides**: `guides.js`.

The feature code is in `js/cuecard.js`, `js/builder.js`, `js/guides.js`, and the core app (routing, progress, quizzes) is `js/app.js`.

## Logo and branding

The logo files are in `assets/`: `logo.png` (light theme), `logo-dark.png` (dark theme, switches automatically), `icon.png`, `favicon.png` and `apple-touch-icon.png`.

To use a different logo, save it as a PNG with a white or transparent background and run:

```bash
pip install pillow numpy
python3 tools/make_logo_assets.py path/to/new-logo.png
```

The script trims the margins, makes the background transparent, builds the dark-theme version and creates the favicons. It expects the layout of the current logo (icon on the left, then a divider, then the name).

## Notes

- **Recording** uses `MediaRecorder` and stays on the device. **Transcript and analysis** uses the browser's speech recognition. In Chrome and Edge this sends the audio to the browser maker's speech service, so it is optional and off by default. Both need HTTPS (Vercel provides it) and microphone permission.
- Fonts load from Google Fonts. Without a connection the app falls back to system fonts.
- Optional: `python3 tools/build_preview.py` bundles the whole site into one file at `dist/ielts-prepsite.html`.
