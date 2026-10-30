import { supabase } from './supabase'

const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`

function requireSupabase() {
  if (!supabase) throw new Error('Supabase não está configurado no ambiente.')
  return supabase
}

function throwIfError(error) {
  if (error) throw error
}

export async function getOrCreateProfile(user) {
  const client = requireSupabase()
  const { data: profile, error } = await client.from('gym_profiles').select('*').eq('user_id', user.id).maybeSingle()
  throwIfError(error)
  if (profile) return profile

  const { data: createdProfile, error: createError } = await client.from('gym_profiles').insert({
    user_id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
  }).select().single()
  throwIfError(createError)
  return createdProfile
}

export async function updateProfile(userId, updates) {
  const client = requireSupabase()
  const { data: profile, error } = await client
    .from('gym_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select('*')
    .single()
  throwIfError(error)
  return profile
}

export async function createAcademy(userId, name) {
  const client = requireSupabase()
  const { data: academy, error } = await client
    .from('gym_academies')
    .insert({ owner_id: userId, name: name.trim() })
    .select('*')
    .single()
  throwIfError(error)
  return academy
}

export async function fetchAcademyContext(academyId, includeInvitations = false) {
  const client = requireSupabase()
  if (!academyId) return { academy: null, members: [], invitations: [] }

  const [academyResponse, memberResponse, invitationResponse] = await Promise.all([
    client.from('gym_academies').select('*').eq('id', academyId).maybeSingle(),
    client.from('gym_profiles').select('*').eq('academy_id', academyId).order('full_name'),
    includeInvitations
      ? client.from('gym_academy_invitations').select('*').eq('academy_id', academyId).order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ])
  throwIfError(academyResponse.error)
  throwIfError(memberResponse.error)
  throwIfError(invitationResponse.error)

  return {
    academy: academyResponse.data,
    members: (memberResponse.data || []).map((profile) => ({
      id: profile.user_id,
      name: profile.full_name,
      email: profile.email,
      role: profile.role,
      professionalType: profile.professional_type || '',
      status: profile.status || 'Ativo',
      joined: profile.joined_at || profile.created_at,
      initials: profile.full_name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U',
      tone: profile.tone || 'purple',
    })),
    invitations: invitationResponse.data || [],
  }
}

export async function inviteAcademyMember({ academyId, invitedBy, email, fullName, role, professionalType = null }) {
  const client = requireSupabase()
  const { data: invitation, error } = await client
    .from('gym_academy_invitations')
    .insert({
      academy_id: academyId,
      invited_by: invitedBy,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role,
      professional_type: role === 'Profissional' ? professionalType : null,
    })
    .select('*')
    .single()
  throwIfError(error)
  return invitation
}

export async function cancelAcademyInvitation(invitationId) {
  const client = requireSupabase()
  const { error } = await client.from('gym_academy_invitations').delete().eq('id', invitationId)
  throwIfError(error)
}

export async function fetchCatalogs() {
  const client = requireSupabase()
  const [exerciseResponse, foodResponse] = await Promise.all([
    client.from('gym_exercises').select('*').order('name'),
    client.from('gym_foods').select('*').order('name'),
  ])
  throwIfError(exerciseResponse.error)
  throwIfError(foodResponse.error)

  return {
    exercises: (exerciseResponse.data || []).map((exercise) => ({
      ...exercise,
      muscleGroup: exercise.muscle_group,
      aliases: exercise.aliases || [],
    })),
    foods: (foodResponse.data || []).map((food) => ({
      ...food,
      defaultPortion: food.default_portion,
      tags: food.tags || '',
    })),
  }
}

export async function fetchUserData(userId, workoutDays, mealDays) {
  const client = requireSupabase()
  const [workoutResponse, mealResponse] = await Promise.all([
    client.from('gym_workouts').select('*').eq('user_id', userId).order('day_key').order('sort_order'),
    client.from('gym_meals').select('*').eq('user_id', userId).order('day_key').order('sort_order'),
  ])
  throwIfError(workoutResponse.error)
  throwIfError(mealResponse.error)

  const workoutRows = workoutResponse.data || []
  const workoutIds = workoutRows.map((workout) => workout.id)
  const exerciseResponse = workoutIds.length
    ? await client.from('gym_workout_exercises').select('*').in('workout_id', workoutIds).order('sort_order')
    : { data: [], error: null }
  throwIfError(exerciseResponse.error)

  const exercisesByWorkout = (exerciseResponse.data || []).reduce((groups, exercise) => ({
    ...groups,
    [exercise.workout_id]: [...(groups[exercise.workout_id] || []), {
      id: exercise.exercise_id || undefined,
      name: exercise.name,
      muscleGroup: exercise.muscle_group || 'outros',
      equipment: exercise.equipment || undefined,
      level: exercise.level || undefined,
      sets: Number(exercise.sets || 3),
    }],
  }), {})

  const workouts = Object.fromEntries(workoutDays.map((day) => [day, []]))
  const dayLabels = Object.fromEntries(workoutDays.map((day) => [day, day]))
  workoutRows.forEach((workout) => {
    if (!workouts[workout.day_key]) return
    workouts[workout.day_key].push({
      id: workout.id,
      title: workout.title,
      exercises: exercisesByWorkout[workout.id] || [],
      duration: workout.duration || '',
      color: workout.color || 'violet',
      sortOrder: workout.sort_order || 0,
    })
    dayLabels[workout.day_key] = workout.day_label || workout.day_key
  })

  const meals = Object.fromEntries(mealDays.map((day) => [day, []]))
  ;(mealResponse.data || []).forEach((meal) => {
    if (!meals[meal.day_key]) return
    meals[meal.day_key].push({
      id: meal.id,
      name: meal.name,
      time: meal.time || '',
      calories: Number(meal.calories || 0),
      protein: Number(meal.protein || 0),
      fat: Number(meal.fat || 0),
      carbs: Number(meal.carbs || 0),
      fiber: Number(meal.fiber || 0),
      sugar: Number(meal.sugar || 0),
      sodium: Number(meal.sodium || 0),
      foods: meal.foods || [],
      sortOrder: meal.sort_order || 0,
    })
  })

  return { workouts, dayLabels, meals }
}

export async function saveWorkout(userId, dayKey, dayLabel, workout, sortOrder = 0) {
  const client = requireSupabase()
  const workoutId = workout.id || makeId()
  const { data: savedWorkout, error } = await client.from('gym_workouts').upsert({
    id: workoutId,
    user_id: userId,
    day_key: dayKey,
    day_label: dayLabel || dayKey,
    title: workout.title || `Treino de ${dayLabel || dayKey}`,
    duration: workout.duration || null,
    color: workout.color || 'violet',
    sort_order: sortOrder,
  }, { onConflict: 'id' }).select().single()
  throwIfError(error)

  const { error: deleteError } = await client.from('gym_workout_exercises').delete().eq('workout_id', savedWorkout.id)
  throwIfError(deleteError)

  const exerciseRows = (workout.exercises || []).map((exercise, index) => ({
    workout_id: savedWorkout.id,
    exercise_id: exercise.id || null,
    name: typeof exercise === 'string' ? exercise : exercise.name,
    muscle_group: typeof exercise === 'string' ? 'outros' : exercise.muscleGroup || 'outros',
    equipment: typeof exercise === 'string' ? null : exercise.equipment || null,
    level: typeof exercise === 'string' ? null : exercise.level || null,
    sets: typeof exercise === 'string' ? 3 : Math.min(99, Math.max(1, Number(exercise.sets) || 3)),
    sort_order: index,
  }))
  if (exerciseRows.length) {
    const { error: exerciseError } = await client.from('gym_workout_exercises').insert(exerciseRows)
    throwIfError(exerciseError)
  }

  return { ...workout, id: savedWorkout.id }
}

export async function saveMeal(userId, dayKey, meal, sortOrder = 0) {
  const client = requireSupabase()
  const mealId = meal.id || makeId()
  const { data: savedMeal, error } = await client.from('gym_meals').upsert({
    id: mealId,
    user_id: userId,
    day_key: dayKey,
    name: meal.name,
    time: meal.time || null,
    calories: Number(meal.calories || 0),
    protein: Number(meal.protein || 0),
    fat: Number(meal.fat || 0),
    carbs: Number(meal.carbs || 0),
    fiber: Number(meal.fiber || 0),
    sugar: Number(meal.sugar || 0),
    sodium: Number(meal.sodium || 0),
    foods: meal.foods || [],
    sort_order: sortOrder,
  }, { onConflict: 'id' }).select().single()
  throwIfError(error)
  return { ...meal, id: savedMeal.id }
}

export async function deleteMeals(userId, mealIds) {
  if (!mealIds.length) return
  const client = requireSupabase()
  const { error } = await client.from('gym_meals').delete().eq('user_id', userId).in('id', mealIds)
  throwIfError(error)
}
