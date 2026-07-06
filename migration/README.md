# TeknoKerja — Migration to Your Own Supabase

This folder contains everything needed to run TeknoKerja on your own Supabase
project, independent of Lovable Cloud.

> **Why this can't be executed from inside this Lovable project:**
> All Supabase tools in the Lovable agent (migration, storage, auth config) are
> hard-wired to the Lovable Cloud backend. `.env`, `src/integrations/supabase/client.ts`,
> and `supabase/config.toml` are auto-generated and reverted on sync.
> You must run the steps below **outside** this Lovable Cloud project — either
> in a fresh Lovable project created from GitHub *without* enabling Cloud, or
> directly on Vercel/Netlify + Supabase.

---

## Files in this folder

| File | Purpose |
|---|---|
| `0001_init.sql` | Full schema: extensions, enums, tables, GRANTs, RLS policies, triggers, storage buckets + object policies, auth trigger. Paste into Supabase SQL Editor. |
| `send-admin-notification.ts` | Portable Edge Function (calls Resend API directly, no Lovable gateway). |
| `.env.example` | Env vars to set in the new deployment + Supabase Edge Function secrets. |

---

## Step-by-step

### 1. Create Supabase project
1. https://supabase.com → New project. Pick region **Southeast Asia (Singapore)**.
2. Copy **Project URL** and **anon key** from Settings → API.

### 2. Run the schema
1. SQL Editor → New query.
2. Paste the entire contents of `0001_init.sql` → Run.
3. Verify: `select table_name from information_schema.tables where table_schema='public';` → should list 11 tables.

### 3. Configure Auth
- Authentication → Providers → **Email**: enable, **disable "Enable sign-ups"** (admins are created manually).
- Authentication → URL Configuration → Site URL = your production domain; add preview URLs to Redirect URLs.
- (Optional) Enable **Leaked password protection**.

### 4. Create your first super admin
1. Authentication → Users → Add user → email + password → copy the new user's UUID.
2. SQL Editor:
   ```sql
   insert into public.user_roles (user_id, role) values ('<paste-uuid>', 'super_admin');
   ```

### 5. Storage
Buckets `laptops`, `testimonials`, `articles`, `instagram` are already created by
`0001_init.sql` (private, RLS-gated). No dashboard action needed. Front-end
generates signed URLs via `supabase.storage.from(...).createSignedUrl(...)`.

### 6. Deploy the edge function
1. Install Supabase CLI: `npm i -g supabase`.
2. `supabase login`
3. `supabase link --project-ref <your-project-ref>`
4. Copy `migration/send-admin-notification.ts` → `supabase/functions/send-admin-notification/index.ts`
5. Add `supabase/config.toml`:
   ```toml
   [functions.send-admin-notification]
   verify_jwt = false
   ```
6. Set secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx ADMIN_EMAIL=you@teknokerja.com FROM_EMAIL="TeknoKerja <no-reply@teknokerja.com>"
   ```
7. Deploy: `supabase functions deploy send-admin-notification`

### 7. Wire the frontend
In the new deployment, set the `VITE_SUPABASE_*` env vars from `.env.example`.
The existing `src/integrations/supabase/client.ts` code already reads these —
no code changes needed as long as the file uses `import.meta.env`.

### 8. Smoke-test checklist
- [ ] `/admin` login with the super_admin user
- [ ] Create a laptop, upload photo → visible on `/laptop-stock`
- [ ] Submit booking form → row appears in `bookings`, email arrives
- [ ] Create + publish an article → visible publicly
- [ ] Add testimonial → visible on homepage
- [ ] Instagram gallery upload → visible in homepage section
- [ ] Website settings edit → persists
- [ ] WhatsApp click → row appears in `whatsapp_leads`

### 9. Cut over the domain
Point your DNS to the new deployment (Vercel/Netlify). Done.

---

## Notes

- **No data is copied.** You said the current Cloud DB has ~no production data.
  If you want to move even the 1–2 bookings/testimonials, export CSV from Cloud
  → Advanced Settings → Export data, then `COPY` into the new tables.
- The `private` schema hides `is_admin`/`has_role` from PostgREST while still
  being callable from RLS policies. Public wrappers exist for backward compat.
- All 11 tables have explicit GRANTs — required because Supabase does not grant
  default privileges on the public schema anymore.
