import { useEffect, useMemo, useState } from 'react'
import { exerciseCatalog, exerciseCatalogSize } from './data/exercises'
import { foodCategories, foodDatabase } from './foodDatabase'
import { supabase, supabaseConfig } from './lib/supabase'
import { cancelAcademyInvitation, createAcademy, deleteMeals, fetchAcademyContext, fetchCatalogs, fetchUserData, getOrCreateProfile, inviteAcademyMember, saveMeal, saveWorkout, updateProfile } from './lib/gymmaxxingApi'
import MusclePlateMap from './components/MusclePlateMap'

const icons = {
  dashboard: <Icon><path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" /></Icon>,
  calendar: <Icon><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 9h18" /></Icon>,
  users: <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>,
  workout: <Icon><path d="M6 4v16M18 4v16M3 8v8M21 8v8M3 12h18" /></Icon>,
  settings: <Icon><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.2A2 2 0 0 0 5.8 18l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 1.6 12H1.5a2 2 0 1 1 0-4h.2A2 2 0 0 0 3 4.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.2 0.5V.3a2 2 0 1 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 20.8 8h.2a2 2 0 1 1 0 4h-.2a2 2 0 0 0-1.4 3Z" /></Icon>,
  chart: <Icon><path d="M4 19V5M4 19h17M8 15v-4M12 15V7M16 15v-6M20 15v-3" /></Icon>,
  bell: <Icon><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></Icon>,
  search: <Icon><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></Icon>,
  arrow: <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>,
  plus: <Icon><path d="M12 5v14M5 12h14" /></Icon>,
  more: <Icon><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></Icon>,
  clock: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  check: <Icon><path d="m5 12 4 4L19 6" /></Icon>,
  chevron: <Icon><path d="m9 18 6-6-6-6" /></Icon>,
  logout: <Icon><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></Icon>,
  lightning: <Icon><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" /></Icon>,
  dumbbell: <Icon><path d="M6 5v14M18 5v14M3 8v8M21 8v8M3 12h18" /></Icon>,
  meals: <Icon><path d="M4 3v8a3 3 0 0 0 6 0V3M7 3v18M4 7h6M15 3v18M15 3c2.8 0 5 2.2 5 5v1h-5" /></Icon>,
  academy: <Icon><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M8 11h.01M16 11h.01" /></Icon>,
  filter: <Icon><path d="M4 6h16M7 12h10M10 18h4" /></Icon>,
  edit: <Icon><path d="m4 16-.7 4.7L8 20l11.3-11.3a2.1 2.1 0 0 0-3-3L5 17ZM14.5 7.5l3 3" /></Icon>,
}

function Icon({ children, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
}

const navItems = [
  { id: 'dashboard', label: 'Visão geral', icon: icons.dashboard },
  { id: 'calendar', label: 'Horários', icon: icons.calendar },
  { id: 'users', label: 'Usuários', icon: icons.users },
  { id: 'academy', label: 'Academia', icon: icons.academy },
  { id: 'workouts', label: 'Meus treinos', icon: icons.workout },
  { id: 'meals', label: 'Refeições', icon: icons.meals },
]

const weekdayShortNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const emptyWorkouts = {
  Segunda: [],
  Terça: [],
  Quarta: [],
  Quinta: [],
  Sexta: [],
}

const mealDayKeys = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const emptyMeals = Object.fromEntries(mealDayKeys.map((day) => [day, []]))

const formatDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

function getStartOfWeek(date = new Date()) {
  const start = new Date(date)
  const day = start.getDay()
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day))
  start.setHours(0, 0, 0, 0)
  return start
}

function getWeekDays(date = new Date()) {
  const start = getStartOfWeek(date)
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start)
    current.setDate(start.getDate() + index)
    return {
      key: formatDateKey(current),
      label: weekdayShortNames[current.getDay()],
      date: current.getDate(),
      month: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(current),
      isToday: formatDateKey(current) === formatDateKey(new Date()),
    }
  })
}

function formatWeekRange(date = new Date()) {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
  const startMonth = monthFormatter.format(start).replace('.', '').toUpperCase()
  const endMonth = monthFormatter.format(end).replace('.', '').toUpperCase()
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()} — ${end.getDate()} ${endMonth}, ${end.getFullYear()}`
    : `${start.getDate()} ${startMonth} — ${end.getDate()} ${endMonth}, ${end.getFullYear()}`
}

function formatCurrentDate(date = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date).toUpperCase()
}

function getNameFromEmail(email) {
  return email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Usuário'
}

function getInitials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
}

function getToneForRole(role) {
  return { Administrador: 'blue', Profissional: 'orange', Membro: 'purple' }[role] || 'purple'
}

function buildAppUser(authUser, profile) {
  const name = profile?.full_name || getNameFromEmail(authUser.email || '')
  const role = profile?.role || 'Membro'
  return {
    id: authUser.id,
    name,
    email: authUser.email || profile?.email || '',
    initials: getInitials(name),
    tone: profile?.tone || getToneForRole(role),
    role,
    organization: profile?.organization || '',
    academyId: profile?.academy_id || null,
    professionalType: profile?.professional_type || '',
    status: profile?.status || 'Ativo',
  }
}

function getReadableAuthError(error) {
  const message = error?.message || 'Não foi possível concluir a autenticação.'
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha inválidos.'
  if (/user already registered/i.test(message)) return 'Este e-mail já está cadastrado. Entre na sua conta.'
  if (/password should be at least/i.test(message)) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail antes de entrar.'
  return message
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [users] = useState([])
  const [workouts, setWorkouts] = useState(emptyWorkouts)
  const [meals, setMeals] = useState(emptyMeals)
  const [dayLabels, setDayLabels] = useState(Object.fromEntries(Object.keys(emptyWorkouts).map((day) => [day, day])))
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [selectedMealDay, setSelectedMealDay] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [exerciseOptions, setExerciseOptions] = useState(exerciseCatalog)
  const [foodOptions, setFoodOptions] = useState(foodDatabase)

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return undefined
    }

    let mounted = true
    const hydrateSession = async (session) => {
      if (!session?.user) {
        if (mounted) {
          setCurrentUser(null)
          setAuthLoading(false)
        }
        return
      }

      try {
        const profile = await getOrCreateProfile(session.user)
        if (mounted) {
          setCurrentUser(buildAppUser(session.user, profile))
          setAuthError('')
        }
      } catch (error) {
        if (mounted) setAuthError(getReadableAuthError(error))
      } finally {
        if (mounted) setAuthLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => hydrateSession(session)).catch((error) => {
      if (mounted) {
        setAuthError(getReadableAuthError(error))
        setAuthLoading(false)
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => hydrateSession(session), 0)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!currentUser?.id || !supabase) return undefined
    let mounted = true

    const loadRemoteData = async () => {
      setDataLoading(true)
      setDataError('')
      try {
        const [catalogs, userData] = await Promise.all([
          fetchCatalogs(),
          fetchUserData(currentUser.id, Object.keys(emptyWorkouts), mealDayKeys),
        ])
        if (!mounted) return
        if (catalogs.exercises.length) setExerciseOptions(catalogs.exercises)
        if (catalogs.foods.length) setFoodOptions(catalogs.foods)
        setWorkouts(userData.workouts)
        setDayLabels(userData.dayLabels)
        setMeals(userData.meals)
      } catch (error) {
        if (mounted) setDataError(`Não foi possível carregar seus dados: ${getReadableAuthError(error)}`)
      } finally {
        if (mounted) setDataLoading(false)
      }
    }

    loadRemoteData()
    return () => { mounted = false }
  }, [currentUser?.id])

  const handleAuth = async ({ mode, email, password, name, role, professionalType }) => {
    if (!supabase) throw new Error('Supabase não está configurado. Confira o arquivo .env.local.')
    setAuthError('')
    const result = mode === 'signup'
      ? await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            role,
            professional_type: role === 'Profissional' ? professionalType : null,
          },
        },
      })
      : await supabase.auth.signInWithPassword({ email, password })
    if (result.error) throw result.error
    if (mode === 'signup' && !result.data.session) return { message: 'Conta criada. Confira seu e-mail para confirmar o acesso.' }
    if (result.data.user) {
      const profile = await getOrCreateProfile(result.data.user)
      setCurrentUser(buildAppUser(result.data.user, profile))
    }
    return { message: '' }
  }

  const handleProfileUpdate = async ({ organization }) => {
    const normalizedOrganization = organization.trim()
    const profile = await updateProfile(currentUser.id, { organization: normalizedOrganization || null })
    setCurrentUser((current) => ({ ...current, organization: profile.organization || '' }))
    return profile
  }

  if (!currentUser) {
    if (authLoading) return <LoadingScreen copy="Conectando ao Supabase..." />
    return <LoginScreen onLogin={handleAuth} configured={supabaseConfig.isConfigured} initialError={authError} />
  }

  const pageTitles = {
    dashboard: ['Visão geral', 'Acompanhe o que está acontecendo na sua academia.'],
    calendar: ['Horários', 'Organize as escalas e encontre o melhor horário para treinar.'],
    users: ['Usuários', 'Gerencie membros, profissionais e administradores.'],
    academy: ['Academia', 'Gerencie a equipe e acompanhe os alunos matriculados.'],
    workouts: ['Meus treinos', 'Monte sua semana e mantenha o foco no seu objetivo.'],
    'workout-detail': ['Detalhe do treino', 'Acompanhe os exercícios e os grupos musculares trabalhados.'],
    meals: ['Refeições', 'Planeje sua alimentação e acompanhe seus macros.'],
    'meal-detail': ['Detalhe das refeições', 'Acompanhe os macros e organize suas refeições do dia.'],
    settings: ['Configurações', 'Ajuste seu perfil e as preferências da academia.'],
  }

  const openWorkout = (day, index) => {
    const workoutExists = workouts[day]?.[index]
    if (!workoutExists) {
      const newWorkout = { id: globalThis.crypto?.randomUUID?.(), title: `Treino de ${dayLabels[day] || day}`, exercises: [], duration: '', color: 'violet' }
      setWorkouts((current) => ({
        ...current,
        [day]: [...current[day], newWorkout],
      }))
      if (currentUser?.id && supabase) {
        saveWorkout(currentUser.id, day, dayLabels[day] || day, newWorkout, workouts[day]?.length || 0).catch((error) => setDataError(`Não foi possível salvar o treino: ${getReadableAuthError(error)}`))
      }
    }
    setSelectedWorkout({ day, index: workoutExists ? index : workouts[day]?.length || 0 })
    setActivePage('workout-detail')
  }

  const updateSelectedWorkout = (updatedWorkout) => {
    if (!selectedWorkout) return
    setWorkouts((current) => ({
      ...current,
      [selectedWorkout.day]: current[selectedWorkout.day].map((item, index) => index === selectedWorkout.index ? updatedWorkout : item),
    }))
    if (currentUser?.id && supabase) {
      saveWorkout(currentUser.id, selectedWorkout.day, dayLabels[selectedWorkout.day] || selectedWorkout.day, updatedWorkout, selectedWorkout.index).then((savedWorkout) => {
        setWorkouts((current) => ({
          ...current,
          [selectedWorkout.day]: current[selectedWorkout.day].map((item, index) => index === selectedWorkout.index ? savedWorkout : item),
        }))
      }).catch((error) => setDataError(`Não foi possível salvar o treino: ${getReadableAuthError(error)}`))
    }
  }

  const openMealDay = (day) => {
    setSelectedMealDay(day)
    setActivePage('meal-detail')
  }

  const updateSelectedMealDay = (updatedMeals) => {
    if (!selectedMealDay) return
    const previousMeals = meals[selectedMealDay] || []
    setMeals((current) => ({ ...current, [selectedMealDay]: updatedMeals }))
    if (currentUser?.id && supabase) {
      const updatedIds = new Set(updatedMeals.map((meal) => meal.id).filter(Boolean))
      const removedIds = previousMeals.map((meal) => meal.id).filter((id) => id && !updatedIds.has(id))
      Promise.all(updatedMeals.map((meal, index) => saveMeal(currentUser.id, selectedMealDay, meal, index))).then(async (savedMeals) => {
        await deleteMeals(currentUser.id, removedIds)
        setMeals((current) => ({ ...current, [selectedMealDay]: savedMeals }))
      }).catch((error) => setDataError(`Não foi possível salvar a refeição: ${getReadableAuthError(error)}`))
    }
  }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    setCurrentUser(null)
    setActivePage('dashboard')
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={currentUser} userCount={users.length} onLogout={handleLogout} />
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>GymMaxxing</span><span className="breadcrumb-slash">/</span><strong>{pageTitles[activePage][0]}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Notificações" onClick={() => setShowNotifications(!showNotifications)}>{icons.bell}<i /></button>
            <div className="topbar-divider" />
            <button className="profile-mini" onClick={() => setActivePage('settings')}><Avatar initials={currentUser.initials} tone={currentUser.tone} small /><span><strong>{currentUser.name}</strong><small>{currentUser.role}</small></span>{icons.chevron}</button>
          </div>
          {showNotifications && <div className="notification-popover"><strong>Notificações</strong><p className="empty-copy">Nenhuma notificação disponível.</p></div>}
        </header>

        <div className="page-wrap">
          {dataLoading && <div className="data-sync-note">Sincronizando seus dados...</div>}
          {dataError && <div className="data-error" role="status">{dataError}</div>}
          {!['workouts', 'workout-detail', 'meals', 'meal-detail'].includes(activePage) && <div className="page-heading"><div><span className="eyebrow">{activePage === 'dashboard' ? formatCurrentDate() : 'GESTÃO DA ACADEMIA'}</span><h1>{pageTitles[activePage][0]}</h1><p>{pageTitles[activePage][1]}</p></div></div>}
          {activePage === 'dashboard' && <Dashboard user={currentUser} users={users} onNavigate={setActivePage} />}
          {activePage === 'calendar' && <CalendarView />}
          {activePage === 'users' && <UsersView users={users} />}
          {activePage === 'academy' && <AcademyView user={currentUser} exerciseCatalog={exerciseOptions} foodCatalog={foodOptions} onAcademyCreated={(academy) => setCurrentUser((current) => ({ ...current, academyId: academy.id, organization: academy.name }))} onError={(error) => setDataError(getReadableAuthError(error))} />}
          {activePage === 'workouts' && <><WorkoutsView workouts={workouts} setWorkouts={setWorkouts} dayLabels={dayLabels} setDayLabels={setDayLabels} onOpenWorkout={openWorkout} /><WorkoutStimulusPanel workouts={workouts} /></>}
          {activePage === 'workout-detail' && selectedWorkout && <WorkoutDetail workout={workouts[selectedWorkout.day]?.[selectedWorkout.index]} dayLabel={dayLabels[selectedWorkout.day]} exerciseCatalog={exerciseOptions} exerciseCatalogSize={exerciseOptions.length} onBack={() => { setSelectedWorkout(null); setActivePage('workouts') }} onUpdate={updateSelectedWorkout} />}
          {activePage === 'meals' && <MealsView meals={meals} onOpenDay={openMealDay} />}
          {activePage === 'meal-detail' && selectedMealDay && <MealDetail day={selectedMealDay} meals={meals[selectedMealDay]} foodCatalog={foodOptions} onBack={() => { setSelectedMealDay(null); setActivePage('meals') }} onUpdate={updateSelectedMealDay} />}
          {activePage === 'settings' && <SettingsView user={currentUser} onUpdate={handleProfileUpdate} />}
        </div>
      </main>
    </div>
  )
}

function LoadingScreen({ copy }) {
  return <div className="auth-screen loading-screen"><div className="auth-panel"><div className="auth-panel-inner"><div className="mobile-brand"><Logo /><span>GYMMAXXING</span></div><div className="auth-heading"><span className="eyebrow">GYMMAXXING</span><h1>Preparando seu espaço.</h1><p>{copy}</p></div><div className="loading-indicator" aria-label={copy}><i /><i /><i /></div></div></div></div>
}

function LoginScreen({ onLogin, configured, initialError }) {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('Membro')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [professionalType, setProfessionalType] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const isSignup = mode === 'signup'

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setFeedback('')
    if (!configured) {
      setError('Supabase não está configurado. Crie o arquivo .env.local antes de entrar.')
      return
    }
    if (isSignup && name.trim().length < 2) {
      setError('Informe seu nome completo.')
      return
    }
    if (isSignup && password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (isSignup && role === 'Profissional' && !professionalType) {
      setError('Selecione se você é nutricionista ou educador físico.')
      return
    }
    setPending(true)
    try {
      const result = await onLogin({ mode, email: email.trim(), password, name, role, professionalType })
      if (result?.message) setFeedback(result.message)
    } catch (authError) {
      setError(getReadableAuthError(authError))
    } finally {
      setPending(false)
    }
  }

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup')
    setError('')
    setFeedback('')
    setConfirmPassword('')
  }

  return <div className={`auth-screen ${isSignup ? 'signup-mode' : ''}`}><div className="auth-art"><div className="auth-glow glow-one" /><div className="auth-glow glow-two" /><div className="auth-brand"><Logo /><span>GYMMAXXING</span></div><div className="auth-quote"><span className="quote-mark">“</span><h2>Seu próximo nível<br />começa aqui.</h2><p>Organize. Treine. Evolua.</p><div className="quote-line" /></div><div className="auth-art-footer"><span>PLATAFORMA DE GESTÃO FITNESS</span><span>v0.1 / {new Date().getFullYear()}</span></div></div><div className="auth-panel"><div className="auth-panel-inner"><div className="mobile-brand"><Logo /><span>GYMMAXXING</span></div><div className="auth-heading"><span className="eyebrow">{isSignup ? 'CRIE SUA CONTA' : 'BEM-VINDO DE VOLTA'}</span><h1>{isSignup ? 'Crie seu espaço.' : 'Acesse seu espaço.'}</h1><p>{isSignup ? 'Comece sua jornada na GymMaxxing.' : 'Entre para acompanhar sua evolução.'}</p></div>{(error || initialError) && <p className="auth-feedback error" role="alert">{error || initialError}</p>}{feedback && <p className="auth-feedback success" role="status">{feedback}</p>}<form onSubmit={submit}>{isSignup && <label>Nome completo<input type="text" placeholder="Seu nome completo" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" minLength="2" required /></label>}<label>E-mail<input type="email" placeholder="seu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Senha<div className="password-field"><input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} minLength="6" required /><button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></label>{isSignup && <label>Confirmar senha<div className="password-field"><input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength="6" required /><button type="button" onClick={() => setShowConfirmPassword((current) => !current)}>{showConfirmPassword ? 'Ocultar' : 'Mostrar'}</button></div></label>}{!isSignup && <div className="forgot-row"><label className="checkbox-label"><input type="checkbox" /> <span>Lembrar de mim</span></label><button type="button" className="text-button">Esqueci minha senha</button></div>}{isSignup && <div className="role-picker"><span className="field-label">Tipo de conta</span><div className="role-options">{[{ value: 'Membro', label: 'Membro' }, { value: 'Profissional', label: 'Profissional' }, { value: 'Administrador', label: 'Administrador da academia' }].map((item) => <button type="button" className={`role-option ${role === item.value ? 'selected' : ''}`} key={item.value} onClick={() => { setRole(item.value); if (item.value !== 'Profissional') setProfessionalType('') }}><span className="role-radio">{role === item.value && <i />}</span>{item.label}</button>)}</div>{role === 'Profissional' && <div className="specialty-picker"><span className="field-label">Área profissional</span><div><button type="button" className={`specialty-option ${professionalType === 'Nutricionista' ? 'selected' : ''}`} onClick={() => setProfessionalType('Nutricionista')}>{icons.meals}<span><strong>Nutricionista</strong><small>Gerencia refeições dos alunos</small></span></button><button type="button" className={`specialty-option ${professionalType === 'Educador Físico' ? 'selected' : ''}`} onClick={() => setProfessionalType('Educador Físico')}>{icons.workout}<span><strong>Educador físico</strong><small>Gerencia treinos dos alunos</small></span></button></div></div>}<p className="role-help">{role === 'Administrador' ? 'Este perfil cria e administra a própria academia.' : role === 'Profissional' ? 'A área profissional é obrigatória para definir seus acessos.' : 'Perfil para acompanhar os próprios treinos e refeições.'}</p></div>}<button className="auth-submit" type="submit" disabled={pending || !configured}>{pending ? (isSignup ? 'Criando conta...' : 'Conectando...') : isSignup ? 'Criar minha conta' : 'Entrar na plataforma'} {!pending && icons.arrow}</button></form><p className="switch-auth">{isSignup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button type="button" onClick={switchMode}>{isSignup ? 'Entrar' : 'Criar conta'}</button></p><p className="demo-note">Os dados exibidos dependem da conta conectada.</p></div></div></div>
}

function Sidebar({ activePage, onNavigate, user, userCount, onLogout }) {
  const visibleNavItems = user.role === 'Administrador'
    ? navItems
    : user.role === 'Membro'
      ? navItems.filter((item) => ['dashboard', 'calendar', 'workouts', 'meals'].includes(item.id))
      : navItems.filter((item) => ['dashboard', 'calendar', 'academy', 'workouts'].includes(item.id))

  return <aside className="sidebar"><div className="brand"><Logo /><span>GYMMAXXING</span></div><div className="workspace-switcher"><div className="workspace-icon">G</div><div><strong>GymMaxxing</strong><span>{user.organization || 'Academia sem dados'}</span></div><span className="switcher-chevron">⌄</span></div><nav><span className="nav-label">MENU PRINCIPAL</span>{visibleNavItems.map((item) => <button key={item.id} className={`nav-item ${activePage === item.id || (item.id === 'workouts' && activePage === 'workout-detail') || (item.id === 'meals' && activePage === 'meal-detail') ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>{item.icon}<span>{item.label}</span>{item.id === 'users' && userCount > 0 && <em>{userCount}</em>}</button>)}<span className="nav-label nav-label-spaced">SUA CONTA</span><button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}>{icons.settings}<span>Configurações</span></button></nav><div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon">{icons.lightning}</div><strong>Eleve seu treino</strong><p>Desbloqueie mais possibilidades com o plano Pro.</p><button>Conhecer o Pro <span>↗</span></button></div><div className="sidebar-profile"><Avatar initials={user.initials} tone={user.tone} /><div><strong>{user.name}</strong><span>{user.professionalType || user.role}</span></div><button className="logout-button" onClick={onLogout} aria-label="Sair">{icons.logout}</button></div></div></aside>
}

function EmptyState({ title, copy, compact = false }) {
  return <div className={`empty-state ${compact ? 'compact' : ''}`}><strong>{title}</strong><span>{copy}</span></div>
}

const muscleGroups = [
  { id: 'peito', label: 'Peito', color: '#a778ff' },
  { id: 'costas', label: 'Costas', color: '#70adff' },
  { id: 'ombros', label: 'Ombros', color: '#f5aa73' },
  { id: 'braços', label: 'Braços', color: '#ef82ad' },
  { id: 'abdômen', label: 'Abdômen', color: '#70d6a5' },
  { id: 'pernas', label: 'Pernas', color: '#e4c46c' },
  { id: 'glúteos', label: 'Glúteos', color: '#e997c0' },
  { id: 'outros', label: 'Outro', color: '#8e849d' },
]

function normalizeExercise(exercise) {
  return typeof exercise === 'string'
    ? { name: exercise, muscleGroup: 'outros', sets: 3 }
    : { ...exercise, sets: Math.min(99, Math.max(1, Number(exercise.sets) || 3)) }
}

function getExerciseName(exercise) {
  return normalizeExercise(exercise).name
}

function getExerciseGroup(exercise) {
  return normalizeExercise(exercise).muscleGroup || 'outros'
}

function normalizeSearchText(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function getMuscleColor(groupId) {
  return muscleGroups.find((group) => group.id === groupId)?.color || '#8e849d'
}

function Dashboard({ user, users, onNavigate }) {
  const activeMembers = users.filter((item) => item.role === 'Membro' && item.status === 'Ativo').length
  const professionals = users.filter((item) => item.role === 'Profissional' && item.status === 'Ativo').length
  const today = new Date()
  const canInviteUsers = user.role !== 'Membro'

  return <div className="dashboard-grid"><section className="welcome-card"><div><span className="eyebrow">SEU RESUMO DE HOJE</span><h2>Bom dia, {user.name.split(' ')[0]} <span className="wave">✦</span></h2><p>Seus dados reais aparecerão aqui assim que forem cadastrados.</p></div><div className="welcome-stat"><strong>0%</strong><span>consistência este mês</span></div></section><section className="stat-card"><div className="stat-top"><span className="stat-icon purple-bg">{icons.chart}</span></div><span className="stat-label">MEMBROS ATIVOS</span><strong className="stat-number">{activeMembers}</strong><span className="stat-foot">nenhum dado cadastrado</span></section><section className="stat-card"><div className="stat-top"><span className="stat-icon orange-bg">{icons.clock}</span></div><span className="stat-label">TREINOS REALIZADOS</span><strong className="stat-number">0</strong><span className="stat-foot">nenhum dado cadastrado</span></section><section className="stat-card"><div className="stat-top"><span className="stat-icon green-bg">{icons.users}</span></div><span className="stat-label">PROFISSIONAIS</span><strong className="stat-number">{professionals}</strong><span className="stat-foot">nenhum dado cadastrado</span></section><section className="panel activity-panel"><div className="panel-heading"><div><h3>Atividade da academia</h3><p>Visão geral dos últimos 7 dias</p></div><button className="select-button">Esta semana <span>⌄</span></button></div><div className="chart-empty"><EmptyState title="Sem atividade registrada" copy="Os dados de atividade aparecerão quando houver treinos cadastrados." /></div></section><section className="panel schedule-panel"><div className="panel-heading"><div><h3>Próximos horários</h3><p>{formatCurrentDate(today).toLowerCase()}</p></div><button className="link-button" onClick={() => onNavigate('calendar')}>Ver agenda {icons.arrow}</button></div><EmptyState title="Nenhum horário cadastrado" copy="A agenda está vazia para este período." /><button className="schedule-add" onClick={() => onNavigate('calendar')}>{icons.plus} Adicionar horário</button></section><section className="panel quick-panel"><div className="panel-heading"><div><h3>Ações rápidas</h3><p>Atalhos para o seu dia</p></div></div><div className="quick-actions"><button onClick={() => onNavigate('workouts')}><span className="quick-icon purple-bg">{icons.dumbbell}</span><span><strong>Montar treino</strong><small>Organize sua semana</small></span>{icons.chevron}</button>{canInviteUsers && <button onClick={() => onNavigate('users')}><span className="quick-icon orange-bg">{icons.users}</span><span><strong>Convidar usuário</strong><small>Adicione à sua equipe</small></span>{icons.chevron}</button>}<button onClick={() => onNavigate('calendar')}><span className="quick-icon blue-bg">{icons.calendar}</span><span><strong>Ver horários</strong><small>Confira a agenda</small></span>{icons.chevron}</button></div></section></div>
}

function CalendarView() {
  const days = getWeekDays()
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(getStartOfWeek()).replace(/^./, (letter) => letter.toUpperCase())
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

  return <div className="calendar-layout"><div className="calendar-toolbar"><div className="calendar-month"><button className="round-arrow" aria-label="Semana anterior">‹</button><strong>{monthLabel}</strong><button className="round-arrow" aria-label="Próxima semana">›</button></div><div className="calendar-actions"><button className="outline-button">Hoje</button></div></div><section className="panel calendar-panel"><div className="calendar-grid"><div className="time-column"><span>GMT-3</span>{hours.map((hour) => <span key={hour}>{hour}</span>)}</div>{days.map((day) => <div className={`calendar-day ${day.isToday ? 'today' : ''}`} key={day.key}><div className="day-heading">{day.label} <strong>{day.date}</strong></div><div className="day-slots">{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}</div></div>)}</div><EmptyState title="Nenhum horário cadastrado" copy="Os horários da sua agenda aparecerão aqui quando forem adicionados." /></section></div>
}

function UsersView({ users }) {
  const [query, setQuery] = useState('')
  const filtered = users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase()))
  const total = users.length
  const memberCount = users.filter((user) => user.role === 'Membro').length
  const professionalCount = users.filter((user) => user.role === 'Profissional').length
  const administratorCount = users.filter((user) => user.role === 'Administrador').length
  const roleSummary = [
    { label: 'Membros', count: memberCount, tone: 'purple' },
    { label: 'Profissionais', count: professionalCount, tone: 'orange' },
    { label: 'Administradores', count: administratorCount, tone: 'blue' },
  ]

  return <div className="users-layout"><section className="panel users-panel"><div className="users-toolbar"><div className="search-field">{icons.search}<input placeholder="Pesquisar usuários..." value={query} onChange={(e) => setQuery(e.target.value)} /></div><button className="outline-button filter-button">{icons.filter} Filtros</button><button className="outline-button">Todos os cargos⌄</button></div><div className="table-meta"><span>{total} usuários cadastrados</span><span>{total ? 'Dados carregados da conta' : 'Aguardando dados da conta'}</span></div><div className="table-wrap"><table><thead><tr><th>USUÁRIO</th><th>CARGO</th><th>STATUS</th><th>ENTROU EM</th><th /></tr></thead><tbody>{filtered.length ? filtered.map((user) => <tr key={user.email}><td><div className="user-cell"><Avatar initials={user.initials} tone={user.tone} /><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td><td><span className={`status-badge ${user.status.toLowerCase()}`}><i />{user.status}</span></td><td className="date-cell">{user.joined}</td><td><button className="table-more">{icons.more}</button></td></tr>) : <tr><td colSpan="5"><EmptyState compact title={query ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'} copy={query ? 'Tente buscar por outro termo.' : 'Os usuários da conta aparecerão aqui quando forem carregados.'} /></td></tr>}</tbody></table></div><div className="table-footer"><span>Mostrando {filtered.length} de {total} usuários</span>{total > 0 && <div><button className="pagination active">1</button></div>}</div></section><aside className="panel user-summary"><div className="summary-head"><span className="summary-icon">{icons.users}</span><span className="summary-trend">Sem dados</span></div><span className="stat-label">TOTAL DE USUÁRIOS</span><strong className="summary-number">{total}</strong><div className="role-bars">{roleSummary.map((item) => <div key={item.label}><span><i className={`bar-${item.tone}`} />{item.label} <b>{item.count}</b></span><div className="bar-track"><i className={`bar-${item.tone}`} style={{ width: total ? `${(item.count / total) * 100}%` : '0%' }} /></div></div>)}</div></aside></div>
}

function AcademyView({ user, exerciseCatalog: academyExerciseCatalog, foodCatalog, onAcademyCreated, onError }) {
  const [academyData, setAcademyData] = useState({ academy: null, members: [], invitations: [] })
  const [loading, setLoading] = useState(Boolean(user.academyId))
  const [query, setQuery] = useState('')
  const [inviteRole, setInviteRole] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const loadAcademy = async (academyId = user.academyId) => {
    if (!academyId) return
    setLoading(true)
    try {
      setAcademyData(await fetchAcademyContext(academyId, user.role === 'Administrador'))
    } catch (error) {
      onError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAcademy() }, [user.academyId, user.role])

  if (user.role === 'Membro') return <section className="panel academy-empty"><span className="academy-empty-icon">{icons.academy}</span><h2>Acesso restrito</h2><p>A área da academia está disponível apenas para administradores e profissionais.</p></section>
  if (!user.academyId && user.role === 'Administrador') return <CreateAcademyPanel user={user} onCreated={(academy) => { onAcademyCreated(academy); setAcademyData({ academy, members: [], invitations: [] }) }} onError={onError} />
  if (!user.academyId) return <section className="panel academy-empty"><span className="academy-empty-icon">{icons.academy}</span><h2>Você ainda não está em uma academia</h2><p>Peça a um administrador para enviar um convite ao seu e-mail.</p></section>
  if (selectedStudent) return <StudentPlanWorkspace student={selectedStudent} professional={user} exerciseCatalog={academyExerciseCatalog} foodCatalog={foodCatalog} onBack={() => setSelectedStudent(null)} onError={onError} />
  if (loading) return <section className="panel academy-empty"><div className="loading-indicator"><i /><i /><i /></div><p>Carregando pessoas da academia...</p></section>

  const students = academyData.members.filter((member) => member.role === 'Membro')
  const staff = academyData.members.filter((member) => member.role !== 'Membro')
  const pendingInvitations = academyData.invitations.filter((invitation) => invitation.status === 'Pendente')
  const normalizedQuery = query.trim().toLowerCase()
  const filterPeople = (people) => people.filter((person) => `${person.name} ${person.email} ${person.role} ${person.professionalType}`.toLowerCase().includes(normalizedQuery))
  const visibleStudents = filterPeople(students)
  const visibleStaff = filterPeople(staff)
  const actionLabel = user.professionalType === 'Nutricionista' ? 'Abrir refeições' : 'Abrir treinos'

  const submitInvitation = async (form) => {
    await inviteAcademyMember({ academyId: user.academyId, invitedBy: user.id, ...form })
    setInviteRole(null)
    await loadAcademy()
  }

  const removeInvitation = async (invitationId) => {
    try {
      await cancelAcademyInvitation(invitationId)
      await loadAcademy()
    } catch (error) {
      onError(error)
    }
  }

  return <div className="academy-layout"><section className="academy-overview panel"><div><span className="eyebrow">{academyData.academy?.name || user.organization}</span><h2>Pessoas da academia</h2><p>{user.role === 'Administrador' ? 'Gerencie sua equipe e veja todos os alunos matriculados.' : `${user.professionalType || 'Profissional'} · selecione um aluno para abrir o planejamento.`}</p></div><div className="academy-counts"><span><strong>{students.length}</strong> alunos</span>{user.role === 'Administrador' && <span><strong>{staff.length}</strong> funcionários</span>}</div></section><div className="academy-toolbar"><div className="search-field">{icons.search}<input placeholder="Buscar por nome ou e-mail..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>{user.role === 'Administrador' && <><button className="outline-button" onClick={() => setInviteRole('Membro')}>{icons.plus} Matricular aluno</button><button className="primary-button" onClick={() => setInviteRole('Profissional')}>{icons.plus} Novo profissional</button></>}</div>{user.role === 'Administrador' && <AcademyPeopleSection title="Funcionários" copy="Administradores, nutricionistas e educadores físicos vinculados." people={visibleStaff} emptyCopy="Nenhum funcionário encontrado." />}{user.role === 'Administrador' && pendingInvitations.length > 0 && <section className="panel academy-section"><div className="academy-section-head"><div><h3>Convites pendentes</h3><p>O vínculo será concluído quando a pessoa criar ou acessar a conta.</p></div><span className="academy-section-count">{pendingInvitations.length}</span></div><div className="academy-invites">{pendingInvitations.map((invitation) => <div key={invitation.id}><span className="invite-avatar">{getInitials(invitation.full_name)}</span><span><strong>{invitation.full_name}</strong><small>{invitation.email} · {invitation.professional_type || 'Aluno'}</small></span><button className="text-button" onClick={() => removeInvitation(invitation.id)}>Cancelar</button></div>)}</div></section>}<AcademyPeopleSection title="Alunos matriculados" copy={user.role === 'Administrador' ? 'Todos os membros ativos desta academia.' : 'Alunos disponíveis para acompanhamento.'} people={visibleStudents} emptyCopy={normalizedQuery ? 'Nenhum aluno corresponde à busca.' : 'Nenhum aluno matriculado ainda.'} actionLabel={user.role === 'Profissional' ? actionLabel : ''} onAction={setSelectedStudent} />{inviteRole && <AcademyInvitationModal role={inviteRole} onClose={() => setInviteRole(null)} onSubmit={submitInvitation} onError={onError} />}</div>
}

function CreateAcademyPanel({ user, onCreated, onError }) {
  const [name, setName] = useState(user.organization || '')
  const [pending, setPending] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setPending(true)
    try {
      onCreated(await createAcademy(user.id, name))
    } catch (error) {
      onError(error)
    } finally {
      setPending(false)
    }
  }
  return <section className="panel academy-create"><span className="academy-empty-icon">{icons.academy}</span><span className="eyebrow">PRIMEIRO ACESSO</span><h2>Crie o espaço da sua academia</h2><p>Depois disso você poderá matricular alunos e adicionar nutricionistas e educadores físicos.</p><form onSubmit={submit}><label><span>Nome da academia</span><input autoFocus minLength="2" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: GymMaxxing Centro" /></label><button className="primary-button" disabled={pending || name.trim().length < 2}>{pending ? 'Criando...' : 'Criar academia'} {icons.arrow}</button></form></section>
}

function AcademyPeopleSection({ title, copy, people, emptyCopy, actionLabel = '', onAction }) {
  return <section className="panel academy-section"><div className="academy-section-head"><div><h3>{title}</h3><p>{copy}</p></div><span className="academy-section-count">{people.length}</span></div>{people.length ? <div className="academy-people-grid">{people.map((person) => <article className="academy-person-card" key={person.id}><Avatar initials={person.initials} tone={person.tone} /><div><strong>{person.name}</strong><small>{person.email}</small><span>{person.professionalType || person.role}</span></div><i className={`academy-status ${person.status.toLowerCase()}`} />{actionLabel && <button className="outline-button" onClick={() => onAction(person)}>{actionLabel} {icons.arrow}</button>}</article>)}</div> : <EmptyState compact title="Nada por aqui" copy={emptyCopy} />}</section>
}

function AcademyInvitationModal({ role, onClose, onSubmit, onError }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [professionalType, setProfessionalType] = useState('')
  const [pending, setPending] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    if (role === 'Profissional' && !professionalType) return
    setPending(true)
    try {
      await onSubmit({ fullName, email, role, professionalType: professionalType || null })
    } catch (error) {
      onError(error)
    } finally {
      setPending(false)
    }
  }
  return <div className="modal-backdrop" onClick={onClose}><form className="exercise-modal academy-invite-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}><div className="modal-head"><div><span className="eyebrow">{role === 'Profissional' ? 'NOVO PROFISSIONAL' : 'NOVA MATRÍCULA'}</span><h2>{role === 'Profissional' ? 'Adicionar funcionário' : 'Matricular aluno'}</h2></div><button type="button" className="modal-close" onClick={onClose}>×</button></div><p>Se a conta já existir, o acesso será liberado agora. Caso contrário, o convite ficará aguardando o cadastro.</p><label className="modal-field"><span>Nome completo</span><input autoFocus required minLength="2" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nome da pessoa" /></label><label className="modal-field"><span>E-mail</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="pessoa@email.com" /></label>{role === 'Profissional' && <label className="modal-field"><span>Especialidade obrigatória</span><select required value={professionalType} onChange={(event) => setProfessionalType(event.target.value)}><option value="">Selecione...</option><option value="Nutricionista">Nutricionista</option><option value="Educador Físico">Educador físico</option></select></label>}<button className="primary-button modal-submit" disabled={pending || !fullName.trim() || !email.trim() || (role === 'Profissional' && !professionalType)}>{pending ? 'Salvando...' : role === 'Profissional' ? 'Adicionar profissional' : 'Matricular aluno'}</button></form></div>
}

function StudentPlanWorkspace({ student, professional, exerciseCatalog: academyExerciseCatalog, foodCatalog, onBack, onError }) {
  const [workouts, setWorkouts] = useState(emptyWorkouts)
  const [dayLabels, setDayLabels] = useState(Object.fromEntries(Object.keys(emptyWorkouts).map((day) => [day, day])))
  const [meals, setMeals] = useState(emptyMeals)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [selectedMealDay, setSelectedMealDay] = useState(null)
  const [loading, setLoading] = useState(true)
  const isNutritionist = professional.professionalType === 'Nutricionista'

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchUserData(student.id, Object.keys(emptyWorkouts), mealDayKeys).then((data) => {
      if (!mounted) return
      setWorkouts(data.workouts)
      setDayLabels(data.dayLabels)
      setMeals(data.meals)
    }).catch(onError).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [student.id])

  const openWorkout = (day, index) => {
    const existing = workouts[day]?.[index]
    if (!existing) {
      const newWorkout = { id: globalThis.crypto?.randomUUID?.(), title: `Treino de ${dayLabels[day] || day}`, exercises: [], duration: '', color: 'violet' }
      setWorkouts((current) => ({ ...current, [day]: [...current[day], newWorkout] }))
      saveWorkout(student.id, day, dayLabels[day] || day, newWorkout, workouts[day]?.length || 0).catch(onError)
    }
    setSelectedWorkout({ day, index: existing ? index : workouts[day]?.length || 0 })
  }

  const updateWorkout = (updatedWorkout) => {
    if (!selectedWorkout) return
    const { day, index } = selectedWorkout
    setWorkouts((current) => ({ ...current, [day]: current[day].map((item, itemIndex) => itemIndex === index ? updatedWorkout : item) }))
    saveWorkout(student.id, day, dayLabels[day] || day, updatedWorkout, index).then((saved) => setWorkouts((current) => ({ ...current, [day]: current[day].map((item, itemIndex) => itemIndex === index ? saved : item) }))).catch(onError)
  }

  const updateMeals = (day, updatedMeals) => {
    const previousMeals = meals[day] || []
    setMeals((current) => ({ ...current, [day]: updatedMeals }))
    const updatedIds = new Set(updatedMeals.map((meal) => meal.id).filter(Boolean))
    const removedIds = previousMeals.map((meal) => meal.id).filter((id) => id && !updatedIds.has(id))
    Promise.all(updatedMeals.map((meal, index) => saveMeal(student.id, day, meal, index))).then(async (savedMeals) => {
      await deleteMeals(student.id, removedIds)
      setMeals((current) => ({ ...current, [day]: savedMeals }))
    }).catch(onError)
  }

  if (loading) return <section className="panel academy-empty"><div className="loading-indicator"><i /><i /><i /></div><p>Carregando o planejamento de {student.name}...</p></section>
  return <div className="student-workspace"><div className="student-workspace-head"><button className="back-link" onClick={onBack}>← Voltar para alunos</button><div><Avatar initials={student.initials} tone={student.tone} /><span><span className="eyebrow">{isNutritionist ? 'ACOMPANHAMENTO NUTRICIONAL' : 'ACOMPANHAMENTO DE TREINO'}</span><h2>{student.name}</h2><p>{student.email}</p></span></div></div>{isNutritionist ? selectedMealDay ? <MealDetail day={selectedMealDay} meals={meals[selectedMealDay] || []} foodCatalog={foodCatalog} onBack={() => setSelectedMealDay(null)} onUpdate={(updated) => updateMeals(selectedMealDay, updated)} /> : <MealsView meals={meals} onOpenDay={setSelectedMealDay} /> : selectedWorkout ? <WorkoutDetail workout={workouts[selectedWorkout.day]?.[selectedWorkout.index]} dayLabel={dayLabels[selectedWorkout.day]} exerciseCatalog={academyExerciseCatalog} exerciseCatalogSize={academyExerciseCatalog.length} onBack={() => setSelectedWorkout(null)} onUpdate={updateWorkout} /> : <><WorkoutsView workouts={workouts} setWorkouts={setWorkouts} dayLabels={dayLabels} setDayLabels={setDayLabels} onOpenWorkout={openWorkout} /><WorkoutStimulusPanel workouts={workouts} /></>}</div>
}

function WorkoutsView({ workouts, dayLabels, setDayLabels, onOpenWorkout }) {
  const [editingDay, setEditingDay] = useState(null)
  const [draftDay, setDraftDay] = useState('')
  const days = Object.keys(workouts)
  const plannedDays = days.filter((day) => workouts[day].length).length
  const progress = days.length ? Math.round((plannedDays / days.length) * 100) : 0

  const startEditingDay = (day) => {
    setEditingDay(day)
    setDraftDay(dayLabels[day] || day)
  }

  const finishEditingDay = (day) => {
    const value = draftDay.trim()
    if (value) setDayLabels((current) => ({ ...current, [day]: value }))
    setEditingDay(null)
  }

  const openNewWorkout = (day) => onOpenWorkout(day, workouts[day].length)

  return <div className="workouts-layout"><div className="workouts-head"><div><span className="eyebrow">PLANEJAMENTO SEMANAL</span><h1>Meus treinos <span className="title-accent">/ semana</span></h1><p>Uma semana consistente começa com um plano claro.</p></div><div className="workout-head-actions"><div className="week-switch"><button>‹</button><strong>{formatWeekRange()}</strong><button>›</button></div><button className="primary-button" onClick={() => openNewWorkout(days.find((day) => !workouts[day].length) || days[0])}>{icons.plus} Novo treino</button></div></div><div className="workout-progress panel"><div className="progress-copy"><span className="progress-icon">{icons.lightning}</span><span><strong>{plannedDays ? 'Treinos planejados' : 'Nenhum treino planejado'}</strong><small>{plannedDays ? `${plannedDays} de ${days.length} dias com treino cadastrado.` : 'Clique em qualquer card vazio para começar.'}</small></span></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><strong className="progress-percent">{progress}%</strong></div><div className="kanban-board">{days.map((day) => <div className="kanban-column" key={day}><div className="kanban-heading">{editingDay === day ? <input className="day-label-input" autoFocus value={draftDay} onChange={(event) => setDraftDay(event.target.value)} onBlur={() => finishEditingDay(day)} onKeyDown={(event) => { if (event.key === 'Enter') finishEditingDay(day); if (event.key === 'Escape') setEditingDay(null) }} /> : <button className="day-label-button" onClick={() => startEditingDay(day)} title="Editar nome do dia">{dayLabels[day] || day}</button>}<b>{workouts[day].length}</b></div><div className="kanban-cards clickable-column" role={workouts[day].length ? undefined : 'button'} tabIndex={workouts[day].length ? undefined : 0} onClick={() => !workouts[day].length && onOpenWorkout(day, 0)} onKeyDown={(event) => { if (!workouts[day].length && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onOpenWorkout(day, 0) } }}>{workouts[day].length ? workouts[day].map((workout, i) => <div className={`workout-card clickable ${workout.color}`} key={`${workout.title}-${i}`} role="button" tabIndex="0" onClick={() => onOpenWorkout(day, i)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpenWorkout(day, i) } }}><div className="card-top"><span className="workout-tag">{workout.exercises.length} exercícios</span><button onClick={(event) => event.stopPropagation()}>{icons.more}</button></div><h3>{workout.title}</h3><div className="exercise-list">{workout.exercises.slice(0, 3).map((item, itemIndex) => <span key={`${getExerciseName(item)}-${itemIndex}`}>{getExerciseName(item)}</span>)}{workout.exercises.length > 3 && <span className="more-exercises">+{workout.exercises.length - 3} exercícios</span>}</div><div className="workout-card-footer"><span>{icons.clock} {workout.duration || 'Duração não informada'}</span><button onClick={(event) => event.stopPropagation()}>{icons.edit}</button></div></div>) : <EmptyState compact title="Nenhum treino" copy="Clique nesta área para abrir o treino." />}<button className="add-workout" onClick={(event) => { event.stopPropagation(); openNewWorkout(day) }}>{icons.plus} Adicionar treino</button></div></div>)}</div></div>
}

function getMuscleStimulus(workouts) {
  const counts = Object.fromEntries(muscleGroups.map((group) => [group.id, 0]))
  Object.values(workouts).flat().forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const group = getExerciseGroup(exercise)
      if (counts[group] !== undefined) counts[group] += 1
    })
  })
  return muscleGroups.map((group) => ({ ...group, count: counts[group.id] })).sort((a, b) => b.count - a.count)
}

function WorkoutStimulusPanel({ workouts }) {
  const stimulus = getMuscleStimulus(workouts)
  const activeStimulus = stimulus.filter((group) => group.count > 0)
  const topGroup = activeStimulus[0]
  const maxCount = topGroup?.count || 1

  return <section className="panel stimulus-panel"><div className="panel-heading"><div><span className="eyebrow">ANÁLISE DA SEMANA</span><h3>Estímulo por grupo muscular</h3><p>Veja quais grupos recebem mais estímulo nos treinos cadastrados.</p></div>{topGroup && <span className="stimulus-top-badge">Mais estimulado · {topGroup.label}</span>}</div>{topGroup ? <div className="stimulus-chart"><div className="stimulus-highlight"><span className="stimulus-highlight-icon" style={{ background: `${topGroup.color}22`, color: topGroup.color }}>{icons.chart}</span><span className="eyebrow">GRUPO EM DESTAQUE</span><strong>{topGroup.label}</strong><p>{topGroup.count} {topGroup.count === 1 ? 'estímulo registrado' : 'estímulos registrados'}</p></div><div className="stimulus-bars">{activeStimulus.map((group) => <div className="stimulus-bar-row" key={group.id}><div className="stimulus-bar-label"><span><i style={{ background: group.color }} />{group.label}</span><b>{group.count}</b></div><div className="stimulus-bar-track"><i style={{ width: `${(group.count / maxCount) * 100}%`, background: group.color }} /></div></div>)}</div></div> : <EmptyState compact title="Nenhum estímulo registrado" copy="Cadastre exercícios nos treinos para visualizar a distribuição por grupo muscular." />}</section>
}

function LegacyWorkoutsView({ workouts, setWorkouts, dayLabels, setDayLabels, onOpenWorkout }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [exercise, setExercise] = useState('')
  const [exerciseGroup, setExerciseGroup] = useState('outros')
  const [editingDay, setEditingDay] = useState(null)
  const [draftDay, setDraftDay] = useState('')
  const days = Object.keys(workouts)
  const plannedDays = days.filter((day) => workouts[day].length).length
  const progress = days.length ? Math.round((plannedDays / days.length) * 100) : 0

  const startEditingDay = (day) => {
    setEditingDay(day)
    setDraftDay(dayLabels[day] || day)
  }

  const finishEditingDay = (day) => {
    const value = draftDay.trim()
    if (value) setDayLabels((current) => ({ ...current, [day]: value }))
    setEditingDay(null)
  }

  const addExercise = () => {
    const value = exercise.trim()
    if (!selectedDay || !value) return
    const nextExercise = { name: value, muscleGroup: exerciseGroup }
    setWorkouts((current) => ({ ...current, [selectedDay]: current[selectedDay].length ? [{ ...current[selectedDay][0], exercises: [...current[selectedDay][0].exercises, nextExercise] }] : [{ title: `Treino de ${dayLabels[selectedDay] || selectedDay}`, exercises: [nextExercise], duration: '', color: 'violet' }] }))
    setExercise('')
    setExerciseGroup('outros')
    setSelectedDay(null)
  }
  return <div className="workouts-layout"><div className="workouts-head"><div><span className="eyebrow">PLANEJAMENTO SEMANAL</span><h1>Meus treinos <span className="title-accent">/ semana</span></h1><p>Uma semana consistente começa com um plano claro.</p></div><div className="workout-head-actions"><div className="week-switch"><button>‹</button><strong>{formatWeekRange()}</strong><button>›</button></div><button className="primary-button" onClick={() => setSelectedDay(days.find((day) => !workouts[day].length) || days[0])}>{icons.plus} Novo treino</button></div></div><div className="workout-progress panel"><div className="progress-copy"><span className="progress-icon">{icons.lightning}</span><span><strong>{plannedDays ? 'Treinos planejados' : 'Nenhum treino planejado'}</strong><small>{plannedDays ? `${plannedDays} de ${days.length} dias com treino cadastrado.` : 'Cadastre um treino para acompanhar sua semana.'}</small></span></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><strong className="progress-percent">{progress}%</strong></div><div className="kanban-board">{days.map((day) => <div className="kanban-column" key={day}><div className="kanban-heading">{editingDay === day ? <input className="day-label-input" autoFocus value={draftDay} onChange={(event) => setDraftDay(event.target.value)} onBlur={() => finishEditingDay(day)} onKeyDown={(event) => { if (event.key === 'Enter') finishEditingDay(day); if (event.key === 'Escape') setEditingDay(null) }} /> : <button className="day-label-button" onClick={() => startEditingDay(day)} title="Editar nome do dia">{dayLabels[day] || day}</button>}<b>{workouts[day].length}</b></div><div className="kanban-cards">{workouts[day].length ? workouts[day].map((workout, i) => <div className={`workout-card clickable ${workout.color}`} key={`${workout.title}-${i}`} role="button" tabIndex="0" onClick={() => onOpenWorkout(day, i)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpenWorkout(day, i) }}><div className="card-top"><span className="workout-tag">{workout.exercises.length} exercícios</span><button onClick={(event) => event.stopPropagation()}>{icons.more}</button></div><h3>{workout.title}</h3><div className="exercise-list">{workout.exercises.slice(0, 3).map((item, itemIndex) => <span key={`${getExerciseName(item)}-${itemIndex}`}>{getExerciseName(item)}</span>)}{workout.exercises.length > 3 && <span className="more-exercises">+{workout.exercises.length - 3} exercícios</span>}</div><div className="workout-card-footer"><span>{icons.clock} {workout.duration || 'Duração não informada'}</span><button onClick={(event) => event.stopPropagation()}>{icons.edit}</button></div></div>) : <EmptyState compact title="Nenhum treino" copy="Adicione um treino para este dia." />}<button className="add-workout" onClick={() => setSelectedDay(day)}>{icons.plus} Adicionar treino</button></div></div>)}</div>{selectedDay && <div className="modal-backdrop" onClick={() => setSelectedDay(null)}><div className="exercise-modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">{(dayLabels[selectedDay] || selectedDay).toUpperCase()}</span><h2>Adicionar exercício</h2></div><button className="modal-close" onClick={() => setSelectedDay(null)}>×</button></div><p>Informe um exercício e o grupo muscular trabalhado.</p><div className="search-field modal-search">{icons.search}<input autoFocus placeholder="Nome do exercício" value={exercise} onChange={(e) => setExercise(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addExercise()} /></div><label className="modal-field"><span>Grupo muscular</span><select value={exerciseGroup} onChange={(e) => setExerciseGroup(e.target.value)}>{muscleGroups.map((group) => <option value={group.id} key={group.id}>{group.label}</option>)}</select></label><button className="primary-button modal-submit" onClick={addExercise} disabled={!exercise.trim()}>{icons.plus} Adicionar exercício</button></div></div>}</div>
}

function getMealSummary(dayMeals = []) {
  return dayMeals.reduce((summary, meal) => ({
    calories: summary.calories + Number(meal.calories || 0),
    protein: summary.protein + Number(meal.protein || 0),
    fat: summary.fat + Number(meal.fat || 0),
    carbs: summary.carbs + Number(meal.carbs || 0),
    fiber: summary.fiber + Number(meal.fiber || 0),
    sugar: summary.sugar + Number(meal.sugar || 0),
    sodium: summary.sodium + Number(meal.sodium || 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0 })
}

const mealDraftDefaults = { name: '', time: '', calories: '', protein: '', fat: '', carbs: '', fiber: '', sugar: '', sodium: '' }

const nutritionFields = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sugar', 'sodium']

function roundNutrition(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10) / 10
}

function formatNutrition(value) {
  return roundNutrition(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

function getFoodNutrition(food, grams) {
  const factor = Number(grams || 0) / 100
  return nutritionFields.reduce((nutrition, field) => ({
    ...nutrition,
    [field]: roundNutrition(Number(food[field] || 0) * factor),
  }), {})
}

function MealsView({ meals, onOpenDay }) {
  const days = mealDayKeys
  const weekDays = getWeekDays()
  const plannedDays = days.filter((day) => meals[day]?.length).length
  const progress = days.length ? Math.round((plannedDays / days.length) * 100) : 0

  return <div className="meals-layout"><div className="meals-head"><div><span className="eyebrow">PLANEJAMENTO SEMANAL</span><h1>Refeições <span className="title-accent">/ semana</span></h1><p>Organize suas refeições e mantenha seus macros sob controle.</p></div><div className="meal-head-actions"><div className="week-switch"><button aria-label="Semana anterior">‹</button><strong>{formatWeekRange()}</strong><button aria-label="Próxima semana">›</button></div><button className="primary-button" onClick={() => onOpenDay(days.find((day) => !meals[day]?.length) || days[0])}>{icons.plus} Nova refeição</button></div></div><div className="meal-progress panel"><div className="progress-copy"><span className="progress-icon meal-progress-icon">{icons.meals}</span><span><strong>{plannedDays ? 'Dias planejados' : 'Nenhuma refeição planejada'}</strong><small>{plannedDays ? `${plannedDays} de ${days.length} dias com refeições cadastradas.` : 'Cadastre uma refeição para acompanhar sua semana.'}</small></span></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><strong className="progress-percent">{progress}%</strong></div><div className="meal-week-grid">{days.map((day, index) => { const dayMeals = meals[day] || []; const summary = getMealSummary(dayMeals); const calendarDay = weekDays[index]; return <div className="meal-day-card clickable" key={day} role="button" tabIndex="0" onClick={() => onOpenDay(day)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpenDay(day) }}><div className="meal-day-card-top"><div><span className="meal-day-short">{calendarDay.label}</span><strong>{calendarDay.date}</strong></div><span className="meal-day-count">{dayMeals.length} {dayMeals.length === 1 ? 'refeição' : 'refeições'}</span></div><h3>{day}</h3>{dayMeals.length ? <><div className="meal-summary-row"><span>{summary.calories.toLocaleString('pt-BR')} kcal</span><span>{summary.protein}g proteína</span></div><div className="meal-mini-list">{dayMeals.slice(0, 3).map((meal, mealIndex) => <span key={`${meal.name}-${mealIndex}`}>{meal.time || '--:--'} · {meal.name}</span>)}{dayMeals.length > 3 && <span className="more-meals">+{dayMeals.length - 3} refeições</span>}</div></> : <div className="meal-card-empty"><span>{icons.meals}</span><p>Nenhuma refeição cadastrada</p></div>}<button className="meal-card-action" onClick={(event) => { event.stopPropagation(); onOpenDay(day) }}>{dayMeals.length ? 'Ver refeições' : 'Criar refeição'} {icons.arrow}</button></div>})}</div></div>
}

function MealDetail({ day, meals, onBack, onUpdate, foodCatalog }) {
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(mealDraftDefaults)
  const [editingMealIndex, setEditingMealIndex] = useState(null)
  const summary = getMealSummary(meals)
  const dayIndex = mealDayKeys.indexOf(day)
  const calendarDay = getWeekDays()[dayIndex]

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  const addMeal = (mealData) => {
    const name = mealData.name.trim() || mealData.foods?.map((food) => food.name).join(' + ')
    if (!name) return
    const nutrition = nutritionFields.reduce((values, field) => ({ ...values, [field]: Number(mealData[field]) || 0 }), {})
    const nextMeal = { ...mealData, ...nutrition, name, foods: mealData.foods || [] }
    onUpdate(editingMealIndex === null ? [...meals, nextMeal] : meals.map((meal, index) => index === editingMealIndex ? { ...meal, ...nextMeal } : meal))
    setDraft(mealDraftDefaults)
    setEditingMealIndex(null)
    setShowForm(false)
  }

  const removeMeal = (index) => onUpdate(meals.filter((_, mealIndex) => mealIndex !== index))
  const startNewMeal = () => { setDraft(mealDraftDefaults); setEditingMealIndex(null); setShowForm(true) }
  const startEditingMeal = (meal, index) => {
    setDraft({ ...meal, ...Object.fromEntries(nutritionFields.map((field) => [field, String(meal[field] || '')])) })
    setEditingMealIndex(index)
    setShowForm(true)
  }
  const metricCards = [
    { label: 'Calorias', value: summary.calories.toLocaleString('pt-BR'), unit: 'kcal', tone: 'purple' },
    { label: 'Proteína', value: summary.protein, unit: 'g', tone: 'blue' },
    { label: 'Gordura', value: summary.fat, unit: 'g', tone: 'orange' },
    { label: 'Carboidrato', value: summary.carbs, unit: 'g', tone: 'green' },
    { label: 'Fibras', value: summary.fiber, unit: 'g', tone: 'pink' },
    { label: 'Açúcares', value: summary.sugar, unit: 'g', tone: 'blue' },
    { label: 'Sódio', value: summary.sodium, unit: 'mg', tone: 'orange' },
  ]

  return <div className="meal-detail-layout"><section className="meal-macro-column"><button className="back-link" onClick={onBack}>← Voltar para semana</button><div className="detail-heading"><span className="eyebrow">{(day || 'REFEIÇÕES').toUpperCase()}</span><h1>Resumo nutricional</h1><p>Veja os macros planejados para todas as refeições deste dia.</p></div><section className="panel macro-overview-panel"><div className="macro-panel-heading"><div><span className="eyebrow">{calendarDay?.label} {calendarDay?.date}</span><h2>Macros do dia</h2></div><span className="macro-meal-count">{meals.length} {meals.length === 1 ? 'refeição' : 'refeições'}</span></div><div className="macro-total"><strong>{summary.calories.toLocaleString('pt-BR')}</strong><span>kcal planejadas</span></div><div className="macro-grid">{metricCards.map((metric) => <div className={`macro-card ${metric.tone}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}<small>{metric.unit}</small></strong><i><b style={{ width: `${Math.min(metric.label === 'Calorias' ? (summary.calories / 2400) * 100 : (Number(metric.value) / (metric.label === 'Proteína' ? 180 : 100)) * 100, 100)}%` }} /></i></div>)}</div>{!meals.length && <div className="macro-note">Seus totais aparecem aqui assim que você cadastrar uma refeição.</div>}</section></section><section className="detail-list-column"><div className="detail-heading detail-heading-right"><span className="eyebrow">{(day || 'REFEIÇÕES').toUpperCase()}</span><h1>Refeições do dia</h1><p>{meals.length} {meals.length === 1 ? 'refeição cadastrada' : 'refeições cadastradas'} · {calendarDay?.date} de {calendarDay?.month}</p></div><section className="panel meals-detail-panel"><div className="panel-heading"><div><h2>Lista de refeições</h2><p>Cadastre o que você vai comer e acompanhe os valores nutricionais.</p></div><button className="primary-button" onClick={() => showForm ? setShowForm(false) : startNewMeal()}>{icons.plus} {showForm ? 'Fechar' : 'Nova refeição'}</button></div><div className="meal-detail-list">{meals.length ? meals.map((meal, index) => <div className="meal-detail-item" key={`${meal.id || meal.name}-${index}`}><span className="meal-time">{meal.time || '--:--'}</span><span className="meal-type-icon">{icons.meals}</span><div><strong>{meal.name}</strong><small>{meal.calories || 0} kcal · {meal.protein || 0}g proteína · {meal.carbs || 0}g carboidrato</small></div><button className="edit-meal" onClick={() => startEditingMeal(meal, index)} aria-label={`Editar ${meal.name}`}>{icons.edit}</button><button className="remove-meal" onClick={() => removeMeal(index)} aria-label={`Remover ${meal.name}`}>×</button></div>) : <EmptyState compact title="Nenhuma refeição cadastrada" copy="Adicione o café da manhã, almoço ou outra refeição abaixo." />}</div>{showForm && <MealForm key={editingMealIndex === null ? 'new' : `edit-${editingMealIndex}`} draft={draft} onChange={updateDraft} onSubmit={addMeal} onCancel={() => { setShowForm(false); setEditingMealIndex(null) }} foodCatalog={foodCatalog} />}</section></section></div>
}

function MealForm({ draft, onChange, onSubmit, onCancel, foodCatalog }) {
  return <CatalogMealForm draft={draft} onChange={onChange} onSubmit={onSubmit} onCancel={onCancel} foodCatalog={foodCatalog} />
  return <form className="meal-form" onSubmit={onSubmit}><div className="meal-form-heading"><div><span className="eyebrow">NOVA REFEIÇÃO</span><h3>Adicionar ao dia</h3></div><button type="button" className="form-cancel" onClick={onCancel}>Cancelar</button></div><div className="meal-form-fields"><label className="meal-name-field"><span>Nome da refeição</span><input value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Ex.: almoço" autoFocus required /></label><label><span>Horário</span><input type="time" value={draft.time} onChange={(event) => onChange('time', event.target.value)} /></label><label><span>Calorias</span><input type="number" min="0" value={draft.calories} onChange={(event) => onChange('calories', event.target.value)} placeholder="0" /></label><label><span>Proteína (g)</span><input type="number" min="0" value={draft.protein} onChange={(event) => onChange('protein', event.target.value)} placeholder="0" /></label><label><span>Gordura (g)</span><input type="number" min="0" value={draft.fat} onChange={(event) => onChange('fat', event.target.value)} placeholder="0" /></label><label><span>Carboidrato (g)</span><input type="number" min="0" value={draft.carbs} onChange={(event) => onChange('carbs', event.target.value)} placeholder="0" /></label><label><span>Fibras (g)</span><input type="number" min="0" value={draft.fiber} onChange={(event) => onChange('fiber', event.target.value)} placeholder="0" /></label></div><button className="primary-button meal-form-submit" type="submit" disabled={!draft.name.trim()}>{icons.plus} Salvar refeição</button></form>
}

function CatalogMealForm({ draft, onChange, onSubmit, onCancel, foodCatalog }) {
  const [mode, setMode] = useState(draft.foods?.length ? 'catalog' : 'manual')
  const [foodSearch, setFoodSearch] = useState('')
  const [foodCategory, setFoodCategory] = useState('Todos')
  const [selectedFood, setSelectedFood] = useState(null)
  const [foodAmount, setFoodAmount] = useState('')
  const [selectedFoods, setSelectedFoods] = useState(draft.foods || [])
  const [showFoodResults, setShowFoodResults] = useState(false)

  const catalogFoods = foodCatalog?.length ? foodCatalog : foodDatabase
  const catalogFoodCategories = useMemo(() => ['Todos', ...new Set(catalogFoods.map((food) => food.category).filter(Boolean))], [catalogFoods])

  const filteredFoods = useMemo(() => {
    const query = normalizeSearchText(foodSearch)
    return catalogFoods.filter((food) => {
      const matchesCategory = foodCategory === 'Todos' || food.category === foodCategory
      const searchableText = normalizeSearchText([food.name, food.category, food.tags].join(' '))
      return matchesCategory && (!query || searchableText.includes(query))
    })
  }, [catalogFoods, foodCategory, foodSearch])

  const selectedNutrition = getMealSummary(selectedFoods.map((food) => food.nutrition))

  const selectFood = (food) => {
    setSelectedFood(food)
    setFoodAmount(String(food.defaultPortion))
    setFoodSearch(food.name)
    setShowFoodResults(false)
  }

  const addFood = () => {
    const amount = Number(foodAmount)
    if (!selectedFood || !amount || amount <= 0) return
    setSelectedFoods((current) => [...current, {
      id: `${selectedFood.id}-${Date.now()}`,
      foodId: selectedFood.id,
      name: selectedFood.name,
      amount,
      nutrition: getFoodNutrition(selectedFood, amount),
    }])
    setSelectedFood(null)
    setFoodSearch('')
    setFoodAmount('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (mode === 'catalog') {
      if (!selectedFoods.length) return
      onSubmit({ ...draft, name: draft.name.trim(), ...selectedNutrition, foods: selectedFoods })
      return
    }
    onSubmit({ ...draft, foods: [] })
  }

  const canSubmit = mode === 'catalog' ? selectedFoods.length > 0 : Boolean(draft.name.trim())

  return <form className="meal-form" onSubmit={handleSubmit}>
    <div className="meal-form-heading"><div><span className="eyebrow">{draft.id ? 'EDITAR REFEIÇÃO' : 'NOVA REFEIÇÃO'}</span><h3>{draft.id ? 'Atualize a refeição' : 'Monte sua refeição'}</h3></div><button type="button" className="form-cancel" onClick={onCancel}>Cancelar</button></div>
    <div className="meal-form-fields meal-basics-fields"><label className="meal-name-field"><span>Nome da refeição</span><input value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Ex.: almoço" /></label><label><span>Horário</span><input type="time" value={draft.time} onChange={(event) => onChange('time', event.target.value)} /></label></div>
    <div className="meal-mode-switch" role="tablist" aria-label="Forma de cadastrar refeição"><button type="button" className={mode === 'catalog' ? 'active' : ''} onClick={() => setMode('catalog')}>Pesquisar na base</button><button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>Informar manualmente</button></div>
    {mode === 'catalog' ? <CatalogMealBuilder foodCategories={catalogFoodCategories} foodSearch={foodSearch} foodCategory={foodCategory} setFoodCategory={setFoodCategory} setFoodSearch={setFoodSearch} setSelectedFood={setSelectedFood} setShowFoodResults={setShowFoodResults} showFoodResults={showFoodResults} filteredFoods={filteredFoods} selectFood={selectFood} foodAmount={foodAmount} setFoodAmount={setFoodAmount} selectedFood={selectedFood} addFood={addFood} selectedFoods={selectedFoods} setSelectedFoods={setSelectedFoods} selectedNutrition={selectedNutrition} /> : <ManualMealFields draft={draft} onChange={onChange} />}
    {/*
    {mode === 'catalog' ? (
      <div className="food-builder">
      <div className="food-picker-grid"><div className="food-search-picker"><div className="food-picker-top"><span>Alimento</span><select value={foodCategory} onChange={(event) => { setFoodCategory(event.target.value); setShowFoodResults(true) }} aria-label="Filtrar alimentos por categoria">{foodCategories.map((category) => <option value={category} key={category}>{category}</option>)}</select></div><div className="search-field meal-food-search"><span>{icons.search}</span><input value={foodSearch} onFocus={() => setShowFoodResults(true)} onBlur={() => window.setTimeout(() => setShowFoodResults(false), 140)} onChange={(event) => { setFoodSearch(event.target.value); setSelectedFood(null); setShowFoodResults(true) }} placeholder="Buscar arroz, frango, banana..." aria-label="Buscar alimento no catálogo" /></div>{showFoodResults && <div className="food-results" role="listbox"><div className="food-results-meta">{filteredFoods.length ? `${filteredFoods.length} alimento${filteredFoods.length === 1 ? '' : 's'} encontrado${filteredFoods.length === 1 ? '' : 's'}` : 'Nenhum alimento encontrado'}</div>{filteredFoods.slice(0, 8).map((food) => <button type="button" key={food.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectFood(food)}><span className="food-result-icon">{icons.meals}</span><span><strong>{food.name}</strong><small>{food.category} · {food.calories} kcal / 100 g · {food.protein} g proteína</small></span></button>)}{filteredFoods.length > 8 && <div className="food-results-more">Mostrando os 8 primeiros. Refine sua busca.</div>}</div>}</div></div><label className="food-amount-field"><span>Quantidade</span><div><input type="number" min="1" step="1" value={foodAmount} onChange={(event) => setFoodAmount(event.target.value)} placeholder="0" /><small>g</small></div></label><button type="button" className="primary-button food-add-button" onClick={addFood} disabled={!selectedFood || !Number(foodAmount)}>{icons.plus} Adicionar</button></div>
      {selectedFood && <div className="food-selection-preview"><div><strong>{selectedFood.name}</strong><small>{selectedFood.category} · por 100 g: {selectedFood.calories} kcal, {selectedFood.protein} g de proteína</small></div><span>{formatNutrition(getFoodNutrition(selectedFood, foodAmount).calories)} kcal</span></div>}
      <div className="selected-food-list">{selectedFoods.length ? selectedFoods.map((food, index) => <div className="selected-food-item" key={food.id}><span className="food-result-icon">{icons.check}</span><div><strong>{food.name}</strong><small>{food.amount} g · {formatNutrition(food.nutrition.calories)} kcal · {formatNutrition(food.nutrition.protein)} g proteína</small></div><button type="button" className="remove-meal-food" onClick={() => setSelectedFoods((current) => current.filter((_, foodIndex) => foodIndex !== index))} aria-label={`Remover ${food.name}`}>×</button></div>) : <p className="food-list-empty">Pesquise um alimento acima para começar a montar a refeição.</p>}</div>
      <div className="food-total-bar"><span><small>Total da refeição</small><strong>{formatNutrition(selectedNutrition.calories)} kcal</strong></span><span><small>Proteína</small><b>{formatNutrition(selectedNutrition.protein)} g</b></span><span><small>Carboidrato</small><b>{formatNutrition(selectedNutrition.carbs)} g</b></span><span><small>Fibras</small><b>{formatNutrition(selectedNutrition.fiber)} g</b></span></div>
    </div>) : (
      <div className="manual-macros-fields"><label><span>Calorias</span><input type="number" min="0" value={draft.calories} onChange={(event) => onChange('calories', event.target.value)} placeholder="0" /></label><label><span>Proteína (g)</span><input type="number" min="0" value={draft.protein} onChange={(event) => onChange('protein', event.target.value)} placeholder="0" /></label><label><span>Gordura (g)</span><input type="number" min="0" value={draft.fat} onChange={(event) => onChange('fat', event.target.value)} placeholder="0" /></label><label><span>Carboidrato (g)</span><input type="number" min="0" value={draft.carbs} onChange={(event) => onChange('carbs', event.target.value)} placeholder="0" /></label><label><span>Fibras (g)</span><input type="number" min="0" value={draft.fiber} onChange={(event) => onChange('fiber', event.target.value)} placeholder="0" /></label><label><span>Açúcares (g)</span><input type="number" min="0" value={draft.sugar} onChange={(event) => onChange('sugar', event.target.value)} placeholder="0" /></label><label><span>Sódio (mg)</span><input type="number" min="0" value={draft.sodium} onChange={(event) => onChange('sodium', event.target.value)} placeholder="0" /></label></div>
    )}
    */}
    <button className="primary-button meal-form-submit" type="submit" disabled={!canSubmit}>{icons.plus} Salvar refeição</button>
  </form>
}

function CatalogMealBuilder({ foodCategories, foodSearch, foodCategory, setFoodCategory, setFoodSearch, setSelectedFood, setShowFoodResults, showFoodResults, filteredFoods, selectFood, foodAmount, setFoodAmount, selectedFood, addFood, selectedFoods, setSelectedFoods, selectedNutrition }) {
  return <div className="food-builder">
    <div className="food-picker-grid"><div className="food-search-picker"><div className="food-picker-top"><span>Alimento</span><select value={foodCategory} onChange={(event) => { setFoodCategory(event.target.value); setShowFoodResults(true) }} aria-label="Filtrar alimentos por categoria">{foodCategories.map((category) => <option value={category} key={category}>{category}</option>)}</select></div><div className="search-field meal-food-search"><span>{icons.search}</span><input value={foodSearch} onFocus={() => setShowFoodResults(true)} onBlur={() => window.setTimeout(() => setShowFoodResults(false), 140)} onChange={(event) => { setFoodSearch(event.target.value); setSelectedFood(null); setShowFoodResults(true) }} placeholder="Buscar arroz, frango, banana..." aria-label="Buscar alimento no catálogo" /><div className="food-results-anchor">{showFoodResults && <div className="food-results" role="listbox"><div className="food-results-meta">{filteredFoods.length ? `${filteredFoods.length} alimento${filteredFoods.length === 1 ? '' : 's'} encontrado${filteredFoods.length === 1 ? '' : 's'}` : 'Nenhum alimento encontrado'}</div>{filteredFoods.slice(0, 8).map((food) => <button type="button" key={food.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectFood(food)}><span className="food-result-icon">{icons.meals}</span><span><strong>{food.name}</strong><small>{food.category} · {food.calories} kcal / 100 g · {food.protein} g proteína</small></span></button>)}{filteredFoods.length > 8 && <div className="food-results-more">Mostrando os 8 primeiros. Refine sua busca.</div>}</div>}</div></div></div><label className="food-amount-field"><span>Quantidade</span><div><input type="number" min="1" step="1" value={foodAmount} onChange={(event) => setFoodAmount(event.target.value)} placeholder="0" /><small>g</small></div></label><button type="button" className="primary-button food-add-button" onClick={addFood} disabled={!selectedFood || !Number(foodAmount)}>{icons.plus} Adicionar</button></div>
    {selectedFood && <div className="food-selection-preview"><div><strong>{selectedFood.name}</strong><small>{selectedFood.category} · por 100 g: {selectedFood.calories} kcal, {selectedFood.protein} g de proteína</small></div><span>{formatNutrition(getFoodNutrition(selectedFood, foodAmount).calories)} kcal</span></div>}
    <div className="selected-food-list">{selectedFoods.length ? selectedFoods.map((food, index) => <div className="selected-food-item" key={food.id}><span className="food-result-icon">{icons.check}</span><div><strong>{food.name}</strong><small>{food.amount} g · {formatNutrition(food.nutrition.calories)} kcal · {formatNutrition(food.nutrition.protein)} g proteína</small></div><button type="button" className="remove-meal-food" onClick={() => setSelectedFoods((current) => current.filter((_, foodIndex) => foodIndex !== index))} aria-label={`Remover ${food.name}`}>×</button></div>) : <p className="food-list-empty">Pesquise um alimento acima para começar a montar a refeição.</p>}</div>
    <div className="food-total-bar"><span><small>Total da refeição</small><strong>{formatNutrition(selectedNutrition.calories)} kcal</strong></span><span><small>Proteína</small><b>{formatNutrition(selectedNutrition.protein)} g</b></span><span><small>Carboidrato</small><b>{formatNutrition(selectedNutrition.carbs)} g</b></span><span><small>Fibras</small><b>{formatNutrition(selectedNutrition.fiber)} g</b></span></div>
  </div>
}

function ManualMealFields({ draft, onChange }) {
  return <div className="manual-macros-fields"><label><span>Calorias</span><input type="number" min="0" value={draft.calories} onChange={(event) => onChange('calories', event.target.value)} placeholder="0" /></label><label><span>Proteína (g)</span><input type="number" min="0" value={draft.protein} onChange={(event) => onChange('protein', event.target.value)} placeholder="0" /></label><label><span>Gordura (g)</span><input type="number" min="0" value={draft.fat} onChange={(event) => onChange('fat', event.target.value)} placeholder="0" /></label><label><span>Carboidrato (g)</span><input type="number" min="0" value={draft.carbs} onChange={(event) => onChange('carbs', event.target.value)} placeholder="0" /></label><label><span>Fibras (g)</span><input type="number" min="0" value={draft.fiber} onChange={(event) => onChange('fiber', event.target.value)} placeholder="0" /></label><label><span>Açúcares (g)</span><input type="number" min="0" value={draft.sugar} onChange={(event) => onChange('sugar', event.target.value)} placeholder="0" /></label><label><span>Sódio (mg)</span><input type="number" min="0" value={draft.sodium} onChange={(event) => onChange('sodium', event.target.value)} placeholder="0" /></label></div>
}

function WorkoutDetail({ workout, dayLabel, onBack, onUpdate, exerciseCatalog: catalog = exerciseCatalog, exerciseCatalogSize }) {
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [exerciseGroup, setExerciseGroup] = useState('outros')
  const [exerciseGroupFilter, setExerciseGroupFilter] = useState('todos')
  const [selectedCatalogExercise, setSelectedCatalogExercise] = useState(null)
  const [showExerciseResults, setShowExerciseResults] = useState(false)

  const filteredCatalog = useMemo(() => {
    const query = normalizeSearchText(exerciseSearch)
    return catalog.filter((exercise) => {
      const matchesGroup = exerciseGroupFilter === 'todos' || exercise.muscleGroup === exerciseGroupFilter
      const searchableText = normalizeSearchText([exercise.name, exercise.equipment, exercise.level, ...exercise.aliases].join(' '))
      return matchesGroup && (!query || searchableText.includes(query))
    })
  }, [catalog, exerciseGroupFilter, exerciseSearch])

  if (!workout) return <EmptyState title="Treino não encontrado" copy="Volte para a semana e escolha outro treino." />

  const exercises = workout.exercises.map(normalizeExercise)
  const activeGroups = new Set(exercises.map((exercise) => exercise.muscleGroup))
  const setVolume = exercises.reduce((volume, exercise) => ({
    ...volume,
    [exercise.muscleGroup]: (volume[exercise.muscleGroup] || 0) + exercise.sets,
  }), {})

  const addExercise = () => {
    const value = exerciseSearch.trim()
    if (!value) return
    const catalogExercise = selectedCatalogExercise || catalog.find((exercise) => normalizeSearchText(exercise.name) === normalizeSearchText(value))
    onUpdate({
      ...workout,
      exercises: [...workout.exercises, {
        id: catalogExercise?.id,
        name: catalogExercise?.name || value,
        muscleGroup: exerciseGroup,
        equipment: catalogExercise?.equipment,
        level: catalogExercise?.level,
        sets: 3,
      }],
    })
    setExerciseSearch('')
    setExerciseGroup('outros')
    setSelectedCatalogExercise(null)
    setShowExerciseResults(false)
  }

  const removeExercise = (index) => onUpdate({ ...workout, exercises: workout.exercises.filter((_, itemIndex) => itemIndex !== index) })

  const updateExerciseSets = (index, value) => {
    const sets = Math.min(99, Math.max(1, Number(value) || 1))
    onUpdate({
      ...workout,
      exercises: workout.exercises.map((exercise, itemIndex) => (
        itemIndex === index ? { ...normalizeExercise(exercise), sets } : exercise
      )),
    })
  }

  const selectCatalogExercise = (exercise) => {
    setSelectedCatalogExercise(exercise)
    setExerciseSearch(exercise.name)
    setExerciseGroup(exercise.muscleGroup)
    setShowExerciseResults(false)
  }

  const updateExerciseSearch = (value) => {
    setExerciseSearch(value)
    setSelectedCatalogExercise(null)
    setShowExerciseResults(true)
  }

  return <div className="workout-detail-layout"><section className="panel detail-visual-panel"><button className="back-link" onClick={onBack}>← Voltar para semana</button><div className="detail-heading"><span className="eyebrow">{(dayLabel || 'TREINO').toUpperCase()}</span><h1>Mapa muscular</h1><p>Quanto mais séries, mais intensa fica a cor do grupo muscular.</p></div><div className="silhouette-wrap"><MuscleSilhouette setVolume={setVolume} /></div><div className="muscle-legend">{muscleGroups.filter((group) => activeGroups.has(group.id)).map((group) => <span key={group.id}><i style={{ background: group.color }} />{group.label} · {setVolume[group.id]} {setVolume[group.id] === 1 ? 'série' : 'séries'}</span>)}</div></section><section className="detail-list-column"><div className="detail-heading detail-heading-right"><span className="eyebrow">{(dayLabel || 'TREINO').toUpperCase()}</span><h1>{workout.title}</h1><p>{exercises.length} {exercises.length === 1 ? 'exercício cadastrado' : 'exercícios cadastrados'}</p></div><section className="panel exercise-detail-panel"><div className="detail-section-heading"><div><h2>Lista de exercícios</h2><p>Escolha na base com {exerciseCatalogSize} exercícios ou cadastre um movimento personalizado.</p></div></div><div className="detail-exercise-list">{exercises.length ? exercises.map((exercise, index) => <div className="detail-exercise-item" key={`${exercise.name}-${index}`}><span className="exercise-color" style={{ background: getMuscleColor(exercise.muscleGroup) }} /><div><strong>{exercise.name}</strong><small>{muscleGroups.find((group) => group.id === exercise.muscleGroup)?.label || 'Outro'}{exercise.equipment ? ` · ${exercise.equipment}` : ''}</small></div><label className="exercise-sets-control"><span>Séries</span><input type="number" min="1" max="99" value={exercise.sets} onChange={(event) => updateExerciseSets(index, event.target.value)} aria-label={`Séries de ${exercise.name}`} /></label><button className="remove-exercise" onClick={() => removeExercise(index)} aria-label={`Remover ${exercise.name}`}>×</button></div>) : <EmptyState compact title="Nenhum exercício cadastrado" copy="Adicione o primeiro exercício abaixo." />}</div><div className="detail-add-form"><div className="exercise-picker"><div className="exercise-picker-top"><span>Exercício</span><select className="exercise-filter" value={exerciseGroupFilter} onChange={(event) => { setExerciseGroupFilter(event.target.value); setShowExerciseResults(true) }} aria-label="Filtrar catálogo por grupo muscular"><option value="todos">Todos os grupos</option>{muscleGroups.map((group) => <option value={group.id} key={group.id}>{group.label}</option>)}</select></div><div className="search-field exercise-picker-input"><span>{icons.search}</span><input value={exerciseSearch} onFocus={() => setShowExerciseResults(true)} onBlur={() => window.setTimeout(() => setShowExerciseResults(false), 140)} onChange={(event) => updateExerciseSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addExercise() } }} placeholder="Buscar exercício..." aria-label="Buscar exercício no catálogo" /></div>{showExerciseResults && <div className="exercise-results" role="listbox"><div className="exercise-results-meta">{filteredCatalog.length ? `${filteredCatalog.length} exercício${filteredCatalog.length === 1 ? '' : 's'} encontrado${filteredCatalog.length === 1 ? '' : 's'}` : 'Nenhum exercício encontrado'}</div>{filteredCatalog.slice(0, 10).map((exercise) => <button type="button" className={selectedCatalogExercise?.id === exercise.id ? 'selected' : ''} key={exercise.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectCatalogExercise(exercise)}><span>{selectedCatalogExercise?.id === exercise.id ? icons.check : icons.dumbbell}</span><strong>{exercise.name}</strong><small>{muscleGroups.find((group) => group.id === exercise.muscleGroup)?.label} · {exercise.equipment} · {exercise.level}</small></button>)}{filteredCatalog.length > 10 && <div className="exercise-results-more">Mostrando os 10 primeiros. Refine sua busca.</div>}{!filteredCatalog.length && <div className="exercise-results-empty">Você pode adicionar “{exerciseSearch}” como exercício personalizado.</div>}</div>}</div><label><span>Grupo muscular</span><select value={exerciseGroup} onChange={(event) => setExerciseGroup(event.target.value)}>{muscleGroups.map((group) => <option value={group.id} key={group.id}>{group.label}</option>)}</select></label><button className="primary-button" onClick={addExercise} disabled={!exerciseSearch.trim()}>{icons.plus} Adicionar</button></div></section></section></div>
}

function LegacyMuscleSilhouette({ activeGroups }) {
  const fillFor = (...groups) => groups.find((group) => activeGroups.has(group)) ? getMuscleColor(groups.find((group) => activeGroups.has(group))) : '#2b2735'
  const base = '#24202d'

  return <div className="muscle-silhouette-grid"><div className="muscle-view"><span className="muscle-view-label">FRENTE</span><svg className="muscle-silhouette" viewBox="0 0 180 440" role="img" aria-label="Mapa muscular da frente do corpo"><circle className="silhouette-part silhouette-neutral" cx="90" cy="25" r="18" fill={base} /><path className="silhouette-part silhouette-neutral" d="M83 43h14v16H83z" fill={base} /><path className="silhouette-part" d="M82 54 66 63l9 25 15-10V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M98 54l16 9-9 25-15-10V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M66 64c-12 1-19 8-22 18l15 11 13-14z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M114 64c12 1 19 8 22 18l-15 11-13-14z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M75 75q15-9 30 0l-2 27H77z" fill={fillFor('peito')} /><path className="silhouette-part" d="M77 76q-8 4-13 14l12 9 10-16z" fill={fillFor('peito')} /><path className="silhouette-part" d="M103 76q8 4 13 14l-12 9-10-16z" fill={fillFor('peito')} /><path className="silhouette-part" d="M59 93 71 99l-5 27-13-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="M121 93 109 99l5 27 13-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="m53 122 13 4-10 29-12-7z" fill={fillFor('braços')} /><path className="silhouette-part" d="m127 122-13 4 10 29 12-7z" fill={fillFor('braços')} /><path className="silhouette-part silhouette-neutral" d="m44 148 12 7-5 12-11-6zM136 148l-12 7 5 12 11-6z" fill={base} /><path className="silhouette-part" d="M77 101h11v13H77zM92 101h11v13H92zM77 116h11v13H77zM92 116h11v13H92zM77 131h11v13H77zM92 131h11v13H92z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M73 101q4 22 4 43l-7 12 20 5v-60z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M107 101q-4 22-4 43l7 12-20 5v-60z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M77 146h26l-5 16-8 7-8-7z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M77 163h12v61H70l-5-38z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M103 163H91v61h19l5-38z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M70 224h19l-4 14-13 1zM110 224H91l4 14 13 1z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M71 239h14l-2 52-12 1-7-33z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M109 239H95l2 52 12 1 7-33z" fill={fillFor('pernas')} /><path className="silhouette-part silhouette-neutral" d="M71 292h12l-4 13H65zM109 292H97l4 13h14z" fill={base} /></svg></div><div className="muscle-view"><span className="muscle-view-label">COSTAS</span><svg className="muscle-silhouette" viewBox="0 0 180 440" role="img" aria-label="Mapa muscular das costas do corpo"><circle className="silhouette-part silhouette-neutral" cx="90" cy="25" r="18" fill={base} /><path className="silhouette-part silhouette-neutral" d="M83 43h14v16H83z" fill={base} /><path className="silhouette-part" d="M83 54 53 67l24 25 13-16V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M97 54l30 13-24 25-13-16V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M57 67c-10 1-17 8-20 17l15 12 15-14z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M123 67c10 1 17 8 20 17l-15 12-15-14z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M54 94 67 98l-5 28-13-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="M126 94 113 98l5 28 13-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="m49 122 13 4-10 29-12-7z" fill={fillFor('braços')} /><path className="silhouette-part" d="m131 122-13 4 10 29 12-7z" fill={fillFor('braços')} /><path className="silhouette-part silhouette-neutral" d="m40 148 12 7-5 12-11-6zM140 148l-12 7 5 12 11-6z" fill={base} /><path className="silhouette-part" d="M77 74q13 8 26 0l7 21-20 18-20-18z" fill={fillFor('costas')} /><path className="silhouette-part" d="M70 93 86 111 82 151 65 133q-9-18 5-40z" fill={fillFor('costas')} /><path className="silhouette-part" d="M110 93 94 111l4 40 17-18q9-18-5-40z" fill={fillFor('costas')} /><path className="silhouette-part" d="M86 107h8v54h-8z" fill={fillFor('costas')} /><path className="silhouette-part" d="M70 151q20 9 40 0l-5 16H75z" fill={fillFor('costas')} /><path className="silhouette-part" d="M75 164h15v59H70l-5-38z" fill={fillFor('glúteos', 'pernas')} /><path className="silhouette-part" d="M105 164H90v59h20l5-38z" fill={fillFor('glúteos', 'pernas')} /><path className="silhouette-part" d="M70 223h20l-4 16H68zM110 223H90l4 16h18z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M69 239h16l-3 52H70l-7-33z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M111 239H95l3 52h12l7-33z" fill={fillFor('pernas')} /><path className="silhouette-part silhouette-neutral" d="M70 292h12l-4 13H64zM110 292H98l4 13h14z" fill={base} /></svg></div></div>
}

function LegacyDetailedMuscleSilhouette({ activeGroups }) {
  const fillFor = (...groups) => groups.find((group) => activeGroups.has(group)) ? getMuscleColor(groups.find((group) => activeGroups.has(group))) : '#2b2735'
  const base = '#24202d'

  return <div className="muscle-map"><div className="muscle-silhouette-grid"><div className="muscle-view"><span className="muscle-view-label">FRENTE</span><svg className="muscle-silhouette" viewBox="0 0 180 440" role="img" aria-label="Mapa detalhado da musculatura frontal"><title>Musculatura frontal</title><circle className="silhouette-part silhouette-neutral" cx="90" cy="25" r="18" fill={base} /><path className="silhouette-part silhouette-neutral" d="M83 43h14v16H83z" fill={base} /><path className="silhouette-part" d="M83 54 68 63l10 22 12-12V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M97 54l15 9-10 22-12-12V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M68 63q-10 1-16 8l7 11 12-7z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M54 71q-7 5-9 13l7 9 9-11z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M48 80q-5 4-6 10l7 8 6-9z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M112 63q10 1 16 8l-7 11-12-7z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M126 71q7 5 9 13l-7 9-9-11z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M132 80q5 4 6 10l-7 8-6-9z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M77 75q13-9 26 0l-2 26H79z" fill={fillFor('peito')} /><path className="silhouette-part" d="M79 76q-7 4-11 11l10 10 11-15z" fill={fillFor('peito')} /><path className="silhouette-part" d="M101 76q7 4 11 11l-10 10-11-15z" fill={fillFor('peito')} /><path className="silhouette-part" d="M58 91l10 5-5 26-10-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="M63 95l7 4-5 25-7-2z" fill={fillFor('braços')} /><path className="silhouette-part" d="M122 91l-10 5 5 26 10-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="M117 95l-7 4 5 25 7-2z" fill={fillFor('braços')} /><path className="silhouette-part" d="M53 118l10 4-9 29-10-6z" fill={fillFor('braços')} /><path className="silhouette-part" d="M127 118l-10 4 9 29 10-6z" fill={fillFor('braços')} /><path className="silhouette-part silhouette-neutral" d="m44 146 11 6-4 13-10-6zM136 146l-11 6 4 13 10-6z" fill={base} /><path className="silhouette-part" d="M78 101h10v13H78zM92 101h10v13H92zM78 116h10v13H78zM92 116h10v13H92zM78 131h10v13H78zM92 131h10v13H92z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M73 101q4 25 4 44l-8 12 21 5v-61z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M107 101q-4 25-4 44l8 12-21 5v-61z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M77 146h26l-5 16-8 7-8-7z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M77 163h7l-2 60H69l-5-38z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M84 163h7v61H77l-2-44z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M96 163h-7v61h14l2-44z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M103 163h-7l2 60h13l5-38z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M69 223h19l-4 15-13 1zM111 223H92l4 15 13 1z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M71 239h7l-3 52H65l-5-33z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M78 239h7l-2 52H75z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M102 239h-7l2 52h8z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M109 239h-7l3 52h10l5-33z" fill={fillFor('pernas')} /><path className="silhouette-part silhouette-neutral" d="M65 291h14l-4 14H59zM115 291h-14l4 14h16z" fill={base} /><path className="silhouette-detail-line" d="M90 59v99M90 163v61M90 239v52M55 122l8 4M125 122l-8 4" /></svg></div><div className="muscle-view"><span className="muscle-view-label">COSTAS</span><svg className="muscle-silhouette" viewBox="0 0 180 440" role="img" aria-label="Mapa detalhado da musculatura posterior"><title>Musculatura posterior</title><circle className="silhouette-part silhouette-neutral" cx="90" cy="25" r="18" fill={base} /><path className="silhouette-part silhouette-neutral" d="M83 43h14v16H83z" fill={base} /><path className="silhouette-part" d="M83 54 54 67l25 25 11-16V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M97 54l29 13-25 25-11-16V58z" fill={fillFor('costas')} /><path className="silhouette-part" d="M57 67q-10 1-16 8l7 11 13-7z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M46 75q-6 4-8 11l7 9 9-10z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M123 67q10 1 16 8l-7 11-13-7z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M134 75q6 4 8 11l-7 9-9-10z" fill={fillFor('ombros')} /><path className="silhouette-part" d="M56 91l10 5-5 26-10-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="M63 95l7 4-5 25-7-2z" fill={fillFor('braços')} /><path className="silhouette-part" d="M124 91l-10 5 5 26 10-4z" fill={fillFor('braços')} /><path className="silhouette-part" d="M117 95l-7 4 5 25 7-2z" fill={fillFor('braços')} /><path className="silhouette-part" d="M51 118l10 4-9 29-10-6z" fill={fillFor('braços')} /><path className="silhouette-part" d="M129 118l-10 4 9 29 10-6z" fill={fillFor('braços')} /><path className="silhouette-part silhouette-neutral" d="m42 146 11 6-4 13-10-6zM138 146l-11 6 4 13 10-6z" fill={base} /><path className="silhouette-part" d="M81 65 90 75l9-10 8 27-17 17-17-17z" fill={fillFor('costas')} /><path className="silhouette-part" d="M73 91 86 108l-4 43-17-18q-8-19 8-42z" fill={fillFor('costas')} /><path className="silhouette-part" d="M107 91 94 108l4 43 17-18q8-19-8-42z" fill={fillFor('costas')} /><path className="silhouette-part" d="M87 106h6v57h-6z" fill={fillFor('costas')} /><path className="silhouette-part" d="M70 151q20 10 40 0l-5 15H75z" fill={fillFor('costas')} /><path className="silhouette-part" d="M75 166h8l-2 57H68l-5-37z" fill={fillFor('glúteos', 'pernas')} /><path className="silhouette-part" d="M83 166h7v59H76z" fill={fillFor('glúteos', 'pernas')} /><path className="silhouette-part" d="M97 166h-7v59l7-2z" fill={fillFor('glúteos', 'pernas')} /><path className="silhouette-part" d="M105 166h-8l2 57h13l5-37z" fill={fillFor('glúteos', 'pernas')} /><path className="silhouette-part" d="M68 223h20l-4 16H66zM112 223H92l4 16h18z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M69 239h8l-3 52H63l-5-33z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M77 239h8l-2 52H74z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M103 239h-8l2 52h9z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M111 239h-8l3 52h10l5-33z" fill={fillFor('pernas')} /><path className="silhouette-part silhouette-neutral" d="M63 291h14l-4 14H57zM117 291h-14l4 14h16z" fill={base} /><path className="silhouette-detail-line" d="M90 59v104M90 166v59M90 239v52M56 122l8 4M124 122l-8 4" /></svg></div></div><div className="muscle-anatomy-key"><span><b>Ombros</b> anterior · lateral · posterior</span><span><b>Braços</b> bíceps · tríceps · antebraço</span><span><b>Pernas</b> quadríceps · posterior · tibial · panturrilha</span><span><b>Costas</b> trapézio · dorsais · lombar</span></div></div>
}

function MuscleSilhouette({ setVolume }) {
  return <MusclePlateMap setVolume={setVolume} />
}

function LegacyRefinedMuscleSilhouette({ activeGroups }) {
  const anatomyPalette = {
    peito: '#eb5c55',
    ombros: '#e7b340',
    braços: '#e8794f',
    abdômen: '#7765d5',
    costas: '#3d91bd',
    glúteos: '#a269c9',
    pernas: '#68ad4c',
  }
  const region = (groups, fallback = '#282431') => {
    const activeGroup = groups.find((group) => activeGroups.has(group))
    const anatomyColor = groups.map((group) => anatomyPalette[group]).find(Boolean)
    if (!anatomyColor) return fallback
    return activeGroup ? anatomyColor : `${anatomyColor}66`
  }

  return <div className="muscle-map refined-muscle-map"><div className="muscle-silhouette-grid"><div className="muscle-view"><span className="muscle-view-label">FRENTE</span><svg className="muscle-silhouette refined-silhouette" viewBox="0 0 220 560" role="img" aria-label="Mapa muscular frontal detalhado"><title>Frente do corpo: peito, abdômen, braços e pernas</title><circle className="silhouette-part silhouette-neutral" cx="110" cy="33" r="23" fill="#201d29" /><path className="silhouette-part silhouette-neutral" d="M101 56h18v26h-18z" fill="#201d29" /><path className="silhouette-part" d="M101 77 83 87l15 23 12-17v-12z" fill={region(['costas'], '#30283a')} /><path className="silhouette-part" d="M119 77l18 10-15 23-12-17v-12z" fill={region(['costas'], '#30283a')} /><path className="silhouette-part" d="M84 86c-13 0-25 9-29 21 8 8 17 11 28 8l10-18z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M58 97c-10 4-16 13-15 24l13 11 12-20z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M48 117c-7 6-8 14-4 21l12 7 7-15z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M136 86c13 0 25 9 29 21-8 8-17 11-28 8l-10-18z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M162 97c10 4 16 13 15 24l-13 11-12-20z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M172 117c7 6 8 14 4 21l-12 7-7-15z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M103 91c-12-7-29-1-35 12 7 15 21 20 42 17v-21z" fill={region(['peito'], '#322b3b')} /><path className="silhouette-part" d="M117 91c12-7 29-1 35 12-7 15-21 20-42 17v-21z" fill={region(['peito'], '#322b3b')} /><path className="silhouette-part" d="M67 118c-9 8-12 21-7 35 5 5 12 6 19 2l3-28z" fill={region(['braços'], '#302735')} /><path className="silhouette-part" d="M153 118c9 8 12 21 7 35-5 5-12 6-19 2l-3-28z" fill={region(['braços'], '#302735')} /><path className="silhouette-part" d="M61 151c-8 13-12 29-12 45 5 7 12 9 19 5l8-43z" fill={region(['braços'], '#2d2734')} /><path className="silhouette-part" d="M159 151c8 13 12 29 12 45-5 7-12 9-19 5l-8-43z" fill={region(['braços'], '#2d2734')} /><path className="silhouette-part silhouette-neutral" d="M49 194c-4 6-3 14 2 19l10-4 2-15zM171 194c4 6 3 14-2 19l-10-4-2-15z" fill="#201d29" /><path className="silhouette-part" d="M79 119c-7 17-8 37-4 57 7 6 14 7 22 4v-66z" fill={region(['abdômen'], '#302a38')} /><path className="silhouette-part" d="M141 119c7 17 8 37 4 57-7 6-14 7-22 4v-66z" fill={region(['abdômen'], '#302a38')} /><path className="silhouette-part" d="M95 118c-3 10-3 20 0 30h12v-31zM113 117v31h12c3-10 3-20 0-30zM95 151v29h12v-29zM113 151v29h12v-29z" fill={region(['abdômen'], '#373042')} /><path className="silhouette-part" d="M86 178c8 4 16 5 24 2v23l-18 4-13-10z" fill={region(['abdômen'], '#302a38')} /><path className="silhouette-part" d="M134 178c-8 4-16 5-24 2v23l18 4 13-10z" fill={region(['abdômen'], '#302a38')} /><path className="silhouette-part" d="M92 201c7 5 19 5 36 0l13 17-9 16H88l-9-16z" fill={region(['abdômen'], '#302431')} /><path className="silhouette-part" d="M89 232c-8 11-14 27-15 47-1 19 1 35 6 48 9 4 18 3 28-2l2-91z" fill={region(['pernas'], '#302a38')} /><path className="silhouette-part" d="M131 232c8 11 14 27 15 47 1 19-1 35-6 48-9 4-18 3-28-2l-2-91z" fill={region(['pernas'], '#302a38')} /><path className="silhouette-part" d="M80 231c5 18 7 35 4 51-4 20-3 34 2 45l14-2 4-94z" fill={region(['pernas'], '#352c40')} /><path className="silhouette-part" d="M140 231c-5 18-7 35-4 51 4 20 3 34-2 45l-14-2-4-94z" fill={region(['pernas'], '#352c40')} /><path className="silhouette-part silhouette-neutral" d="M80 327c8 6 18 6 30 0v16l-12 10-13-5zM140 327c-8 6-18 6-30 0v16l12 10 13-5z" fill="#201d29" /><path className="silhouette-part" d="M84 349c-5 20-8 44-8 70 5 8 13 10 23 7l9-77z" fill={region(['pernas'], '#2e2936')} /><path className="silhouette-part" d="M136 349c5 20 8 44 8 70-5 8-13 10-23 7l-9-77z" fill={region(['pernas'], '#2e2936')} /><path className="silhouette-part" d="M77 422c-5 25-8 48-7 68 8 7 18 8 29 3l9-72z" fill={region(['pernas'], '#342b3d')} /><path className="silhouette-part" d="M143 422c5 25 8 48 7 68-8 7-18 8-29 3l-9-72z" fill={region(['pernas'], '#342b3d')} /><path className="silhouette-part silhouette-neutral" d="M70 490c6 8 17 10 29 3l-6 20H63c-1-8 1-16 7-23zM150 490c-6 8-17 10-29 3l6 20h30c1-8-1-16-7-23z" fill="#201d29" /></svg></div><div className="muscle-view"><span className="muscle-view-label">COSTAS</span><svg className="muscle-silhouette refined-silhouette" viewBox="0 0 220 560" role="img" aria-label="Mapa muscular posterior detalhado"><title>Costas do corpo: trapézio, dorsais, glúteos e pernas</title><circle className="silhouette-part silhouette-neutral" cx="110" cy="33" r="23" fill="#201d29" /><path className="silhouette-part silhouette-neutral" d="M101 56h18v26h-18z" fill="#201d29" /><path className="silhouette-part" d="M101 77 69 92l29 28 12-26v-12z" fill={region(['costas'], '#30283a')} /><path className="silhouette-part" d="M119 77l32 15-29 28-12-26v-12z" fill={region(['costas'], '#30283a')} /><path className="silhouette-part" d="M69 91c-12 0-23 9-28 20 7 9 16 13 27 10l12-17z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M151 91c12 0 23 9 28 20-7 9-16 13-27 10l-12-17z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M49 111c-7 7-7 15-1 22l11 8 8-18z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M171 111c7 7 7 15 1 22l-11 8-8-18z" fill={region(['ombros'], '#302431')} /><path className="silhouette-part" d="M67 121c-8 7-11 20-7 34 6 5 13 5 20 0l4-27z" fill={region(['braços'], '#302735')} /><path className="silhouette-part" d="M153 121c8 7 11 20 7 34-6 5-13 5-20 0l-4-27z" fill={region(['braços'], '#302735')} /><path className="silhouette-part" d="M61 154c-8 13-12 30-11 46 6 7 13 9 20 4l8-43z" fill={region(['braços'], '#2d2734')} /><path className="silhouette-part" d="M159 154c8 13 12 30 11 46-6 7-13 9-20 4l-8-43z" fill={region(['braços'], '#2d2734')} /><path className="silhouette-part silhouette-neutral" d="M50 197c-4 6-2 14 3 19l10-5 1-14zM170 197c4 6 2 14-3 19l-10-5-1-14z" fill="#201d29" /><path className="silhouette-part" d="M81 85c9 14 18 21 29 24V94l-14-14z" fill={region(['costas'], '#3a3044')} /><path className="silhouette-part" d="M139 85c-9 14-18 21-29 24V94l14-14z" fill={region(['costas'], '#3a3044')} /><path className="silhouette-part" d="M78 106c-10 13-15 31-13 53 5 14 14 22 27 27l12-63-15-20z" fill={region(['costas'], '#332a3d')} /><path className="silhouette-part" d="M142 106c10 13 15 31 13 53-5 14-14 22-27 27l-12-63 15-20z" fill={region(['costas'], '#332a3d')} /><path className="silhouette-part" d="M107 101h6v90h-6z" fill={region(['costas'], '#3b3147')} /><path className="silhouette-part" d="M82 190c8 8 18 12 28 12s20-4 28-12l7 22-14 20H89l-14-20z" fill={region(['costas'], '#30283a')} /><path className="silhouette-part" d="M89 232c-8 11-14 27-15 47-1 18 1 34 6 48 9 4 18 4 28-2l2-91z" fill={region(['glúteos', 'pernas'], '#302a38')} /><path className="silhouette-part" d="M131 232c8 11 14 27 15 47 1 18-1 34-6 48-9 4-18 4-28-2l-2-91z" fill={region(['glúteos', 'pernas'], '#302a38')} /><path className="silhouette-part" d="M80 231c5 18 7 34 4 51-4 20-3 34 2 45l14-2 4-94z" fill={region(['pernas'], '#352c40')} /><path className="silhouette-part" d="M140 231c-5 18-7 34-4 51 4 20 3 34-2 45l-14-2-4-94z" fill={region(['pernas'], '#352c40')} /><path className="silhouette-part silhouette-neutral" d="M80 327c8 6 18 6 30 0v16l-12 10-13-5zM140 327c-8 6-18 6-30 0v16l12 10 13-5z" fill="#201d29" /><path className="silhouette-part" d="M84 349c-5 20-8 44-8 70 5 8 13 10 23 7l9-77z" fill={region(['pernas'], '#2e2936')} /><path className="silhouette-part" d="M136 349c5 20 8 44 8 70-5 8-13 10-23 7l-9-77z" fill={region(['pernas'], '#2e2936')} /><path className="silhouette-part" d="M77 422c-5 25-8 48-7 68 8 7 18 8 29 3l9-72z" fill={region(['pernas'], '#342b3d')} /><path className="silhouette-part" d="M143 422c5 25 8 48 7 68-8 7-18 8-29 3l-9-72z" fill={region(['pernas'], '#342b3d')} /><path className="silhouette-part silhouette-neutral" d="M70 490c6 8 17 10 29 3l-6 20H63c-1-8 1-16 7-23zM150 490c-6 8-17 10-29 3l6 20h30c1-8-1-16-7-23z" fill="#201d29" /></svg></div></div><div className="muscle-anatomy-key"><span><b>Ombros</b> anterior · lateral · posterior</span><span><b>Braços</b> bíceps · tríceps · antebraço</span><span><b>Pernas</b> quadríceps · posterior · tibial · panturrilha</span><span><b>Costas</b> trapézio · dorsais · lombar</span></div></div>
}

function SettingsView({ user, onUpdate }) {
  const [academy, setAcademy] = useState(user.organization || '')
  const [editingAcademy, setEditingAcademy] = useState(!user.organization)
  const [savingAcademy, setSavingAcademy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setAcademy(user.organization || '')
    setEditingAcademy(!user.organization)
  }, [user.organization])

  const handleAcademySubmit = async (event) => {
    event.preventDefault()
    setSavingAcademy(true)
    setFeedback(null)

    try {
      await onUpdate({ organization: academy })
      setEditingAcademy(false)
      setFeedback({ type: 'success', message: academy.trim() ? 'Academia vinculada ao usuário.' : 'Academia removida do usuário.' })
    } catch (error) {
      setFeedback({ type: 'error', message: `Não foi possível salvar a academia: ${getReadableAuthError(error)}` })
    } finally {
      setSavingAcademy(false)
    }
  }

  return <div className="settings-layout"><section className="panel settings-panel"><div className="settings-profile"><Avatar initials={user.initials} tone={user.tone} large /><div><h2>{user.name}</h2><p>{user.email}</p><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></div><button className="outline-button" type="button" onClick={() => { setEditingAcademy(true); setFeedback(null) }}>{icons.edit} Editar perfil</button></div><div className="settings-section"><span className="eyebrow">INFORMAÇÕES PESSOAIS</span><form className="settings-fields" onSubmit={handleAcademySubmit}><label>Nome completo<input value={user.name} readOnly /></label><label>E-mail<input value={user.email} readOnly /></label><label className="settings-academy-field">Academia{editingAcademy ? <input value={academy} onChange={(event) => setAcademy(event.target.value)} placeholder="Ex.: GymMaxxing Centro" maxLength={120} autoFocus /> : <span className="settings-readonly-value">{academy || 'Academia não informada'}</span>}</label>{editingAcademy && <div className="settings-academy-actions"><button className="outline-button" type="button" onClick={() => { setAcademy(user.organization || ''); setEditingAcademy(false); setFeedback(null) }}>Cancelar</button><button className="primary-button" type="submit" disabled={savingAcademy}>{savingAcademy ? 'Salvando...' : 'Salvar academia'}</button></div>}</form>{feedback && <p className={`settings-feedback ${feedback.type}`} role="status">{feedback.message}</p>}</div></section><section className="panel preference-panel"><div className="panel-heading"><div><h3>Preferências</h3><p>Personalize sua experiência.</p></div></div><EmptyState title="Preferências não configuradas" copy="Suas preferências aparecerão aqui quando forem carregadas." /></section></div>
}

function Avatar({ initials, tone = 'purple', small = false, large = false }) { return <span className={`avatar ${tone} ${small ? 'small' : ''} ${large ? 'large' : ''}`}>{initials}</span> }
function Logo() { return <span className="logo-mark"><span /><span /><span /></span> }

export default App
