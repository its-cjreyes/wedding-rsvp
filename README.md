# Mac and CJ Wedding RSVP

Public RSVP web app built with Next.js App Router, TypeScript, SCSS Modules, Supabase Postgres, Google Sheets webhooks, and Resend email invites.

## Stack

- Next.js (App Router)
- TypeScript
- SCSS Modules (`sass`)
- Supabase (`@supabase/supabase-js`)
- Resend
- Google Sheets webhook
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
NEXT_PUBLIC_SITE_URL=
SHEETS_WEBHOOK_URL=
SHEETS_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
TEST_INVITE_EMAIL=
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

- `POST /api/lookup`
  - Input: `{ "invite_code": "..." }`
  - Returns one of:
    - `{ status: "match", group_id, guests }`
    - `{ status: "locked" }`
    - `{ status: "none" }`

- `POST /api/submit`
  - Input: `{ group_id, guests: [{ id, attending, dietary, first_name?, last_name? }] }`
  - On success:
    - updates all guest rows with attendance, dietary, submission UUID
    - locks invite group
    - posts one webhook payload per guest to the Sheets webhook
    - returns `{ status: "success", submission_id, webhook_failures }`

- `POST /api/send-test-invite`
  - Input: `{ guest_id? }` or `{ guest_email? }`
  - Sends one Resend invite email to `TEST_INVITE_EMAIL`
  - Uses that guest's shared invite code in the RSVP URL

## Invite Emails

- The email RSVP link uses `/rsvp?code=...`.
- The RSVP form prefills the invite code field only.
- Guests still must click `Continue` manually.
- Final submission locking remains controlled by the existing lookup and submit flow.

### Manual Batch Send

```bash
npm run send:invites -- --confirm
```

- Sends one email per guest row with a non-empty email address.
- Guests in the same invite group receive separate emails with the same shared invite code.
- The script logs successes and failures and exits non-zero if any sends fail.

## Manual Test Plan

1. Exact match lookup
- Enter a valid invite code.
- Expect `match` and full invite group rendered.

2. Unknown code
- Enter an invalid invite code.
- Expect a not-found message.

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

6. Sheets webhook firing
- Confirm one webhook request per guest is received by the Apps Script webhook.
- Validate payload includes:
  - `submission_id`
  - `group_id`
  - `first_name`
  - `last_name`
  - `attending`
  - `dietary`
  - `submitted_at`

7. Google Sheets row creation (if connected via the webhook)
- Confirm each guest creates a row in the sheet.

8. Invite email prefill
- Send a test invite through `POST /api/send-test-invite`.
- Open the RSVP link from the email.
- Confirm the invite code field is prefilled but not auto-submitted.

## Deployment (Vercel)

1. Push repository to GitHub.
2. Import project into Vercel.
3. Set environment variables in Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SHEETS_WEBHOOK_URL`
- `SHEETS_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TEST_INVITE_EMAIL`
4. Deploy.
5. Run the manual test plan against the live preview URL.

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. It is only used in API routes and `src/lib/supabase-server.ts`.
- `RESEND_API_KEY` is server-only. It is only used in server routes and manual scripts.
- No Supabase Auth is used in this application.
