# Opportunity Operator

## Supabase setup
1. In your Supabase project, open SQL Editor and run `supabase/schema.sql`.
2. Set environment variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WEBHOOK_SECRET`
3. Start the app and create/sign in a user via `/login` using email OTP.
4. Get the `userId` for webhook payloads from Supabase Auth (Users table) and send:
   ```json
   {
     "userId": "<uuid>",
     "opportunities": []
   }
   ```
   with header `x-webhook-secret: <WEBHOOK_SECRET>` to `/api/webhook/opportunities`.


## SOC 2 / ISO 27001 examples
- Use `/settings` and click **Import SOC 2 / ISO 27001 examples** to load 20 opportunities + 1 demo client using the same import/export schema.
- The source payload lives at `src/lib/examples/soc2-iso27001-import.json`.
