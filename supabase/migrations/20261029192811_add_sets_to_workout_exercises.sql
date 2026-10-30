alter table public.gym_workout_exercises
add column if not exists sets smallint not null default 3;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gym_workout_exercises_sets_check'
      and conrelid = 'public.gym_workout_exercises'::regclass
  ) then
    alter table public.gym_workout_exercises
    add constraint gym_workout_exercises_sets_check check (sets between 1 and 99);
  end if;
end
$$;
