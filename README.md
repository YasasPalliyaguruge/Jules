# Jules — Private Daily Check-In

![Jules wellness project cover](assets/recruiter/cover.png)

Jules is a browser-local reflection app built with Next.js, React and TypeScript. It provides one complete workflow for recording mood, energy, sleep, intentions, appreciation and optional notes without requiring an account or backend.

## Implemented features

- One check-in per selected date, with safe update behaviour.
- Mood and energy scales with descriptive labels.
- Sleep-hour validation.
- Intention, appreciation and private notes.
- Seven-entry averages for mood, energy and sleep.
- Browser `localStorage` persistence.
- Safe recovery when saved data is malformed or storage is unavailable.
- Edit and delete individual check-ins.
- Confirmed full-history clearing.
- JSON history export.
- Responsive, keyboard-accessible forms and history cards.

## Privacy and clinical boundary

Check-ins remain in the current browser profile unless the user exports or clears them. Jules does not provide authentication, cloud synchronisation, therapist discovery, diagnosis, treatment, crisis support or medical advice.

It is a personal journaling interface, not a healthcare service.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs the same checks on pull requests and pushes to `main`.

## Technology

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Browser local storage

## Current limitations

- Data is limited to one browser profile and device.
- There is no encryption layer beyond the browser and operating system’s normal storage controls.
- Exported JSON files are the user’s responsibility to store securely.
- The seven-entry summary is descriptive only and should not be interpreted as a health assessment.
