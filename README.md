# DAAT

A responsive studio website built with Next.js, Sanity, Motion for React, and Resend. The palette and typography follow the supplied DAAT identity references. The wordmark and directional mark now use the exact geometry from the supplied DAAT SVG masters.

## Run locally

Requires Node.js 22.12 or newer.

```powershell
npm install
npm run dev
```

Open the URL printed by Next.js. Without Sanity configuration, the site displays the supplied AeroGrain, PulseDock, Solvanta Labs, Apex, and poster collections, plus DAAT's own identity study. It does not invent dates, briefs, awards, or results for these projects. Edit this content in [lib/local-content.ts](./lib/local-content.ts).

## Studio and contact pages

The About page explains the studio in plain language, lists service capabilities and possible deliverables, describes common project starting points, and outlines a four-step working process. Its service titles, descriptions, and lists use the same published CMS content as the Services page (or local services when CMS is unconfigured). Missing service content remains an explicit update state, not invented offerings. Deliverables are presented as scope-dependent capabilities, not a promise that every inquiry includes everything.

The Contact page is a single white rounded card on a soft blue background. The left panel uses a layered DAAT gradient (navy, blue, azure, cyan, jordy) with the DAAT mark, a "line open" badge, and a short statement; the right side holds the heading and the existing inquiry form, restyled with boxed fields and a full-width blue button. An SVG rotary-telephone illustration ([contact-phone.tsx](./components/contact-phone.tsx)) sits on a white rounded tile in the gradient panel, drawn directly in DAAT colors so it stays crisp at any size. On page load it rings once (handset lift, body shake, blue pulse rings); hovering the panel keeps it ringing and spins the dial. Motion is pure CSS, never loops without hover, and is removed entirely for reduced-motion preferences. The illustration is decorative, not a phone-number or telephone-support offer, and no form validation, privacy guidance, consent, or delivery behavior changes.

## Supplied artwork

The 36 remaining source images live in [works](./works), including 10 posters after the requested removals. Optimized WebP copies live in [public/works](./public/works); the homepage image wall, project cards, project galleries, and campaign grid use these files. The Solvanta social-layout image found inside the Apex source folder is associated with Solvanta without moving its original.

```powershell
npm run assets:works
```

This regenerates the WebP assets and manifest after changing source images and removes stale numbered WebP derivatives from each processed output collection. It never removes source artwork or other output filenames. Keep caption order and project mappings in sync in [lib/local-content.ts](./lib/local-content.ts); generated image numbering follows the remaining source filenames. The homepage poster wall shows every remaining poster in a single row that slides sideways. It pauses on hover, keyboard focus, or with its pause button, and becomes a still row you can scroll sideways when reduced motion is preferred. Conversion preserves image proportions and does not enlarge artwork. Scroll-gallery image frames shrink to the artwork's natural proportions, without colored letterboxing or cropping, on desktop, mobile, and reduced-motion layouts. Portrait campaign pieces use an uncropped responsive masonry grid instead of a pinned sequence.

### Official DAAT logo and project ticker

```powershell
npm run assets:brand
```

This prepares DAAT's wordmark, icon geometry, and favicon from [works/SVGs](./works/SVGs), preserving their paths and removing export whitespace. The inline components inherit the appropriate theme color.

The homepage logo-only ticker uses temporary transparent crops from the four supplied project collections, as requested. These are raster approximations, not vector masters. Replace the image paths and dimensions in [lib/project-logos.ts](./lib/project-logos.ts) when clean SVGs arrive; do not run the crop script over replacement files using the same filenames.

A short studio statement, three impact cards, and a borderless monochrome logo ticker sit between the hero and the portfolio wall.

The homepage portfolio wall shows DAAT's web development work, listed in [lib/web-projects.ts](./lib/web-projects.ts). A project with a screenshot (stored in [public/web](./public/web)) shows it as a full tile; one without a screenshot gets a branded text tile; an in-development project gets a status pill and no link. Live sites open in a new tab. To add a screenshot later, put the image in `public/web` and set the project's `image`.

Project cards carry everything inside the photo. A small pill in the top-left corner names the type of work (for example "Branding"), and the project name and type sit in the bottom-left over a soft shade. On hover or keyboard focus, the photo darkens slightly and a two-line description opens beneath the name; touch screens skip the description.

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

### Building hero, particle footer, and rounded surfaces

The homepage uses [building.jpg](./public/building.jpg) with cursor-driven water refraction and subtle static grain, inspired by [the hero reference](./public/hero%20section%20effect.mp4). Mouse movement leaves expanding radial ripples in the image, not a whole-image wobble or translation. Each wave fades over 1.6 seconds; a stationary or absent pointer leaves the image still after the waves settle. A small canvas produces a two-channel displacement texture consumed by SVG; its longest edge is capped at 192 pixels, with at most six live waves and 24 image-space pixels of displacement per channel. No texture encoding occurs when idle. The artwork is overscanned to hide warped edges. Only the artwork is distorted: the CMS headline, the "Explore our work" link, and controls stay sharp. The headline and link sit in the bottom-left corner over a soft corner shade, leaving the rest of the image clear. Image panels, portfolio tiles, poster images, and brand cards share rounded-corner tokens in [app/globals.css](./app/globals.css).

The global footer uses [gradiant.jpg](./public/gradiant.jpg), dense irregular canvas particle clouds curling along its edges, compact utility rows, and an oversized DAAT invitation inspired by [the footer reference](./public/footer%20effect.mp4). Particle positions are seeded rather than laid out on a dot grid, with a responsive budget of 12 particles per CSS pixel of width, capped at 14,000. A short atmospheric band and a masked top fade avoid an empty panel or hard seam. It retains the contact, home, and privacy destinations and original DAAT wordmark. The recordings are references only; their footage and branding are not embedded.

Mouse movement produces local refraction in the hero; the footer gradient shifts gently and its particles curl into a local vortex around the pointer. Leaving the hero lets existing waves fade without generating a trail back to the center. Leaving the footer returns its motion to neutral. Pointer listeners attach to the section, not the decorative layers, so links remain clickable. Touch scrolling is not intercepted. Pausing or reduced-motion defaults disable pointer-driven motion as well as automatic animation.

The footer invitation also uses a particle-text animation adapted from the supplied React Bits example. It gathers once when the headline enters the viewport, then gently drifts and repels from the mouse. Font-loaded canvas sampling preserves the two-line Aspekta headline, including letter spacing and baselines; resize resamples the glyphs without restarting the entrance. Gathering takes 1.6 seconds with up to 420 ms of stagger, and text particles are capped at 5,200. The existing footer pause control governs both its background and text. Offscreen/hidden suspension preserves progress; reduced motion, no JavaScript, pause, or a text-renderer failure shows the original semantic heading. The decorative canvas is hidden from assistive technology and does not intercept touch scrolling or links. No registry package or Tailwind setup is required.

Both effects have independent, keyboard-accessible pause/resume controls. Reduced motion and no JavaScript show static artwork; no-JavaScript pages omit unusable motion controls. Reduced-motion users can explicitly enable an effect. Live preference changes reset that choice to the new preference. Animation suspends offscreen and when the document is hidden, without losing the user's pause choice. The shared lifecycle caps updates at 30 per second, caps canvas pixel ratio at 1.5, and cleans up frames/listeners/observers. Image or renderer failures are logged and shown beside the controls; text and links remain available.

#### Retained reel preparation tool

The previous reel and its source files remain available, but the active homepage does not load or play them.

```powershell
npm run assets:hero
```

Place exactly one MP4 in [works/video](./works/video). This optional legacy command copies it to [public/hero](./public/hero) and extracts a still poster using installed Edge (or the `PW_BROWSER_CHANNEL` setting). The original is not modified. It is not required for the current building hero.

Motion preference is subscribed through `useSyncExternalStore`, using a still server-rendered default and reacting to live operating-system preference changes. This avoids the installed Motion version's snapshot-only reduced-motion hook and keeps the decorative effects, gallery, headlines, and card reveals consistent.

The gallery adapts the supplied scroll-gallery example using Motion's `useScroll` and `useTransform`. On desktop, a sticky viewport translates through panels during vertical scrolling, with a section-local progress bar. Translation is measured from the actual viewport width and updates on resize.

The supplied Pinterest motion reference informed staggered headline entrances and image/card reveals, not the visual identity or content. Text rises into view; photos pop forward with a small spring settle. A shared intersection observer triggers each element once as it enters the viewport, with short stagger delays for poster groups. Motion's `useAnimate` and `stagger` support progressive enhancement: headings and artwork are present before JavaScript, and reduced-motion preferences disable the entrance movement. Keyboard focus immediately settles any in-progress reveal. Only individual content is transformed, never the sticky gallery's ancestors.

Homepage section transitions around the scroll gallery are tall, smooth vertical gradients (navy, deep indigo, blue, light blue, white) with a soft dark glow from the dark edge. Soft blue/cyan backgrounds connect the portfolio, posters, studio, and services; the closing brand strip leads into the gradient footer. Hover and keyboard-focus treatments add gradient accents without tinting the project artwork. These section treatments use static gradients and short transitions, independently of the decorative hero/footer motion, and honor reduced-motion preferences. No overflow is added around the sticky gallery.

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
