-- Meal-preference email eligibility and responses.
-- Supabase remains the system of record; Google Sheets receives append-only logs.

alter table public.guests
  add column if not exists meal_preference_email_enabled boolean not null default false,
  add column if not exists meal_preference_email_sent boolean not null default false,
  add column if not exists meal_preference text,
  add column if not exists meal_preference_submission_id uuid;

alter table public.invite_groups
  add column if not exists meal_preferences_submitted_at timestamptz;

-- The email batch reads only attending guests who are manually enabled and unsent.
create index if not exists guests_meal_preference_email_queue_idx
  on public.guests (invite_group_id)
  where attending is true
    and meal_preference_email_enabled is true
    and meal_preference_email_sent is false
    and email is not null;

comment on column public.guests.meal_preference_email_enabled is
  'Whether this guest is eligible to receive the meal-preference email.';
comment on column public.guests.meal_preference_email_sent is
  'Whether the meal-preference email has been successfully sent to this guest.';
comment on column public.guests.meal_preference is
  'The guest’s selected meal; dietary restrictions remain in dietary_restrictions.';
comment on column public.guests.meal_preference_submission_id is
  'Shared UUID for the group meal-preference form submission.';
comment on column public.invite_groups.meal_preferences_submitted_at is
  'Timestamp of the group’s submitted meal-preference form; also locks later edits.';
