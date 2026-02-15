# Mac and CJ Wedding RSVP

Public RSVP web app built with Next.js App Router, TypeScript, SCSS Modules, Supabase Postgres, and Zapier webhooks.

## Stack

- Next.js (App Router)
- TypeScript
- SCSS Modules (`sass`)
- Supabase (`@supabase/supabase-js`)
- Zapier incoming webhook
- Vercel deployment target

## Requirements

- Node.js `>=20.9.0`
- npm

Use `.nvmrc` to align local Node version.

## Environment Variables

Create `/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ZAPIER_WEBHOOK_URL=
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

- `POST /api/lookup`
  - Input: `{ "first_name": "...", "last_name": "..." }`
  - Returns one of:
    - `{ status: "match", group_id, guests }`
    - `{ status: "suggestions", matches }`
    - `{ status: "locked" }`
    - `{ status: "none" }`

- `POST /api/submit`
  - Input: `{ group_id, guests: [{ id, attending, dietary, first_name?, last_name? }] }`
  - On success:
    - updates all guest rows with attendance, dietary, submission UUID
    - locks invite group
    - posts one webhook payload per guest to Zapier
    - returns `{ status: "success", submission_id, webhook_failures }`

## Manual Test Plan

1. Exact match lookup
- Enter full first/last name for an invited guest.
- Expect `match` and full invite group rendered.

2. Partial suggestion
- Enter partial or misspelled name.
- Expect `Did you mean?` suggestions.

3. Split attendance in a group
- Mark one guest attending and another declining.
- Submit and verify each guest record updated accordingly.

4. Plus-one placeholder flow
- Use a group with `is_plus_one=true` and missing first/last name.
- Mark plus one attending.
- Verify first and last name are required before submit.

5. Lock behavior
- Submit RSVP for a group.
- Attempt lookup again; expect locked state.
- Attempt direct submit again; expect conflict/locked error.

6. Zapier webhook firing
- Confirm one webhook request per guest is received by Zapier.
- Validate payload includes:
  - `submission_id`
  - `group_id`
  - `first_name`
  - `last_name`
  - `attending`
  - `dietary`
  - `submitted_at`

7. Google Sheets row creation (if connected via Zapier)
- Confirm each guest creates a row in the sheet.

## Deployment (Vercel)

1. Push repository to GitHub.
2. Import project into Vercel.
3. Set environment variables in Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ZAPIER_WEBHOOK_URL`
4. Deploy.
5. Run the manual test plan against the live preview URL.

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. It is only used in API routes and `src/lib/supabase-server.ts`.
- No Supabase Auth is used in this application.
