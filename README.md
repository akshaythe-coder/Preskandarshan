# Preksha & Darshan Wedding Invitation

A phone-first wedding invitation built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion. The site uses the Next.js runtime for hosting.

## Run locally

Install Node.js 20.9 or later. From this folder, run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Edit the invitation

Update names, dates, venue, music, story chapters, events, and image paths in `data/content.en.ts` and `data/content.hi.ts`.

Photos in `public/moments/` are WebP files. To add or replace photos, put them in `public/` and update the `moments` array. The story and television images are set in the content files. The background song is at `public/music/tu-hai.mp3` and starts after a guest opens the invitation.

## Deploy to Netlify

Connect this repository in Netlify. The build command is `npm run build` and the publish directory is `.next`, as configured in `netlify.toml`. Netlify's Next.js runtime handles the site.

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

The website and its metadata always use English. Only the second-last Family Blessings section has an English / हिंदी switch. Hindi is the default for that section. Its selection is stored under `wedding-family-language-v2`; old site-wide `?lang` links no longer change the site language. Names and translations remain editable in `data/content.en.ts` and `data/content.hi.ts`. Run `npm run test:i18n` to check translation keys and data. Hindi fonts are loaded only for the section or on toggle hover/focus.

Family blessings: add or remove names in `familyBlessings.groups[].names` in both locale content files; names wrap automatically. The supplied English and Hindi lists intentionally differ. Edit `familyBlessings.littleHearts.repeatInvitation` to change the repeated children’s invitation wording in one place.
