create index if not exists gym_academy_invitations_invited_by_idx
  on public.gym_academy_invitations (invited_by);

create index if not exists gym_academy_invitations_accepted_by_idx
  on public.gym_academy_invitations (accepted_by)
  where accepted_by is not null;

drop policy if exists gym_workouts_select_own on public.gym_workouts;
drop policy if exists gym_workouts_select_professor on public.gym_workouts;
create policy gym_workouts_select_access on public.gym_workouts
for select to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Professor')
);

drop policy if exists gym_workouts_insert_own on public.gym_workouts;
drop policy if exists gym_workouts_insert_professor on public.gym_workouts;
create policy gym_workouts_insert_access on public.gym_workouts
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Professor')
);

drop policy if exists gym_workouts_update_own on public.gym_workouts;
drop policy if exists gym_workouts_update_professor on public.gym_workouts;
create policy gym_workouts_update_access on public.gym_workouts
for update to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Professor')
)
with check (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Professor')
);

drop policy if exists gym_workouts_delete_own on public.gym_workouts;
drop policy if exists gym_workouts_delete_professor on public.gym_workouts;
create policy gym_workouts_delete_access on public.gym_workouts
for delete to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Professor')
);

drop policy if exists gym_workout_exercises_select_own on public.gym_workout_exercises;
drop policy if exists gym_workout_exercises_select_professor on public.gym_workout_exercises;
create policy gym_workout_exercises_select_access on public.gym_workout_exercises
for select to authenticated
using (
  exists (
    select 1 from public.gym_workouts workout
    where workout.id = workout_id and workout.user_id = (select auth.uid())
  )
  or private.can_manage_gym_workout(workout_id)
);

drop policy if exists gym_workout_exercises_insert_own on public.gym_workout_exercises;
drop policy if exists gym_workout_exercises_insert_professor on public.gym_workout_exercises;
create policy gym_workout_exercises_insert_access on public.gym_workout_exercises
for insert to authenticated
with check (
  exists (
    select 1 from public.gym_workouts workout
    where workout.id = workout_id and workout.user_id = (select auth.uid())
  )
  or private.can_manage_gym_workout(workout_id)
);

drop policy if exists gym_workout_exercises_update_own on public.gym_workout_exercises;
drop policy if exists gym_workout_exercises_update_professor on public.gym_workout_exercises;
create policy gym_workout_exercises_update_access on public.gym_workout_exercises
for update to authenticated
using (
  exists (
    select 1 from public.gym_workouts workout
    where workout.id = workout_id and workout.user_id = (select auth.uid())
  )
  or private.can_manage_gym_workout(workout_id)
)
with check (
  exists (
    select 1 from public.gym_workouts workout
    where workout.id = workout_id and workout.user_id = (select auth.uid())
  )
  or private.can_manage_gym_workout(workout_id)
);

drop policy if exists gym_workout_exercises_delete_own on public.gym_workout_exercises;
drop policy if exists gym_workout_exercises_delete_professor on public.gym_workout_exercises;
create policy gym_workout_exercises_delete_access on public.gym_workout_exercises
for delete to authenticated
using (
  exists (
    select 1 from public.gym_workouts workout
    where workout.id = workout_id and workout.user_id = (select auth.uid())
  )
  or private.can_manage_gym_workout(workout_id)
);

drop policy if exists gym_meals_select_own on public.gym_meals;
drop policy if exists gym_meals_select_nutritionist on public.gym_meals;
create policy gym_meals_select_access on public.gym_meals
for select to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Nutricionista')
);

drop policy if exists gym_meals_insert_own on public.gym_meals;
drop policy if exists gym_meals_insert_nutritionist on public.gym_meals;
create policy gym_meals_insert_access on public.gym_meals
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Nutricionista')
);

drop policy if exists gym_meals_update_own on public.gym_meals;
drop policy if exists gym_meals_update_nutritionist on public.gym_meals;
create policy gym_meals_update_access on public.gym_meals
for update to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Nutricionista')
)
with check (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Nutricionista')
);

drop policy if exists gym_meals_delete_own on public.gym_meals;
drop policy if exists gym_meals_delete_nutritionist on public.gym_meals;
create policy gym_meals_delete_access on public.gym_meals
for delete to authenticated
using (
  (select auth.uid()) = user_id
  or private.can_manage_gym_member(user_id, 'Nutricionista')
);
