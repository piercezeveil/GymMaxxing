import { useMemo, useState } from 'react'
import { exerciseCatalog, exerciseCatalogSize } from './data/exercises'
import { foodCategories, foodDatabase } from './foodDatabase'

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

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />
  }

  const pageTitles = {
    dashboard: ['Visão geral', 'Acompanhe o que está acontecendo na sua academia.'],
    calendar: ['Horários', 'Organize as escalas e encontre o melhor horário para treinar.'],
    users: ['Usuários', 'Gerencie membros, profissionais e administradores.'],
    workouts: ['Meus treinos', 'Monte sua semana e mantenha o foco no seu objetivo.'],
    'workout-detail': ['Detalhe do treino', 'Acompanhe os exercícios e os grupos musculares trabalhados.'],
    meals: ['Refeições', 'Planeje sua alimentação e acompanhe seus macros.'],
    'meal-detail': ['Detalhe das refeições', 'Acompanhe os macros e organize suas refeições do dia.'],
    settings: ['Configurações', 'Ajuste seu perfil e as preferências da academia.'],
  }

  const openWorkout = (day, index) => {
    const workoutExists = workouts[day]?.[index]
    if (!workoutExists) {
      setWorkouts((current) => ({
        ...current,
        [day]: [...current[day], { title: `Treino de ${dayLabels[day] || day}`, exercises: [], duration: '', color: 'violet' }],
      }))
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
  }

  const openMealDay = (day) => {
    setSelectedMealDay(day)
    setActivePage('meal-detail')
  }

  const updateSelectedMealDay = (updatedMeals) => {
    if (!selectedMealDay) return
    setMeals((current) => ({ ...current, [selectedMealDay]: updatedMeals }))
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={currentUser} userCount={users.length} onLogout={() => { setCurrentUser(null); setActivePage('dashboard') }} />
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
          {!['workouts', 'workout-detail', 'meals', 'meal-detail'].includes(activePage) && <div className="page-heading"><div><span className="eyebrow">{activePage === 'dashboard' ? formatCurrentDate() : 'GESTÃO DA ACADEMIA'}</span><h1>{pageTitles[activePage][0]}</h1><p>{pageTitles[activePage][1]}</p></div></div>}
          {activePage === 'dashboard' && <Dashboard user={currentUser} users={users} onNavigate={setActivePage} />}
          {activePage === 'calendar' && <CalendarView />}
          {activePage === 'users' && <UsersView users={users} />}
          {activePage === 'workouts' && <><WorkoutsView workouts={workouts} setWorkouts={setWorkouts} dayLabels={dayLabels} setDayLabels={setDayLabels} onOpenWorkout={openWorkout} /><WorkoutStimulusPanel workouts={workouts} /></>}
          {activePage === 'workout-detail' && selectedWorkout && <WorkoutDetail workout={workouts[selectedWorkout.day]?.[selectedWorkout.index]} dayLabel={dayLabels[selectedWorkout.day]} onBack={() => { setSelectedWorkout(null); setActivePage('workouts') }} onUpdate={updateSelectedWorkout} />}
          {activePage === 'meals' && <MealsView meals={meals} onOpenDay={openMealDay} />}
          {activePage === 'meal-detail' && selectedMealDay && <MealDetail day={selectedMealDay} meals={meals[selectedMealDay]} onBack={() => { setSelectedMealDay(null); setActivePage('meals') }} onUpdate={updateSelectedMealDay} />}
          {activePage === 'settings' && <SettingsView user={currentUser} />}
        </div>
      </main>
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('Membro')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const name = getNameFromEmail(email)
    onLogin({ name, email, initials: getInitials(name), tone: getToneForRole(role), role })
  }

  return <div className="auth-screen"><div className="auth-art"><div className="auth-glow glow-one" /><div className="auth-glow glow-two" /><div className="auth-brand"><Logo /><span>GYMMAXXING</span></div><div className="auth-quote"><span className="quote-mark">“</span><h2>Seu próximo nível<br />começa aqui.</h2><p>Organize. Treine. Evolua.</p><div className="quote-line" /></div><div className="auth-art-footer"><span>PLATAFORMA DE GESTÃO FITNESS</span><span>v0.1 / {new Date().getFullYear()}</span></div></div><div className="auth-panel"><div className="auth-panel-inner"><div className="mobile-brand"><Logo /><span>GYMMAXXING</span></div><div className="auth-heading"><span className="eyebrow">BEM-VINDO DE VOLTA</span><h1>{mode === 'login' ? 'Acesse seu espaço.' : 'Crie seu espaço.'}</h1><p>{mode === 'login' ? 'Entre para acompanhar sua evolução.' : 'Comece sua jornada na GymMaxxing.'}</p></div><form onSubmit={submit}><label>E-mail<input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Senha<div className="password-field"><input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /><span>Mostrar</span></div></label>{mode === 'login' && <div className="forgot-row"><label className="checkbox-label"><input type="checkbox" /> <span>Lembrar de mim</span></label><button type="button" className="text-button">Esqueci minha senha</button></div>}<div className="role-picker"><span className="field-label">Entrar como</span><div className="role-options">{['Membro', 'Profissional', 'Administrador'].map((item) => <button type="button" className={`role-option ${role === item ? 'selected' : ''}`} key={item} onClick={() => setRole(item)}><span className="role-radio">{role === item && <i />}</span>{item}</button>)}</div></div><button className="auth-submit" type="submit">{mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'} {icons.arrow}</button></form><p className="switch-auth">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Criar conta' : 'Entrar'}</button></p><p className="demo-note">Os dados exibidos dependem da conta conectada.</p></div></div></div>
}

function Sidebar({ activePage, onNavigate, user, userCount, onLogout }) {
  const visibleNavItems = user.role === 'Membro' ? navItems.filter((item) => ['dashboard', 'calendar', 'workouts', 'meals'].includes(item.id)) : navItems.filter((item) => item.id !== 'meals')

  return <aside className="sidebar"><div className="brand"><Logo /><span>GYMMAXXING</span></div><div className="workspace-switcher"><div className="workspace-icon">G</div><div><strong>GymMaxxing</strong><span>Academia sem dados</span></div><span className="switcher-chevron">⌄</span></div><nav><span className="nav-label">MENU PRINCIPAL</span>{visibleNavItems.map((item) => <button key={item.id} className={`nav-item ${activePage === item.id || (item.id === 'workouts' && activePage === 'workout-detail') || (item.id === 'meals' && activePage === 'meal-detail') ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>{item.icon}<span>{item.label}</span>{item.id === 'users' && userCount > 0 && <em>{userCount}</em>}</button>)}<span className="nav-label nav-label-spaced">SUA CONTA</span><button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}>{icons.settings}<span>Configurações</span></button></nav><div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon">{icons.lightning}</div><strong>Eleve seu treino</strong><p>Desbloqueie mais possibilidades com o plano Pro.</p><button>Conhecer o Pro <span>↗</span></button></div><div className="sidebar-profile"><Avatar initials={user.initials} tone={user.tone} /><div><strong>{user.name}</strong><span>{user.role}</span></div><button className="logout-button" onClick={onLogout} aria-label="Sair">{icons.logout}</button></div></div></aside>
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
  return typeof exercise === 'string' ? { name: exercise, muscleGroup: 'outros' } : exercise
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

function MealDetail({ day, meals, onBack, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(mealDraftDefaults)
  const summary = getMealSummary(meals)
  const dayIndex = mealDayKeys.indexOf(day)
  const calendarDay = getWeekDays()[dayIndex]

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  const addMeal = (mealData) => {
    const name = mealData.name.trim() || mealData.foods?.map((food) => food.name).join(' + ')
    if (!name) return
    const nutrition = nutritionFields.reduce((values, field) => ({ ...values, [field]: Number(mealData[field]) || 0 }), {})
    onUpdate([...meals, { ...mealData, ...nutrition, name, foods: mealData.foods || [] }])
    setDraft(mealDraftDefaults)
    setShowForm(false)
  }

  const removeMeal = (index) => onUpdate(meals.filter((_, mealIndex) => mealIndex !== index))
  const metricCards = [
    { label: 'Calorias', value: summary.calories.toLocaleString('pt-BR'), unit: 'kcal', tone: 'purple' },
    { label: 'Proteína', value: summary.protein, unit: 'g', tone: 'blue' },
    { label: 'Gordura', value: summary.fat, unit: 'g', tone: 'orange' },
    { label: 'Carboidrato', value: summary.carbs, unit: 'g', tone: 'green' },
    { label: 'Fibras', value: summary.fiber, unit: 'g', tone: 'pink' },
    { label: 'Açúcares', value: summary.sugar, unit: 'g', tone: 'blue' },
    { label: 'Sódio', value: summary.sodium, unit: 'mg', tone: 'orange' },
  ]

  return <div className="meal-detail-layout"><section className="meal-macro-column"><button className="back-link" onClick={onBack}>← Voltar para semana</button><div className="detail-heading"><span className="eyebrow">{(day || 'REFEIÇÕES').toUpperCase()}</span><h1>Resumo nutricional</h1><p>Veja os macros planejados para todas as refeições deste dia.</p></div><section className="panel macro-overview-panel"><div className="macro-panel-heading"><div><span className="eyebrow">{calendarDay?.label} {calendarDay?.date}</span><h2>Macros do dia</h2></div><span className="macro-meal-count">{meals.length} {meals.length === 1 ? 'refeição' : 'refeições'}</span></div><div className="macro-total"><strong>{summary.calories.toLocaleString('pt-BR')}</strong><span>kcal planejadas</span></div><div className="macro-grid">{metricCards.map((metric) => <div className={`macro-card ${metric.tone}`} key={metric.label}><span>{metric.label}</span><strong>{metric.value}<small>{metric.unit}</small></strong><i><b style={{ width: `${Math.min(metric.label === 'Calorias' ? (summary.calories / 2400) * 100 : (Number(metric.value) / (metric.label === 'Proteína' ? 180 : 100)) * 100, 100)}%` }} /></i></div>)}</div>{!meals.length && <div className="macro-note">Seus totais aparecem aqui assim que você cadastrar uma refeição.</div>}</section></section><section className="detail-list-column"><div className="detail-heading detail-heading-right"><span className="eyebrow">{(day || 'REFEIÇÕES').toUpperCase()}</span><h1>Refeições do dia</h1><p>{meals.length} {meals.length === 1 ? 'refeição cadastrada' : 'refeições cadastradas'} · {calendarDay?.date} de {calendarDay?.month}</p></div><section className="panel meals-detail-panel"><div className="panel-heading"><div><h2>Lista de refeições</h2><p>Cadastre o que você vai comer e acompanhe os valores nutricionais.</p></div><button className="primary-button" onClick={() => setShowForm((current) => !current)}>{icons.plus} {showForm ? 'Fechar' : 'Nova refeição'}</button></div><div className="meal-detail-list">{meals.length ? meals.map((meal, index) => <div className="meal-detail-item" key={`${meal.name}-${index}`}><span className="meal-time">{meal.time || '--:--'}</span><span className="meal-type-icon">{icons.meals}</span><div><strong>{meal.name}</strong><small>{meal.calories || 0} kcal · {meal.protein || 0}g proteína · {meal.carbs || 0}g carboidrato</small></div><button className="remove-meal" onClick={() => removeMeal(index)} aria-label={`Remover ${meal.name}`}>×</button></div>) : <EmptyState compact title="Nenhuma refeição cadastrada" copy="Adicione o café da manhã, almoço ou outra refeição abaixo." />}</div>{showForm && <MealForm draft={draft} onChange={updateDraft} onSubmit={addMeal} onCancel={() => setShowForm(false)} />}</section></section></div>
}

function MealForm({ draft, onChange, onSubmit, onCancel }) {
  return <CatalogMealForm draft={draft} onChange={onChange} onSubmit={onSubmit} onCancel={onCancel} />
  return <form className="meal-form" onSubmit={onSubmit}><div className="meal-form-heading"><div><span className="eyebrow">NOVA REFEIÇÃO</span><h3>Adicionar ao dia</h3></div><button type="button" className="form-cancel" onClick={onCancel}>Cancelar</button></div><div className="meal-form-fields"><label className="meal-name-field"><span>Nome da refeição</span><input value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Ex.: almoço" autoFocus required /></label><label><span>Horário</span><input type="time" value={draft.time} onChange={(event) => onChange('time', event.target.value)} /></label><label><span>Calorias</span><input type="number" min="0" value={draft.calories} onChange={(event) => onChange('calories', event.target.value)} placeholder="0" /></label><label><span>Proteína (g)</span><input type="number" min="0" value={draft.protein} onChange={(event) => onChange('protein', event.target.value)} placeholder="0" /></label><label><span>Gordura (g)</span><input type="number" min="0" value={draft.fat} onChange={(event) => onChange('fat', event.target.value)} placeholder="0" /></label><label><span>Carboidrato (g)</span><input type="number" min="0" value={draft.carbs} onChange={(event) => onChange('carbs', event.target.value)} placeholder="0" /></label><label><span>Fibras (g)</span><input type="number" min="0" value={draft.fiber} onChange={(event) => onChange('fiber', event.target.value)} placeholder="0" /></label></div><button className="primary-button meal-form-submit" type="submit" disabled={!draft.name.trim()}>{icons.plus} Salvar refeição</button></form>
}

function CatalogMealForm({ draft, onChange, onSubmit, onCancel }) {
  const [mode, setMode] = useState('catalog')
  const [foodSearch, setFoodSearch] = useState('')
  const [foodCategory, setFoodCategory] = useState('Todos')
  const [selectedFood, setSelectedFood] = useState(null)
  const [foodAmount, setFoodAmount] = useState('')
  const [selectedFoods, setSelectedFoods] = useState([])
  const [showFoodResults, setShowFoodResults] = useState(false)

  const filteredFoods = useMemo(() => {
    const query = normalizeSearchText(foodSearch)
    return foodDatabase.filter((food) => {
      const matchesCategory = foodCategory === 'Todos' || food.category === foodCategory
      const searchableText = normalizeSearchText([food.name, food.category, food.tags].join(' '))
      return matchesCategory && (!query || searchableText.includes(query))
    })
  }, [foodCategory, foodSearch])

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
    <div className="meal-form-heading"><div><span className="eyebrow">NOVA REFEIÇÃO</span><h3>Monte sua refeição</h3></div><button type="button" className="form-cancel" onClick={onCancel}>Cancelar</button></div>
    <div className="meal-form-fields meal-basics-fields"><label className="meal-name-field"><span>Nome da refeição</span><input value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Ex.: almoço" /></label><label><span>Horário</span><input type="time" value={draft.time} onChange={(event) => onChange('time', event.target.value)} /></label></div>
    <div className="meal-mode-switch" role="tablist" aria-label="Forma de cadastrar refeição"><button type="button" className={mode === 'catalog' ? 'active' : ''} onClick={() => setMode('catalog')}>Pesquisar na base</button><button type="button" className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>Informar manualmente</button></div>
    {mode === 'catalog' ? <CatalogMealBuilder foodSearch={foodSearch} foodCategory={foodCategory} setFoodCategory={setFoodCategory} setFoodSearch={setFoodSearch} setSelectedFood={setSelectedFood} setShowFoodResults={setShowFoodResults} showFoodResults={showFoodResults} filteredFoods={filteredFoods} selectFood={selectFood} foodAmount={foodAmount} setFoodAmount={setFoodAmount} selectedFood={selectedFood} addFood={addFood} selectedFoods={selectedFoods} setSelectedFoods={setSelectedFoods} selectedNutrition={selectedNutrition} /> : <ManualMealFields draft={draft} onChange={onChange} />}
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

function CatalogMealBuilder({ foodSearch, foodCategory, setFoodCategory, setFoodSearch, setSelectedFood, setShowFoodResults, showFoodResults, filteredFoods, selectFood, foodAmount, setFoodAmount, selectedFood, addFood, selectedFoods, setSelectedFoods, selectedNutrition }) {
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

function WorkoutDetail({ workout, dayLabel, onBack, onUpdate }) {
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [exerciseGroup, setExerciseGroup] = useState('outros')
  const [exerciseGroupFilter, setExerciseGroupFilter] = useState('todos')
  const [selectedCatalogExercise, setSelectedCatalogExercise] = useState(null)
  const [showExerciseResults, setShowExerciseResults] = useState(false)

  const filteredCatalog = useMemo(() => {
    const query = normalizeSearchText(exerciseSearch)
    return exerciseCatalog.filter((exercise) => {
      const matchesGroup = exerciseGroupFilter === 'todos' || exercise.muscleGroup === exerciseGroupFilter
      const searchableText = normalizeSearchText([exercise.name, exercise.equipment, exercise.level, ...exercise.aliases].join(' '))
      return matchesGroup && (!query || searchableText.includes(query))
    })
  }, [exerciseGroupFilter, exerciseSearch])

  if (!workout) return <EmptyState title="Treino não encontrado" copy="Volte para a semana e escolha outro treino." />

  const exercises = workout.exercises.map(normalizeExercise)
  const activeGroups = new Set(exercises.map((exercise) => exercise.muscleGroup))

  const addExercise = () => {
    const value = exerciseSearch.trim()
    if (!value) return
    const catalogExercise = selectedCatalogExercise || exerciseCatalog.find((exercise) => normalizeSearchText(exercise.name) === normalizeSearchText(value))
    onUpdate({
      ...workout,
      exercises: [...workout.exercises, {
        id: catalogExercise?.id,
        name: catalogExercise?.name || value,
        muscleGroup: exerciseGroup,
        equipment: catalogExercise?.equipment,
        level: catalogExercise?.level,
      }],
    })
    setExerciseSearch('')
    setExerciseGroup('outros')
    setSelectedCatalogExercise(null)
    setShowExerciseResults(false)
  }

  const removeExercise = (index) => onUpdate({ ...workout, exercises: workout.exercises.filter((_, itemIndex) => itemIndex !== index) })

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

  return <div className="workout-detail-layout"><section className="panel detail-visual-panel"><button className="back-link" onClick={onBack}>← Voltar para semana</button><div className="detail-heading"><span className="eyebrow">{(dayLabel || 'TREINO').toUpperCase()}</span><h1>Mapa muscular</h1><p>As áreas coloridas representam os grupos trabalhados neste treino.</p></div><div className="silhouette-wrap"><MuscleSilhouette activeGroups={activeGroups} /></div><div className="muscle-legend">{muscleGroups.filter((group) => activeGroups.has(group.id)).map((group) => <span key={group.id}><i style={{ background: group.color }} />{group.label}</span>)}</div></section><section className="detail-list-column"><div className="detail-heading detail-heading-right"><span className="eyebrow">{(dayLabel || 'TREINO').toUpperCase()}</span><h1>{workout.title}</h1><p>{exercises.length} {exercises.length === 1 ? 'exercício cadastrado' : 'exercícios cadastrados'}</p></div><section className="panel exercise-detail-panel"><div className="detail-section-heading"><div><h2>Lista de exercícios</h2><p>Escolha na base com {exerciseCatalogSize} exercícios ou cadastre um movimento personalizado.</p></div></div><div className="detail-exercise-list">{exercises.length ? exercises.map((exercise, index) => <div className="detail-exercise-item" key={`${exercise.name}-${index}`}><span className="exercise-color" style={{ background: getMuscleColor(exercise.muscleGroup) }} /><div><strong>{exercise.name}</strong><small>{muscleGroups.find((group) => group.id === exercise.muscleGroup)?.label || 'Outro'}{exercise.equipment ? ` · ${exercise.equipment}` : ''}</small></div><button className="remove-exercise" onClick={() => removeExercise(index)} aria-label={`Remover ${exercise.name}`}>×</button></div>) : <EmptyState compact title="Nenhum exercício cadastrado" copy="Adicione o primeiro exercício abaixo." />}</div><div className="detail-add-form"><div className="exercise-picker"><div className="exercise-picker-top"><span>Exercício</span><select className="exercise-filter" value={exerciseGroupFilter} onChange={(event) => { setExerciseGroupFilter(event.target.value); setShowExerciseResults(true) }} aria-label="Filtrar catálogo por grupo muscular"><option value="todos">Todos os grupos</option>{muscleGroups.map((group) => <option value={group.id} key={group.id}>{group.label}</option>)}</select></div><div className="search-field exercise-picker-input"><span>{icons.search}</span><input value={exerciseSearch} onFocus={() => setShowExerciseResults(true)} onBlur={() => window.setTimeout(() => setShowExerciseResults(false), 140)} onChange={(event) => updateExerciseSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addExercise() } }} placeholder="Buscar exercício..." aria-label="Buscar exercício no catálogo" /></div>{showExerciseResults && <div className="exercise-results" role="listbox"><div className="exercise-results-meta">{filteredCatalog.length ? `${filteredCatalog.length} exercício${filteredCatalog.length === 1 ? '' : 's'} encontrado${filteredCatalog.length === 1 ? '' : 's'}` : 'Nenhum exercício encontrado'}</div>{filteredCatalog.slice(0, 10).map((exercise) => <button type="button" className={selectedCatalogExercise?.id === exercise.id ? 'selected' : ''} key={exercise.id} onMouseDown={(event) => event.preventDefault()} onClick={() => selectCatalogExercise(exercise)}><span>{selectedCatalogExercise?.id === exercise.id ? icons.check : icons.dumbbell}</span><strong>{exercise.name}</strong><small>{muscleGroups.find((group) => group.id === exercise.muscleGroup)?.label} · {exercise.equipment} · {exercise.level}</small></button>)}{filteredCatalog.length > 10 && <div className="exercise-results-more">Mostrando os 10 primeiros. Refine sua busca.</div>}{!filteredCatalog.length && <div className="exercise-results-empty">Você pode adicionar “{exerciseSearch}” como exercício personalizado.</div>}</div>}</div><label><span>Grupo muscular</span><select value={exerciseGroup} onChange={(event) => setExerciseGroup(event.target.value)}>{muscleGroups.map((group) => <option value={group.id} key={group.id}>{group.label}</option>)}</select></label><button className="primary-button" onClick={addExercise} disabled={!exerciseSearch.trim()}>{icons.plus} Adicionar</button></div></section></section></div>
}

function MuscleSilhouette({ activeGroups }) {
  const fillFor = (...groups) => groups.find((group) => activeGroups.has(group)) ? getMuscleColor(groups.find((group) => activeGroups.has(group))) : '#2b2735'

  return <svg className="muscle-silhouette" viewBox="0 0 300 520" role="img" aria-label="Silhueta muscular interativa"><circle className="silhouette-part" cx="150" cy="42" r="25" fill="#24202d" /><path className="silhouette-part" d="M136 65h28v22h-28z" fill="#24202d" /><path className="silhouette-part" d="M124 80c10-8 42-8 52 0l20 54-17 68h-58l-17-68z" fill={fillFor('peito', 'costas', 'abdômen')} /><path className="silhouette-part" d="M124 83c-14 1-24 8-31 20l-19 49 19 8 25-40z" fill={fillFor('ombros', 'braços')} /><path className="silhouette-part" d="M176 83c14 1 24 8 31 20l19 49-19 8-25-40z" fill={fillFor('ombros', 'braços')} /><path className="silhouette-part" d="M74 151l19 8-14 58-19 34-13-8 18-43z" fill={fillFor('braços')} /><path className="silhouette-part" d="M226 151l-19 8 14 58 19 34 13-8-18-43z" fill={fillFor('braços')} /><path className="silhouette-part" d="M53 243l13 8-7 20-13-8zM247 243l-13 8 7 20 13-8z" fill={fillFor('braços')} /><path className="silhouette-part" d="M124 201h52l-4 79-18 18h-8l-18-18z" fill={fillFor('abdômen')} /><path className="silhouette-part" d="M127 278l23 2 1 101-31 1-8-73z" fill={fillFor('pernas', 'glúteos')} /><path className="silhouette-part" d="M173 278l-23 2-1 101 31 1 8-73z" fill={fillFor('pernas', 'glúteos')} /><path className="silhouette-part" d="M116 382h35l-6 101-25 0-11-51z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M184 382h-35l6 101 25 0 11-51z" fill={fillFor('pernas')} /><path className="silhouette-part" d="M120 483h25l-4 14-38 0 3-8zM180 483h-25l4 14 38 0-3-8z" fill={fillFor('pernas')} /></svg>
}

function SettingsView({ user }) {
  return <div className="settings-layout"><section className="panel settings-panel"><div className="settings-profile"><Avatar initials={user.initials} tone={user.tone} large /><div><h2>{user.name}</h2><p>{user.email}</p><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></div><button className="outline-button">{icons.edit} Editar perfil</button></div><div className="settings-section"><span className="eyebrow">INFORMAÇÕES PESSOAIS</span><div className="settings-fields"><label>Nome completo<input value={user.name} readOnly /></label><label>E-mail<input value={user.email} readOnly /></label><label>Unidade<input value={user.organization || 'Unidade não informada'} readOnly /></label></div></div></section><section className="panel preference-panel"><div className="panel-heading"><div><h3>Preferências</h3><p>Personalize sua experiência.</p></div></div><EmptyState title="Preferências não configuradas" copy="Suas preferências aparecerão aqui quando forem carregadas." /></section></div>
}

function Avatar({ initials, tone = 'purple', small = false, large = false }) { return <span className={`avatar ${tone} ${small ? 'small' : ''} ${large ? 'large' : ''}`}>{initials}</span> }
function Logo() { return <span className="logo-mark"><span /><span /><span /></span> }

export default App
