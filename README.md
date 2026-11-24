# Preksha & Darshan Wedding Invitation

A phone-first wedding invitation built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion. The site is configured to export as static files for easy hosting.

## Run locally

Install Node.js 20.9 or later. From this folder, run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Edit the invitation

Update names, dates, venue, music, story chapters, events, and image paths in [`data/content.ts`](data/content.ts).

Photos in `public/moments/` are WebP files. To add or replace photos, put them in `public/` and update the `moments` array. The story and television images are set in `data/content.ts`. The background song is at `public/music/married-life-instrumental.mp3` and starts after a guest opens the invitation.

Optional realistic paper and television assets can be added under `public/theme/`. The current television, paper pieces, and curtain folds are drawn in CSS, so the site works without those assets. See [`ASSET_PROMPTS.md`](ASSET_PROMPTS.md) for ready-to-use prompts.

## Deploy to Netlify without GitHub

The project creates a static website in `out/`. Build it locally, then upload the `out` folder using Netlify Drop or deploy it with the Netlify CLI:

```bash
npm install
npm run build
npm install --global netlify-cli
netlify login
netlify deploy --dir=out
netlify deploy --prod --dir=out
```

The first CLI deploy creates a draft preview. The final command publishes it. `netlify.toml` contains the build and publish settings for connected deployments.

## Deploy to Vercel

For a deployment without GitHub, install and sign in to the Vercel CLI, then deploy from this folder:

```bash
npm install --global vercel
vercel login
vercel
vercel --prod
```

Vercel detects the Next.js App Router and uses `next build` automatically.

## Share preview

The page metadata uses [`public/og.png`](public/og.png) for the social preview. Replace it with a new 1200 × 630 image if you change the design or names.

## Family Blessings language switch

The website and its metadata always use English. Only the second-last Family Blessings section has an English / हिंदी switch. Its selection is stored under `wedding-family-language`; old site-wide `?lang` links no longer change the site language. Names and translations remain editable in `data/content.en.ts` and `data/content.hi.ts`. Run `npm run test:i18n` to check translation keys and data. Hindi fonts are loaded only for the section or on toggle hover/focus.

Family blessings: add or remove names in `familyBlessings.groups[].names` in both locale content files; names wrap automatically. The supplied English and Hindi lists intentionally differ. Edit `familyBlessings.littleHearts.repeatInvitation` to change the repeated children’s invitation wording in one place.
