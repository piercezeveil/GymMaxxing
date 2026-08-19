import { useMemo, useState } from 'react'

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
]

const initialUsers = [
  { name: 'Marina Costa', email: 'marina.costa@email.com', role: 'Membro', status: 'Ativo', initials: 'MC', tone: 'purple', joined: '12 ago 2024' },
  { name: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', role: 'Profissional', status: 'Ativo', initials: 'LF', tone: 'orange', joined: '09 ago 2024' },
  { name: 'Beatriz Almeida', email: 'bia.almeida@email.com', role: 'Membro', status: 'Ativo', initials: 'BA', tone: 'pink', joined: '08 ago 2024' },
  { name: 'Rafael Mendes', email: 'rafael.mendes@email.com', role: 'Administrador', status: 'Ativo', initials: 'RM', tone: 'blue', joined: '05 ago 2024' },
  { name: 'Sofia Martins', email: 'sofia.martins@email.com', role: 'Profissional', status: 'Pendente', initials: 'SM', tone: 'green', joined: '02 ago 2024' },
]

const exerciseCatalog = ['Supino reto', 'Agachamento livre', 'Puxada frontal', 'Leg press 45°', 'Desenvolvimento', 'Rosca direta', 'Cadeira extensora', 'Elevação lateral', 'Tríceps pulley', 'Stiff com barra']

const initialWorkouts = {
  Segunda: [{ title: 'Peito & Tríceps', exercises: ['Supino reto', 'Crucifixo inclinado', 'Tríceps pulley'], duration: '45 min', color: 'violet' }],
  Terça: [{ title: 'Costas & Bíceps', exercises: ['Puxada frontal', 'Remada baixa'], duration: '50 min', color: 'blue' }],
  Quarta: [],
  Quinta: [{ title: 'Pernas completo', exercises: ['Agachamento livre', 'Leg press 45°', 'Cadeira extensora'], duration: '60 min', color: 'orange' }],
  Sexta: [{ title: 'Ombros', exercises: ['Desenvolvimento', 'Elevação lateral'], duration: '40 min', color: 'pink' }],
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [users, setUsers] = useState(initialUsers)
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [showNotifications, setShowNotifications] = useState(false)

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />
  }

  const pageTitles = {
    dashboard: ['Visão geral', 'Acompanhe o que está acontecendo na sua academia.'],
    calendar: ['Horários', 'Organize as escalas e encontre o melhor horário para treinar.'],
    users: ['Usuários', 'Gerencie membros, profissionais e administradores.'],
    workouts: ['Meus treinos', 'Monte sua semana e mantenha o foco no seu objetivo.'],
    settings: ['Configurações', 'Ajuste seu perfil e as preferências da academia.'],
  }

  const handleCreateUser = (newUser) => setUsers((current) => [newUser, ...current])

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={currentUser} onLogout={() => setCurrentUser(null)} />
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>GymMaxxing</span><span className="breadcrumb-slash">/</span><strong>{pageTitles[activePage][0]}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button notification-button" aria-label="Notificações" onClick={() => setShowNotifications(!showNotifications)}>{icons.bell}<i /></button>
            <div className="topbar-divider" />
            <button className="profile-mini" onClick={() => setActivePage('settings')}><Avatar initials={currentUser.initials} tone={currentUser.tone} small /><span><strong>{currentUser.name}</strong><small>{currentUser.role}</small></span>{icons.chevron}</button>
          </div>
          {showNotifications && <div className="notification-popover"><strong>Notificações</strong><p><span className="dot purple-dot" />Seu treino de quarta está incompleto.</p><p><span className="dot green-dot" />Nova escala disponível para você.</p></div>}
        </header>

        <div className="page-wrap">
          {activePage !== 'workouts' && <div className="page-heading"><div><span className="eyebrow">{activePage === 'dashboard' ? 'SEGUNDA-FEIRA, 19 DE AGOSTO' : 'GESTÃO DA ACADEMIA'}</span><h1>{pageTitles[activePage][0]}</h1><p>{pageTitles[activePage][1]}</p></div>{activePage === 'users' && <button className="primary-button" onClick={() => handleCreateUser({ name: 'Novo membro', email: 'novo@email.com', role: 'Membro', status: 'Ativo', initials: 'NM', tone: 'purple', joined: 'agora' })}>{icons.plus} Adicionar usuário</button>}</div>}
          {activePage === 'dashboard' && <Dashboard user={currentUser} onNavigate={setActivePage} />}
          {activePage === 'calendar' && <CalendarView />}
          {activePage === 'users' && <UsersView users={users} />}
          {activePage === 'workouts' && <WorkoutsView workouts={workouts} setWorkouts={setWorkouts} />}
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
    const roleData = { Administrador: { initials: 'RA', tone: 'blue', name: 'Rafael Almeida' }, Membro: { initials: 'MC', tone: 'purple', name: 'Marina Costa' }, Profissional: { initials: 'LF', tone: 'orange', name: 'Lucas Ferreira' } }[role]
    onLogin({ ...roleData, email: email || 'marina.costa@email.com', role })
  }

  return <div className="auth-screen"><div className="auth-art"><div className="auth-glow glow-one" /><div className="auth-glow glow-two" /><div className="auth-brand"><Logo /><span>GYMMAXXING</span></div><div className="auth-quote"><span className="quote-mark">“</span><h2>Seu próximo nível<br />começa aqui.</h2><p>Organize. Treine. Evolua.</p><div className="quote-line" /></div><div className="auth-art-footer"><span>PLATAFORMA DE GESTÃO FITNESS</span><span>v0.1 / 2024</span></div></div><div className="auth-panel"><div className="auth-panel-inner"><div className="mobile-brand"><Logo /><span>GYMMAXXING</span></div><div className="auth-heading"><span className="eyebrow">BEM-VINDO DE VOLTA</span><h1>{mode === 'login' ? 'Acesse seu espaço.' : 'Crie seu espaço.'}</h1><p>{mode === 'login' ? 'Entre para acompanhar sua evolução.' : 'Comece sua jornada na GymMaxxing.'}</p></div><form onSubmit={submit}><label>E-mail<input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Senha<div className="password-field"><input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /><span>Mostrar</span></div></label>{mode === 'login' && <div className="forgot-row"><label className="checkbox-label"><input type="checkbox" /> <span>Lembrar de mim</span></label><button type="button" className="text-button">Esqueci minha senha</button></div>}<div className="role-picker"><span className="field-label">Entrar como</span><div className="role-options">{['Membro', 'Profissional', 'Administrador'].map((item) => <button type="button" className={`role-option ${role === item ? 'selected' : ''}`} key={item} onClick={() => setRole(item)}><span className="role-radio">{role === item && <i />}</span>{item}</button>)}</div></div><button className="auth-submit" type="submit">{mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'} {icons.arrow}</button></form><p className="switch-auth">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Criar conta' : 'Entrar'}</button></p><p className="demo-note">Use qualquer e-mail e senha para explorar o protótipo.</p></div></div></div>
}

function Sidebar({ activePage, onNavigate, user, onLogout }) {
  return <aside className="sidebar"><div className="brand"><Logo /><span>GYMMAXXING</span></div><div className="workspace-switcher"><div className="workspace-icon">G</div><div><strong>GymMaxxing</strong><span>Unidade Centro</span></div><span className="switcher-chevron">⌄</span></div><nav><span className="nav-label">MENU PRINCIPAL</span>{navItems.map((item) => <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>{item.icon}<span>{item.label}</span>{item.id === 'users' && <em>24</em>}</button>)}<span className="nav-label nav-label-spaced">SUA CONTA</span><button className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => onNavigate('settings')}>{icons.settings}<span>Configurações</span></button></nav><div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon">{icons.lightning}</div><strong>Eleve seu treino</strong><p>Desbloqueie mais possibilidades com o plano Pro.</p><button>Conhecer o Pro <span>↗</span></button></div><div className="sidebar-profile"><Avatar initials={user.initials} tone={user.tone} /><div><strong>{user.name}</strong><span>{user.role}</span></div><button className="logout-button" onClick={onLogout} aria-label="Sair">{icons.logout}</button></div></div></aside>
}

function Dashboard({ user, onNavigate }) {
  return <div className="dashboard-grid"><section className="welcome-card"><div><span className="eyebrow">SEU RESUMO DE HOJE</span><h2>Bom dia, {user.name.split(' ')[0]} <span className="wave">✦</span></h2><p>Mais um dia para construir a sua melhor versão.</p></div><div className="welcome-sparkline"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="welcome-stat"><strong>76%</strong><span>consistência este mês</span></div></section><section className="stat-card"><div className="stat-top"><span className="stat-icon purple-bg">{icons.chart}</span><span className="trend up">+12,4% <small>↗</small></span></div><span className="stat-label">MEMBROS ATIVOS</span><strong className="stat-number">248</strong><span className="stat-foot">vs. mês anterior</span></section><section className="stat-card"><div className="stat-top"><span className="stat-icon orange-bg">{icons.clock}</span><span className="trend up">+8,2% <small>↗</small></span></div><span className="stat-label">TREINOS REALIZADOS</span><strong className="stat-number">1.284</strong><span className="stat-foot">este mês</span></section><section className="stat-card"><div className="stat-top"><span className="stat-icon green-bg">{icons.users}</span><span className="trend neutral">estável</span></div><span className="stat-label">PROFISSIONAIS</span><strong className="stat-number">18</strong><span className="stat-foot">na sua unidade</span></section><section className="panel activity-panel"><div className="panel-heading"><div><h3>Atividade da academia</h3><p>Visão geral dos últimos 7 dias</p></div><button className="select-button">Esta semana <span>⌄</span></button></div><div className="chart-area"><div className="chart-y"><span>400</span><span>300</span><span>200</span><span>100</span><span>0</span></div><div className="chart-plot"><div className="grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 680 210" preserveAspectRatio="none" className="area-chart"><defs><linearGradient id="fillPurple" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#9b67ff" stopOpacity=".26" /><stop offset="100%" stopColor="#9b67ff" stopOpacity="0" /></linearGradient></defs><path d="M0 163 C35 150 53 170 84 145 S135 125 165 141 S210 98 245 118 S288 83 326 106 S368 85 402 100 S445 53 483 81 S525 65 560 73 S614 28 680 40 L680 210 L0 210Z" fill="url(#fillPurple)" /><path d="M0 163 C35 150 53 170 84 145 S135 125 165 141 S210 98 245 118 S288 83 326 106 S368 85 402 100 S445 53 483 81 S525 65 560 73 S614 28 680 40" fill="none" stroke="#9b67ff" strokeWidth="3" /><circle cx="614" cy="30" r="4" fill="#0d0d12" stroke="#bd98ff" strokeWidth="3" /></svg><div className="chart-x"><span>13 ago</span><span>14 ago</span><span>15 ago</span><span>16 ago</span><span>17 ago</span><span>18 ago</span><span>19 ago</span></div></div></div></section><section className="panel schedule-panel"><div className="panel-heading"><div><h3>Próximos horários</h3><p>Hoje, 19 de agosto</p></div><button className="link-button" onClick={() => onNavigate('calendar')}>Ver agenda {icons.arrow}</button></div><div className="schedule-list"><ScheduleItem time="07:00" name="Amanda Ribeiro" specialty="Personal trainer" color="orange" /><ScheduleItem time="09:30" name="Lucas Ferreira" specialty="Musculação" color="blue" /><ScheduleItem time="18:00" name="Camila Duarte" specialty="Funcional" color="purple" /></div><button className="schedule-add" onClick={() => onNavigate('calendar')}>{icons.plus} Adicionar horário</button></section><section className="panel quick-panel"><div className="panel-heading"><div><h3>Ações rápidas</h3><p>Atalhos para o seu dia</p></div></div><div className="quick-actions"><button onClick={() => onNavigate('workouts')}><span className="quick-icon purple-bg">{icons.dumbbell}</span><span><strong>Montar treino</strong><small>Organize sua semana</small></span>{icons.chevron}</button><button onClick={() => onNavigate('users')}><span className="quick-icon orange-bg">{icons.users}</span><span><strong>Convidar usuário</strong><small>Adicione à sua equipe</small></span>{icons.chevron}</button><button onClick={() => onNavigate('calendar')}><span className="quick-icon blue-bg">{icons.calendar}</span><span><strong>Ver horários</strong><small>Confira a agenda</small></span>{icons.chevron}</button></div></section></div>
}

function ScheduleItem({ time, name, specialty, color }) {
  return <div className="schedule-item"><span className="schedule-time">{time}</span><span className={`schedule-avatar ${color}`}>{name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="schedule-person"><strong>{name}</strong><small>{specialty}</small></span><span className="schedule-status">Disponível</span>{icons.more}</div>
}

function CalendarView() {
  const days = ['SEG 19', 'TER 20', 'QUA 21', 'QUI 22', 'SEX 23', 'SÁB 24', 'DOM 25']
  const shifts = [{ day: 0, start: 1, length: 3, title: 'Amanda Ribeiro', type: 'Personal trainer', color: 'orange' }, { day: 0, start: 5, length: 2, title: 'Lucas Ferreira', type: 'Musculação', color: 'blue' }, { day: 1, start: 2, length: 3, title: 'Camila Duarte', type: 'Funcional', color: 'purple' }, { day: 2, start: 0, length: 4, title: 'Lucas Ferreira', type: 'Musculação', color: 'blue' }, { day: 3, start: 4, length: 3, title: 'Amanda Ribeiro', type: 'Personal trainer', color: 'orange' }, { day: 4, start: 1, length: 3, title: 'Diego Santos', type: 'Cross training', color: 'green' }, { day: 5, start: 3, length: 2, title: 'Camila Duarte', type: 'Funcional', color: 'purple' }]
  return <div className="calendar-layout"><div className="calendar-toolbar"><div className="calendar-month"><button className="round-arrow">‹</button><strong>Agosto 2024</strong><button className="round-arrow">›</button></div><div className="calendar-actions"><button className="outline-button">Hoje</button><button className="primary-button">{icons.plus} Novo horário</button></div></div><section className="panel calendar-panel"><div className="calendar-grid"><div className="time-column"><span>GMT-3</span>{['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((hour) => <span key={hour}>{hour}</span>)}</div>{days.map((day, dayIndex) => <div className={`calendar-day ${dayIndex === 0 ? 'today' : ''}`} key={day}><div className="day-heading">{day.split(' ')[0]} <strong>{day.split(' ')[1]}</strong></div><div className="day-slots">{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}{shifts.filter((shift) => shift.day === dayIndex).map((shift) => <div key={`${shift.day}-${shift.start}`} className={`shift-card ${shift.color}`} style={{ top: `${shift.start * 50 + 5}px`, height: `${shift.length * 50 - 8}px` }}><strong>{shift.title}</strong><small>{shift.type}</small></div>)}</div></div>)}</div></section><div className="calendar-legend"><span><i className="legend-dot orange" />Personal</span><span><i className="legend-dot blue" />Musculação</span><span><i className="legend-dot purple" />Funcional</span><span><i className="legend-dot green" />Cross training</span></div></div>
}

function UsersView({ users }) {
  const [query, setQuery] = useState('')
  const filtered = users.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="users-layout"><section className="panel users-panel"><div className="users-toolbar"><div className="search-field">{icons.search}<input placeholder="Pesquisar usuários..." value={query} onChange={(e) => setQuery(e.target.value)} /></div><button className="outline-button filter-button">{icons.filter} Filtros</button><button className="outline-button">Todos os cargos⌄</button></div><div className="table-meta"><span>24 usuários cadastrados</span><span>Última atualização: há 2 min</span></div><div className="table-wrap"><table><thead><tr><th>USUÁRIO</th><th>CARGO</th><th>STATUS</th><th>ENTROU EM</th><th /></tr></thead><tbody>{filtered.map((user) => <tr key={user.email}><td><div className="user-cell"><Avatar initials={user.initials} tone={user.tone} /><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td><td><span className={`status-badge ${user.status.toLowerCase()}`}><i />{user.status}</span></td><td className="date-cell">{user.joined}</td><td><button className="table-more">{icons.more}</button></td></tr>)}</tbody></table></div><div className="table-footer"><span>Mostrando {filtered.length} de 24 usuários</span><div><button className="pagination active">1</button><button className="pagination">2</button><button className="pagination">3</button><button className="pagination">›</button></div></div></section><aside className="panel user-summary"><div className="summary-head"><span className="summary-icon">{icons.users}</span><span className="summary-trend">+6 este mês</span></div><span className="stat-label">TOTAL DE USUÁRIOS</span><strong className="summary-number">248</strong><div className="role-bars"><div><span><i className="bar-purple" />Membros <b>198</b></span><div className="bar-track"><i className="bar-purple" style={{ width: '80%' }} /></div></div><div><span><i className="bar-orange" />Profissionais <b>18</b></span><div className="bar-track"><i className="bar-orange" style={{ width: '22%' }} /></div></div><div><span><i className="bar-blue" />Administradores <b>4</b></span><div className="bar-track"><i className="bar-blue" style={{ width: '9%' }} /></div></div></div><button className="summary-link">Ver relatório completo {icons.arrow}</button></aside></div>
}

function WorkoutsView({ workouts, setWorkouts }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [search, setSearch] = useState('')
  const days = Object.keys(workouts)
  const addExercise = (day, exercise) => {
    if (!exercise) return
    setWorkouts((current) => ({ ...current, [day]: current[day].length ? [{ ...current[day][0], exercises: [...current[day][0].exercises, exercise] }] : [{ title: day, exercises: [exercise], duration: '35 min', color: 'violet' }] }))
    setSearch('')
  }
  return <div className="workouts-layout"><div className="workouts-head"><div><span className="eyebrow">PLANEJAMENTO SEMANAL</span><h1>Meus treinos <span className="title-accent">/ semana</span></h1><p>Uma semana consistente começa com um plano claro.</p></div><div className="workout-head-actions"><div className="week-switch"><button>‹</button><strong>19 — 25 AGO, 2024</strong><button>›</button></div><button className="primary-button">{icons.plus} Novo treino</button></div></div><div className="workout-progress panel"><div className="progress-copy"><span className="progress-icon">{icons.lightning}</span><span><strong>Você está no ritmo</strong><small>Complete 4 de 5 treinos para manter sua sequência.</small></span></div><div className="progress-track"><i style={{ width: '78%' }} /></div><strong className="progress-percent">78%</strong></div><div className="kanban-board">{days.map((day) => <div className="kanban-column" key={day}><div className="kanban-heading"><span>{day}</span><b>{workouts[day].length}</b></div><div className="kanban-cards">{workouts[day].map((workout, i) => <div className={`workout-card ${workout.color}`} key={`${workout.title}-${i}`}><div className="card-top"><span className="workout-tag">{workout.exercises.length} exercícios</span><button>{icons.more}</button></div><h3>{workout.title}</h3><div className="exercise-list">{workout.exercises.slice(0, 3).map((exercise) => <span key={exercise}>{exercise}</span>)}{workout.exercises.length > 3 && <span className="more-exercises">+{workout.exercises.length - 3} exercícios</span>}</div><div className="workout-card-footer"><span>{icons.clock} {workout.duration}</span><button>{icons.edit}</button></div></div>)}<button className="add-workout" onClick={() => setSelectedDay(day)}>{icons.plus} Adicionar treino</button></div></div>)}</div>{selectedDay && <div className="modal-backdrop" onClick={() => setSelectedDay(null)}><div className="exercise-modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">{selectedDay.toUpperCase()}</span><h2>Adicionar exercício</h2></div><button className="modal-close" onClick={() => setSelectedDay(null)}>×</button></div><p>Pesquise um exercício do catálogo para adicionar ao treino do dia.</p><div className="search-field modal-search">{icons.search}<input autoFocus placeholder="Buscar exercício..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="exercise-results">{exerciseCatalog.filter((exercise) => exercise.toLowerCase().includes(search.toLowerCase())).slice(0, 6).map((exercise) => <button key={exercise} onClick={() => { addExercise(selectedDay, exercise); setSelectedDay(null) }}><span>{icons.plus}</span>{exercise}</button>)}</div></div></div>}</div>
}

function SettingsView({ user }) {
  return <div className="settings-layout"><section className="panel settings-panel"><div className="settings-profile"><Avatar initials={user.initials} tone={user.tone} large /><div><h2>{user.name}</h2><p>{user.email}</p><span className="role-badge membro">{user.role}</span></div><button className="outline-button">{icons.edit} Editar perfil</button></div><div className="settings-section"><span className="eyebrow">INFORMAÇÕES PESSOAIS</span><div className="settings-fields"><label>Nome completo<input value={user.name} readOnly /></label><label>E-mail<input value={user.email} readOnly /></label><label>Unidade<input value="GymMaxxing — Unidade Centro" readOnly /></label></div></div></section><section className="panel preference-panel"><div className="panel-heading"><div><h3>Preferências</h3><p>Personalize sua experiência.</p></div></div><div className="preference-row"><span><strong>Notificações de treino</strong><small>Receber lembretes dos próximos horários</small></span><button className="toggle on"><i /></button></div><div className="preference-row"><span><strong>Resumo semanal</strong><small>Receber evolução toda segunda-feira</small></span><button className="toggle on"><i /></button></div><div className="preference-row"><span><strong>Modo compacto</strong><small>Exibir mais informações na tela</small></span><button className="toggle"><i /></button></div></section></div>
}

function Avatar({ initials, tone = 'purple', small = false, large = false }) { return <span className={`avatar ${tone} ${small ? 'small' : ''} ${large ? 'large' : ''}`}>{initials}</span> }
function Logo() { return <span className="logo-mark"><span /><span /><span /></span> }

export default App
