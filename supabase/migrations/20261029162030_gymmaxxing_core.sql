-- GymMaxxing-specific schema. Existing public tables belong to another application
-- and are intentionally not modified here.

create schema if not exists private;

create table if not exists public.gym_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  role text not null default 'Membro' check (role in ('Membro', 'Profissional', 'Administrador')),
  organization text,
  tone text not null default 'purple',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gym_exercises (
  id text primary key,
  name text not null,
  muscle_group text not null,
  equipment text not null default 'Peso corporal',
  level text not null default 'Iniciante',
  aliases text[] not null default '{}',
  is_system boolean not null default true,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint gym_exercises_custom_owner check (is_system or created_by is not null)
);

create index if not exists gym_exercises_muscle_group_idx on public.gym_exercises (muscle_group);
create index if not exists gym_exercises_created_by_idx on public.gym_exercises (created_by);

create table if not exists public.gym_foods (
  id text primary key,
  name text not null,
  category text not null,
  default_portion integer not null default 100 check (default_portion > 0),
  calories numeric(10, 2) not null default 0 check (calories >= 0),
  protein numeric(10, 2) not null default 0 check (protein >= 0),
  carbs numeric(10, 2) not null default 0 check (carbs >= 0),
  fat numeric(10, 2) not null default 0 check (fat >= 0),
  fiber numeric(10, 2) not null default 0 check (fiber >= 0),
  sugar numeric(10, 2) not null default 0 check (sugar >= 0),
  sodium numeric(10, 2) not null default 0 check (sodium >= 0),
  tags text not null default '',
  is_system boolean not null default true,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint gym_foods_custom_owner check (is_system or created_by is not null)
);

create index if not exists gym_foods_category_idx on public.gym_foods (category);
create index if not exists gym_foods_created_by_idx on public.gym_foods (created_by);

create table if not exists public.gym_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_key text not null check (day_key in ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta')),
  day_label text not null,
  title text not null,
  duration text,
  color text not null default 'violet',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gym_workouts_user_day_idx on public.gym_workouts (user_id, day_key, sort_order);

create table if not exists public.gym_workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.gym_workouts(id) on delete cascade,
  exercise_id text references public.gym_exercises(id) on delete set null,
  name text not null,
  muscle_group text not null default 'outros',
  equipment text,
  level text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gym_workout_exercises_workout_idx on public.gym_workout_exercises (workout_id, sort_order);
create index if not exists gym_workout_exercises_exercise_idx on public.gym_workout_exercises (exercise_id);

create table if not exists public.gym_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_key text not null check (day_key in ('Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo')),
  name text not null,
  time text,
  calories numeric(10, 2) not null default 0 check (calories >= 0),
  protein numeric(10, 2) not null default 0 check (protein >= 0),
  fat numeric(10, 2) not null default 0 check (fat >= 0),
  carbs numeric(10, 2) not null default 0 check (carbs >= 0),
  fiber numeric(10, 2) not null default 0 check (fiber >= 0),
  sugar numeric(10, 2) not null default 0 check (sugar >= 0),
  sodium numeric(10, 2) not null default 0 check (sodium >= 0),
  foods jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gym_meals_user_day_idx on public.gym_meals (user_id, day_key, sort_order);

create or replace function private.touch_gym_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gym_profiles_updated_at on public.gym_profiles;
create trigger gym_profiles_updated_at
before update on public.gym_profiles
for each row execute function private.touch_gym_updated_at();

drop trigger if exists gym_workouts_updated_at on public.gym_workouts;
create trigger gym_workouts_updated_at
before update on public.gym_workouts
for each row execute function private.touch_gym_updated_at();

drop trigger if exists gym_meals_updated_at on public.gym_meals;
create trigger gym_meals_updated_at
before update on public.gym_meals
for each row execute function private.touch_gym_updated_at();

create or replace function private.handle_new_gym_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.gym_profiles (user_id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Usuário')
  )
  on conflict (user_id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

revoke all on function private.handle_new_gym_profile() from public;

drop trigger if exists on_auth_user_created_gym_profile on auth.users;
create trigger on_auth_user_created_gym_profile
after insert on auth.users
for each row execute function private.handle_new_gym_profile();

alter table public.gym_profiles enable row level security;
alter table public.gym_exercises enable row level security;
alter table public.gym_foods enable row level security;
alter table public.gym_workouts enable row level security;
alter table public.gym_workout_exercises enable row level security;
alter table public.gym_meals enable row level security;

grant select, insert, update on public.gym_profiles to authenticated;
grant select, insert, update, delete on public.gym_exercises to authenticated;
grant select, insert, update, delete on public.gym_foods to authenticated;
grant select, insert, update, delete on public.gym_workouts to authenticated;
grant select, insert, update, delete on public.gym_workout_exercises to authenticated;
grant select, insert, update, delete on public.gym_meals to authenticated;

drop policy if exists gym_profiles_select_own on public.gym_profiles;
create policy gym_profiles_select_own on public.gym_profiles
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists gym_profiles_insert_own on public.gym_profiles;
create policy gym_profiles_insert_own on public.gym_profiles
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists gym_profiles_update_own on public.gym_profiles;
create policy gym_profiles_update_own on public.gym_profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists gym_exercises_select_catalog on public.gym_exercises;
create policy gym_exercises_select_catalog on public.gym_exercises
for select to authenticated
using (is_system or (select auth.uid()) = created_by);

drop policy if exists gym_exercises_insert_custom on public.gym_exercises;
create policy gym_exercises_insert_custom on public.gym_exercises
for insert to authenticated
with check ((select auth.uid()) = created_by and is_system = false);

drop policy if exists gym_exercises_update_custom on public.gym_exercises;
create policy gym_exercises_update_custom on public.gym_exercises
for update to authenticated
using ((select auth.uid()) = created_by and is_system = false)
with check ((select auth.uid()) = created_by and is_system = false);

drop policy if exists gym_exercises_delete_custom on public.gym_exercises;
create policy gym_exercises_delete_custom on public.gym_exercises
for delete to authenticated
using ((select auth.uid()) = created_by and is_system = false);

drop policy if exists gym_foods_select_catalog on public.gym_foods;
create policy gym_foods_select_catalog on public.gym_foods
for select to authenticated
using (is_system or (select auth.uid()) = created_by);

drop policy if exists gym_foods_insert_custom on public.gym_foods;
create policy gym_foods_insert_custom on public.gym_foods
for insert to authenticated
with check ((select auth.uid()) = created_by and is_system = false);

drop policy if exists gym_foods_update_custom on public.gym_foods;
create policy gym_foods_update_custom on public.gym_foods
for update to authenticated
using ((select auth.uid()) = created_by and is_system = false)
with check ((select auth.uid()) = created_by and is_system = false);

drop policy if exists gym_foods_delete_custom on public.gym_foods;
create policy gym_foods_delete_custom on public.gym_foods
for delete to authenticated
using ((select auth.uid()) = created_by and is_system = false);

drop policy if exists gym_workouts_select_own on public.gym_workouts;
create policy gym_workouts_select_own on public.gym_workouts
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists gym_workouts_insert_own on public.gym_workouts;
create policy gym_workouts_insert_own on public.gym_workouts
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists gym_workouts_update_own on public.gym_workouts;
create policy gym_workouts_update_own on public.gym_workouts
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists gym_workouts_delete_own on public.gym_workouts;
create policy gym_workouts_delete_own on public.gym_workouts
for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists gym_workout_exercises_select_own on public.gym_workout_exercises;
create policy gym_workout_exercises_select_own on public.gym_workout_exercises
for select to authenticated
using (exists (select 1 from public.gym_workouts where gym_workouts.id = workout_id and gym_workouts.user_id = (select auth.uid())));

drop policy if exists gym_workout_exercises_insert_own on public.gym_workout_exercises;
create policy gym_workout_exercises_insert_own on public.gym_workout_exercises
for insert to authenticated
with check (exists (select 1 from public.gym_workouts where gym_workouts.id = workout_id and gym_workouts.user_id = (select auth.uid())));

drop policy if exists gym_workout_exercises_update_own on public.gym_workout_exercises;
create policy gym_workout_exercises_update_own on public.gym_workout_exercises
for update to authenticated
using (exists (select 1 from public.gym_workouts where gym_workouts.id = workout_id and gym_workouts.user_id = (select auth.uid())))
with check (exists (select 1 from public.gym_workouts where gym_workouts.id = workout_id and gym_workouts.user_id = (select auth.uid())));

drop policy if exists gym_workout_exercises_delete_own on public.gym_workout_exercises;
create policy gym_workout_exercises_delete_own on public.gym_workout_exercises
for delete to authenticated
using (exists (select 1 from public.gym_workouts where gym_workouts.id = workout_id and gym_workouts.user_id = (select auth.uid())));

drop policy if exists gym_meals_select_own on public.gym_meals;
create policy gym_meals_select_own on public.gym_meals
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists gym_meals_insert_own on public.gym_meals;
create policy gym_meals_insert_own on public.gym_meals
for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists gym_meals_update_own on public.gym_meals;
create policy gym_meals_update_own on public.gym_meals
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists gym_meals_delete_own on public.gym_meals;
create policy gym_meals_delete_own on public.gym_meals
for delete to authenticated
using ((select auth.uid()) = user_id);
