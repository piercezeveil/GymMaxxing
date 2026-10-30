-- Academy tenancy, staff specialties and role-aware access to member plans.

create table if not exists public.gym_academies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 120),
  owner_id uuid not null unique references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gym_profiles
  add column if not exists academy_id uuid references public.gym_academies(id) on delete set null,
  add column if not exists professional_type text,
  add column if not exists status text not null default 'Ativo',
  add column if not exists joined_at timestamptz not null default now();

update public.gym_profiles
set professional_type = 'Professor'
where role = 'Profissional' and professional_type is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gym_profiles_professional_type_check'
      and conrelid = 'public.gym_profiles'::regclass
  ) then
    alter table public.gym_profiles
      add constraint gym_profiles_professional_type_check
      check (
        (role = 'Profissional' and professional_type in ('Nutricionista', 'Professor'))
        or (role <> 'Profissional' and professional_type is null)
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'gym_profiles_status_check'
      and conrelid = 'public.gym_profiles'::regclass
  ) then
    alter table public.gym_profiles
      add constraint gym_profiles_status_check
      check (status in ('Ativo', 'Inativo'));
  end if;
end
$$;

create index if not exists gym_profiles_academy_role_idx
  on public.gym_profiles (academy_id, role, full_name)
  where academy_id is not null;

-- Preserve academies that were previously represented only by the organization text.
with academy_owners as (
  select distinct on (coalesce(nullif(lower(trim(organization)), ''), user_id::text))
    user_id,
    coalesce(nullif(trim(organization), ''), 'Academia de ' || full_name) as academy_name,
    coalesce(nullif(lower(trim(organization)), ''), user_id::text) as organization_key
  from public.gym_profiles
  where role = 'Administrador'
  order by coalesce(nullif(lower(trim(organization)), ''), user_id::text), created_at
)
insert into public.gym_academies (name, owner_id)
select academy_name, user_id
from academy_owners
on conflict (owner_id) do nothing;

update public.gym_profiles profile
set academy_id = academy.id
from public.gym_academies academy
where academy.owner_id = profile.user_id
  and profile.role = 'Administrador'
  and profile.academy_id is null;

update public.gym_profiles profile
set academy_id = academy.id
from public.gym_academies academy
join public.gym_profiles owner on owner.user_id = academy.owner_id
where profile.academy_id is null
  and nullif(trim(profile.organization), '') is not null
  and lower(trim(profile.organization)) = lower(trim(owner.organization));

create table if not exists public.gym_academy_invitations (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.gym_academies(id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  role text not null check (role in ('Membro', 'Profissional')),
  professional_type text,
  status text not null default 'Pendente' check (status in ('Pendente', 'Aceito', 'Cancelado')),
  invited_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint gym_academy_invitations_professional_type_check check (
    (role = 'Profissional' and professional_type in ('Nutricionista', 'Professor'))
    or (role = 'Membro' and professional_type is null)
  )
);

create unique index if not exists gym_academy_invitations_pending_email_idx
  on public.gym_academy_invitations (academy_id, lower(email))
  where status = 'Pendente';

create index if not exists gym_academy_invitations_academy_status_idx
  on public.gym_academy_invitations (academy_id, status, created_at desc);

create or replace function private.current_gym_academy_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.academy_id
  from public.gym_profiles profile
  where profile.user_id = (select auth.uid())
$$;

create or replace function private.current_gym_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select profile.role
  from public.gym_profiles profile
  where profile.user_id = (select auth.uid())
$$;

create or replace function private.can_manage_gym_member(target_user_id uuid, required_professional_type text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.gym_profiles actor
    join public.gym_profiles member
      on member.user_id = target_user_id
     and member.academy_id = actor.academy_id
    where actor.user_id = (select auth.uid())
      and actor.role = 'Profissional'
      and actor.professional_type = required_professional_type
      and actor.status = 'Ativo'
      and member.role = 'Membro'
      and member.status = 'Ativo'
      and actor.academy_id is not null
  )
$$;

create or replace function private.can_manage_gym_workout(target_workout_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.gym_workouts workout
    where workout.id = target_workout_id
      and private.can_manage_gym_member(workout.user_id, 'Professor')
  )
$$;

revoke all on function private.current_gym_academy_id() from public, anon, authenticated;
revoke all on function private.current_gym_role() from public, anon, authenticated;
revoke all on function private.can_manage_gym_member(uuid, text) from public, anon, authenticated;
revoke all on function private.can_manage_gym_workout(uuid) from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_gym_academy_id() to authenticated;
grant execute on function private.current_gym_role() to authenticated;
grant execute on function private.can_manage_gym_member(uuid, text) to authenticated;
grant execute on function private.can_manage_gym_workout(uuid) to authenticated;

create or replace function private.attach_gym_academy_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.gym_profiles
  set academy_id = new.id,
      organization = new.name,
      joined_at = now()
  where user_id = new.owner_id
    and role = 'Administrador';
  return new;
end;
$$;

revoke all on function private.attach_gym_academy_owner() from public, anon, authenticated;

drop trigger if exists gym_academies_attach_owner on public.gym_academies;
create trigger gym_academies_attach_owner
after insert on public.gym_academies
for each row execute function private.attach_gym_academy_owner();

drop trigger if exists gym_academies_updated_at on public.gym_academies;
create trigger gym_academies_updated_at
before update on public.gym_academies
for each row execute function private.touch_gym_updated_at();

create or replace function private.apply_gym_academy_invitation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_user_id uuid;
begin
  update public.gym_profiles profile
  set academy_id = new.academy_id,
      organization = academy.name,
      role = new.role,
      professional_type = new.professional_type,
      status = 'Ativo',
      joined_at = now()
  from public.gym_academies academy
  where academy.id = new.academy_id
    and lower(profile.email) = lower(trim(new.email))
    and (profile.academy_id is null or profile.academy_id = new.academy_id)
  returning profile.user_id into matched_user_id;

  if matched_user_id is not null then
    new.status := 'Aceito';
    new.accepted_by := matched_user_id;
    new.accepted_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.apply_gym_academy_invitation() from public, anon, authenticated;

drop trigger if exists gym_academy_invitations_apply on public.gym_academy_invitations;
create trigger gym_academy_invitations_apply
before insert on public.gym_academy_invitations
for each row execute function private.apply_gym_academy_invitation();

-- Claim pending invitations when the invited person creates an account later.
create or replace function private.handle_new_gym_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.gym_academy_invitations%rowtype;
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

  select candidate.* into invitation
  from public.gym_academy_invitations candidate
  where lower(candidate.email) = lower(coalesce(new.email, ''))
    and candidate.status = 'Pendente'
  order by candidate.created_at
  limit 1;

  if invitation.id is not null then
    update public.gym_profiles profile
    set academy_id = invitation.academy_id,
        organization = academy.name,
        role = invitation.role,
        professional_type = invitation.professional_type,
        status = 'Ativo',
        joined_at = now()
    from public.gym_academies academy
    where profile.user_id = new.id
      and academy.id = invitation.academy_id;

    update public.gym_academy_invitations
    set status = 'Aceito', accepted_by = new.id, accepted_at = now()
    where id = invitation.id;
  end if;
  return new;
end;
$$;

revoke all on function private.handle_new_gym_profile() from public, anon, authenticated;

alter table public.gym_academies enable row level security;
alter table public.gym_academy_invitations enable row level security;

grant select, insert, update on public.gym_academies to authenticated;
grant select, insert, delete on public.gym_academy_invitations to authenticated;

revoke insert, update on public.gym_profiles from authenticated;
grant insert (user_id, email, full_name, tone) on public.gym_profiles to authenticated;
grant update (full_name, organization, tone) on public.gym_profiles to authenticated;

drop policy if exists gym_profiles_select_own on public.gym_profiles;
drop policy if exists gym_profiles_select_access on public.gym_profiles;
create policy gym_profiles_select_access on public.gym_profiles
for select to authenticated
using (
  (select auth.uid()) = user_id
  or (
    academy_id = (select private.current_gym_academy_id())
    and (
      (select private.current_gym_role()) = 'Administrador'
      or ((select private.current_gym_role()) = 'Profissional' and role = 'Membro')
    )
  )
);

drop policy if exists gym_academies_select_members on public.gym_academies;
create policy gym_academies_select_members on public.gym_academies
for select to authenticated
using (id = (select private.current_gym_academy_id()));

drop policy if exists gym_academies_insert_admin on public.gym_academies;
create policy gym_academies_insert_admin on public.gym_academies
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and (select private.current_gym_role()) = 'Administrador'
);

drop policy if exists gym_academies_update_owner on public.gym_academies;
create policy gym_academies_update_owner on public.gym_academies
for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists gym_academy_invitations_select_admin on public.gym_academy_invitations;
create policy gym_academy_invitations_select_admin on public.gym_academy_invitations
for select to authenticated
using (
  academy_id = (select private.current_gym_academy_id())
  and (select private.current_gym_role()) = 'Administrador'
);

drop policy if exists gym_academy_invitations_insert_admin on public.gym_academy_invitations;
create policy gym_academy_invitations_insert_admin on public.gym_academy_invitations
for insert to authenticated
with check (
  academy_id = (select private.current_gym_academy_id())
  and invited_by = (select auth.uid())
  and (select private.current_gym_role()) = 'Administrador'
);

drop policy if exists gym_academy_invitations_delete_admin on public.gym_academy_invitations;
create policy gym_academy_invitations_delete_admin on public.gym_academy_invitations
for delete to authenticated
using (
  academy_id = (select private.current_gym_academy_id())
  and (select private.current_gym_role()) = 'Administrador'
);

create policy gym_workouts_select_professor on public.gym_workouts
for select to authenticated
using (private.can_manage_gym_member(user_id, 'Professor'));

create policy gym_workouts_insert_professor on public.gym_workouts
for insert to authenticated
with check (private.can_manage_gym_member(user_id, 'Professor'));

create policy gym_workouts_update_professor on public.gym_workouts
for update to authenticated
using (private.can_manage_gym_member(user_id, 'Professor'))
with check (private.can_manage_gym_member(user_id, 'Professor'));

create policy gym_workouts_delete_professor on public.gym_workouts
for delete to authenticated
using (private.can_manage_gym_member(user_id, 'Professor'));

create policy gym_workout_exercises_select_professor on public.gym_workout_exercises
for select to authenticated
using (private.can_manage_gym_workout(workout_id));

create policy gym_workout_exercises_insert_professor on public.gym_workout_exercises
for insert to authenticated
with check (private.can_manage_gym_workout(workout_id));

create policy gym_workout_exercises_update_professor on public.gym_workout_exercises
for update to authenticated
using (private.can_manage_gym_workout(workout_id))
with check (private.can_manage_gym_workout(workout_id));

create policy gym_workout_exercises_delete_professor on public.gym_workout_exercises
for delete to authenticated
using (private.can_manage_gym_workout(workout_id));

create policy gym_meals_select_nutritionist on public.gym_meals
for select to authenticated
using (private.can_manage_gym_member(user_id, 'Nutricionista'));

create policy gym_meals_insert_nutritionist on public.gym_meals
for insert to authenticated
with check (private.can_manage_gym_member(user_id, 'Nutricionista'));

create policy gym_meals_update_nutritionist on public.gym_meals
for update to authenticated
using (private.can_manage_gym_member(user_id, 'Nutricionista'))
with check (private.can_manage_gym_member(user_id, 'Nutricionista'));

create policy gym_meals_delete_nutritionist on public.gym_meals
for delete to authenticated
using (private.can_manage_gym_member(user_id, 'Nutricionista'));
