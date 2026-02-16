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
