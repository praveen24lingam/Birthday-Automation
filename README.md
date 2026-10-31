# NavGurukul Birthday Board

A monthly birthday board: blow out the candles, flip everyone’s picture card,
leave a wish, share a memory or an old photo. The birthday team gets its own
dashboard to set up each month.

**Status: design preview.** Everything works, but data is saved only in the
browser you’re using. Google sign-in and the shared database (Firebase) come in
phase 2, after the team has reviewed the design.

## Tech stack

| Part | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (React 19, TypeScript), static export | Production standard; builds to plain files that host anywhere for free |
| Styling | Tailwind CSS 4 + CSS variables per template | Five full themes from one set of components |
| UI primitives | Radix UI (tabs, dialog, switch) | Accessible, keyboard-friendly building blocks (the base of shadcn/ui) |
| UI animation | Motion (Framer Motion) | Card flips, page and list transitions, spring physics |
| Scene animation | GSAP | Hero decorations, parallax, lanterns, stars, balloons |
| Celebration | canvas-confetti | Confetti in each template’s colours |
| Music | Tone.js | Music generated in the browser: a loop per template and a music-box “Happy Birthday” (public domain). No audio files or licences |
| Fonts | Fontsource (self-hosted) | Hind, Rozha One, Yatra One, Caveat, Cormorant Garamond, Baloo 2 |

## Run it on your computer

Needs Node.js 20 or newer.

```bash
npm install
npm run dev        # open http://localhost:3000
```

## Share a preview link with the team (free, no command line)

```bash
npm run build      # creates the "out" folder
```

1. Go to https://app.netlify.com/drop
2. Drag the `out` folder onto the page.
3. You get a link in a few seconds. Create a free Netlify account when asked, or the link expires after an hour.

The ready-made `out` folder is also included as `birthday-board-preview-site.zip`; unzip it and drag the folder in.

**Remember while reviewing:** in the preview, each person’s wishes and changes stay in their own browser. On the sign-in screen, use “Sign in as birthday team” to see the team dashboard, and the footer link to switch between the two views.

## Where to change things

| What | File |
|---|---|
| Templates: names, colours, confetti | `src/lib/templates.ts` and the `html[data-tpl=…]` blocks in `src/app/globals.css` |
| Hero decorations per template | `src/components/hero/Decorations.tsx` |
| Music per template | `PATTERNS` in `src/lib/audio.ts` |
| Pages | `src/app/*/page.tsx` |
| Birthday team dashboard | `src/components/team/*` |
| Sample people for the preview | `seed()` in `src/lib/data/mock.ts` |

## Phase 2: Firebase (free Spark plan, no card)

The UI talks to the backend only through the `BoardRepo` and `AuthService`
interfaces in `src/lib/data/types.ts`. Phase 2 adds `src/lib/data/firebase.ts`
and switches the two lines in `src/lib/data/index.ts`; no page changes.

- **Sign-in:** Google, @navgurukul.org accounts only (checked in the UI and again in the security rules).
- **Roles:** an `admins` list in Firestore; only those emails open the birthday team dashboard and can change people, settings and other people’s posts.
- **Data:** Firestore. Photos are compressed in the browser and stored in the document, so paid Cloud Storage isn’t needed.
- **1st-of-the-month clean-up:** a free scheduled GitHub Action deletes last month’s wishes, memories and photos.
- **Hosting:** Firebase Hosting (free), e.g. `navgurukul-birthdays.web.app`.
