# Supabase integration

GymMaxxing now uses Supabase for:

- email/password authentication;
- the exercises and foods catalogs;
- user-owned workouts and meals.

## Local setup

Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

The SQL migration is in `supabase/migrations/`. The catalog seed can be rerun with:

```bash
npm run seed:supabase
```

The app-specific tables use the `gym_` prefix, have RLS enabled, and do not modify unrelated tables already present in the Supabase project.
