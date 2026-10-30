alter table public.gym_profiles
  drop constraint if exists gym_profiles_professional_type_check;

alter table public.gym_academy_invitations
  drop constraint if exists gym_academy_invitations_professional_type_check;

update public.gym_profiles
set professional_type = 'Educador Físico'
where professional_type = 'Professor';

update public.gym_academy_invitations
set professional_type = 'Educador Físico'
where professional_type = 'Professor';

alter table public.gym_profiles
  add constraint gym_profiles_professional_type_check
  check (
    (role = 'Profissional' and professional_type in ('Nutricionista', 'Educador Físico'))
    or (role <> 'Profissional' and professional_type is null)
  );

alter table public.gym_academy_invitations
  add constraint gym_academy_invitations_professional_type_check
  check (
    (role = 'Profissional' and professional_type in ('Nutricionista', 'Educador Físico'))
    or (role = 'Membro' and professional_type is null)
  );

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
      and private.can_manage_gym_member(workout.user_id, 'Educador Físico')
  )
$$;

revoke all on function private.can_manage_gym_workout(uuid) from public, anon, authenticated;
grant execute on function private.can_manage_gym_workout(uuid) to authenticated;

drop policy if exists gym_workouts_select_access on public.gym_workouts;
create policy gym_workouts_select_access on public.gym_workouts
for select to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Educador Físico')
);

drop policy if exists gym_workouts_insert_access on public.gym_workouts;
create policy gym_workouts_insert_access on public.gym_workouts
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Educador Físico')
);

drop policy if exists gym_workouts_update_access on public.gym_workouts;
create policy gym_workouts_update_access on public.gym_workouts
for update to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Educador Físico')
)
with check (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Educador Físico')
);

drop policy if exists gym_workouts_delete_access on public.gym_workouts;
create policy gym_workouts_delete_access on public.gym_workouts
for delete to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Educador Físico')
);

create or replace function private.handle_new_gym_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.gym_academy_invitations%rowtype;
  requested_role text;
  requested_professional_type text;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('Membro', 'Profissional', 'Administrador')
      then new.raw_user_meta_data ->> 'role'
    else 'Membro'
  end;

  requested_professional_type := case
    when requested_role = 'Profissional'
      and new.raw_user_meta_data ->> 'professional_type' in ('Nutricionista', 'Educador Físico')
      then new.raw_user_meta_data ->> 'professional_type'
    else null
  end;

  if requested_role = 'Profissional' and requested_professional_type is null then
    requested_role := 'Membro';
  end if;

  insert into public.gym_profiles (user_id, email, full_name, role, professional_type)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, ''), '@', 1), 'Usuário'),
    requested_role,
    requested_professional_type
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
