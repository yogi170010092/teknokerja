# Prey device monitoring

Deploy the function and add the secret to the linked Supabase project:

```bash
npx supabase secrets set PREY_API_KEY="YOUR_NEW_READ_ONLY_KEY"
npx supabase functions deploy prey-devices
```

Use a newly generated **Read** key. Never prefix this secret with `VITE_` and
never place it in `.env`, frontend source, or Git.
