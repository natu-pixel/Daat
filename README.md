# DAAT

A responsive studio website built with Next.js, Sanity, Motion for React, and Resend. The palette and typography follow the supplied DAAT identity references. The wordmark and directional mark now use the exact geometry from the supplied DAAT SVG masters.

## Run locally

Requires Node.js 22.12 or newer.

```powershell
npm install
npm run dev
```

Open the URL printed by Next.js. Without Sanity configuration, the site displays the supplied AeroGrain, PulseDock, Solvanta Labs, Apex, and poster collections, plus DAAT's own identity study. It does not invent dates, briefs, awards, or results for these projects. Edit this content in [lib/local-content.ts](./lib/local-content.ts).

## Supplied artwork

All 52 original images remain untouched in [works](./works). Optimized WebP copies live in [public/works](./public/works); the homepage image wall, project cards, project galleries, and campaign grid use these files. The Solvanta social-layout image found inside the Apex source folder is associated with Solvanta without moving its original.

```powershell
npm run assets:works
```

This regenerates the WebP assets and manifest after changing source images. Keep caption order and project mappings in sync in [lib/local-content.ts](./lib/local-content.ts). Conversion preserves image proportions and does not enlarge artwork. Scroll-gallery image frames shrink to the artwork's natural proportions, without colored letterboxing or cropping, on desktop, mobile, and reduced-motion layouts. Portrait campaign pieces use an uncropped responsive masonry grid instead of a 26-screen pinned sequence.

### Official DAAT logo and project ticker

```powershell
npm run assets:brand
```

This prepares DAAT's wordmark, icon geometry, and favicon from [works/SVGs](./works/SVGs), preserving their paths and removing export whitespace. The inline components inherit the appropriate theme color.

The homepage logo-only ticker uses temporary transparent crops from the four supplied project collections, as requested. These are raster approximations, not vector masters. Replace the image paths and dimensions in [lib/project-logos.ts](./lib/project-logos.ts) when clean SVGs arrive; do not run the crop script over replacement files using the same filenames.

An open, unboxed statement and the monochrome logo ticker sit between the hero and portfolio wall, breaking up the stacked-panel layout.

The ticker loops seamlessly, has a pause/resume button, pauses on hover or keyboard focus, and becomes static for reduced motion or without JavaScript. Its duplicate group is hidden from assistive technology. It is labeled as project logos, not a claim of client endorsement.

Aspekta is served locally under the bundled [SIL Open Font License](./public/fonts/LICENSE.txt), from [its official repository](https://github.com/ivodolenc/aspekta).

## CMS

1. Create a Sanity project and dataset in your own account.
2. Copy [.env.example](./.env.example) to `.env.local`. Set both `NEXT_PUBLIC_SANITY_*` values and both matching `SANITY_STUDIO_*` values.
3. Run `npm run studio`. Use Sanity account authentication; no editing token belongs in the public website.
4. Add your local website and deployed Studio URLs to the project's allowed CORS origins.
5. Publish the singleton **Site settings**, service documents, and real project documents.
6. Deploy the Studio with `npm run studio:deploy` when ready.

With CMS enabled, local content is not a fallback. Upload the supplied work and add matching project documents before switching to CMS mode. Missing required settings produces an explicit error. An empty project list produces a deliberate empty state. Every request reads published CMS content without caching, so published edits appear on refresh. Images require descriptions; videos require a poster and description. Project dates and briefs are optional, and galleries can use horizontal scrolling or a full-artwork grid. Videos use native playback controls and do not autoplay. Provide captions in the video itself when speech conveys essential information.

### Draft preview

Set a server-only read token and a strong random `SANITY_PREVIEW_SECRET`. Open:

```text
/api/draft?secret=YOUR_SECRET&path=/work/your-project-slug
```

The endpoint validates the secret and allows only internal studio/project paths. Preview uses an HTTP-only Next.js draft cookie, shows a banner, and reads drafts with a server-side token. Exit with the banner link. Do not distribute preview URLs or log their query strings. The public query never uses the draft token.

## Contact delivery

Set `SITE_URL` to the exact website origin. Configure:

- `RESEND_API_KEY`, `CONTACT_FROM` from a verified sender domain, and `CONTACT_TO` (comma-separated recipients allowed).
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for durable abuse prevention.

The endpoint validates origin, JSON payload size, input values, consent, and a honeypot. It permits three submissions per network identifier per ten minutes, plus fifty globally per hour. Rate-limit failures fail closed. Deploy behind a trusted proxy (such as Vercel) that overwrites `x-forwarded-for`; do not expose an origin that accepts arbitrary client-supplied forwarded headers.

No inquiry is stored in Sanity. Plain-text email avoids injecting submitted HTML. The user's email becomes reply-to, never the sender. Success means Resend accepted the message, not guaranteed inbox delivery. Provider failures and missing configuration display explicit errors; local mode never pretends to send.

Send a real inquiry and check the recipient inbox before calling the contact form live.

## Motion and gallery

### Video hero and rounded surfaces

The homepage uses the supplied MP4 from [works/video](./works/video), with a dark left-side gradient behind the headline and introduction. Image panels, portfolio tiles, poster images, and brand cards share rounded-corner tokens in [app/globals.css](./app/globals.css).

```powershell
npm run assets:hero
```

Place exactly one MP4 in the source folder. This command copies it to [public/hero](./public/hero) and extracts a still poster using installed Edge (or the `PW_BROWSER_CHANNEL` setting). The original is not modified. Re-run it when replacing the reel; the website needs only the resulting public assets, not a browser on the production server.

The reel is decorative, muted, looping, and inline, with a visible keyboard-accessible pause/play control. No JavaScript or reduced-motion preferences show the poster without downloading or automatically playing the reel. Reduced-motion users can explicitly choose playback. Playback failures are surfaced beside the control and leave the poster background visible. The static reference inspired layout and rounding only; its artwork is not included.

Motion preference is subscribed through `useSyncExternalStore`, using a still server-rendered default and reacting to live operating-system preference changes. This avoids the installed Motion version's snapshot-only reduced-motion hook and keeps video, gallery, headlines, and card reveals consistent.

The gallery adapts the supplied scroll-gallery example using Motion's `useScroll` and `useTransform`. On desktop, a sticky viewport translates through panels during vertical scrolling, with a section-local progress bar. Translation is measured from the actual viewport width and updates on resize.

The supplied Pinterest motion reference informed staggered headline entrances and image/card reveals, not the visual identity or content. Text rises into view; photos pop forward with a small spring settle. A shared intersection observer triggers each element once as it enters the viewport, with short stagger delays for poster groups. Motion's `useAnimate` and `stagger` support progressive enhancement: headings and artwork are present before JavaScript, and reduced-motion preferences disable the entrance movement. Keyboard focus immediately settles any in-progress reveal. Only individual content is transformed, never the sticky gallery's ancestors.

Homepage section transitions use asymmetric SVG curves with light-to-navy and navy-to-light gradients around the scroll gallery. Soft blue/cyan backgrounds connect the portfolio, posters, studio, and services; the closing brand strip fades into the footer. Hover and keyboard-focus treatments add gradient accents without tinting the project artwork. These effects use static gradients and short transitions, not continuous animated backgrounds, and honor reduced-motion preferences. No overflow is added around the sticky gallery.

Mobile and reduced-motion layouts show panels in the normal document flow. A skip link bypasses the gallery. Case studies use their CMS media; the DAAT identity study uses original brand boards. The gallery does not change wheel behavior or hijack document scrolling.

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Test the production server with `npm start`. Check desktop, tablet, mobile, keyboard navigation, reduced motion, preview permissions, missing slugs, CMS publishing, and live contact delivery.

Browser tests use installed Microsoft Edge so no browser download is needed. To use installed Chrome instead, set `$env:PW_BROWSER_CHANNEL="chrome"` before running `npm run test:e2e`. The tests assume local content and unconfigured email; unit tests cover configured-provider branches without sending real messages.

If port 3000 is occupied, choose a free test port with `$env:PW_PORT="3001"`. The browser runner's production server uses that origin for contact validation. When starting a preview server yourself on a different port, set `SITE_URL` to its matching origin too.

## Before launch

- Replace the temporary project-logo crops with clean SVG masters when available.
- Approve service copy, project content, and the privacy notice; add the responsible business's identity, contact details, and specific retention policy.
- Configure real accounts, verified email sender, and production `SITE_URL`.
- Confirm the CMS dataset's published read-access policy and Studio permissions.
- Confirm live email delivery and CMS persistence.
- Deploy the application to your authorized hosting account and verify the production URL.

No accounts have been provisioned and no production deployment is performed automatically.
