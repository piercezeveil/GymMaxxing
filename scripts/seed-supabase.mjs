import { exerciseCatalog } from '../src/data/exercises.js'
import { foodDatabase } from '../src/foodDatabase.js'

const projectId = 'jmdhhuknenkxvdyuxdgf'
const endpoint = 'https://mcp.supabase.com/mcp'
const token = process.env.SUPERDOOR_SUPABASE_MCP_TOKEN

if (!token) throw new Error('SUPERDOOR_SUPABASE_MCP_TOKEN não está disponível.')

const baseHeaders = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/json, text/event-stream',
  'Content-Type': 'application/json',
}

async function request(body, sessionId) {
  const headers = sessionId ? { ...baseHeaders, 'Mcp-Session-Id': sessionId } : baseHeaders
  const response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
  const text = await response.text()
  if (!response.ok) throw new Error(`${response.status}: ${text}`)
  return { payload: text ? JSON.parse(text) : null, sessionId: response.headers.get('mcp-session-id') || sessionId }
}

const initialized = await request({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'gymmaxxing-seed', version: '1.0' },
  },
})

let sessionId = initialized.sessionId
await request({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }, sessionId)

async function executeSql(query, id) {
  const result = await request({
    jsonrpc: '2.0',
    id,
    method: 'tools/call',
    params: { name: 'execute_sql', arguments: { project_id: projectId, query } },
  }, sessionId)
  sessionId = result.sessionId
  const content = result.payload?.result?.content?.[0]?.text || ''
  const parsed = content ? JSON.parse(content) : result.payload
  if (result.payload?.result?.isError || parsed?.error) throw new Error(JSON.stringify(parsed))
}

const exerciseRows = exerciseCatalog.map(({ id, name, muscleGroup, equipment, level, aliases }) => ({
  id,
  name,
  muscle_group: muscleGroup,
  equipment,
  level,
  aliases,
}))

const foodRows = foodDatabase.map(({ id, name, category, defaultPortion, calories, protein, carbs, fat, fiber, sugar, sodium, tags }) => ({
  id,
  name,
  category,
  default_portion: defaultPortion,
  calories,
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium,
  tags,
}))

let requestId = 10
for (let index = 0; index < exerciseRows.length; index += 60) {
  const rows = exerciseRows.slice(index, index + 60)
  const query = `with rows as (
    select * from jsonb_to_recordset($gym$${JSON.stringify(rows)}$gym$::jsonb)
      as x(id text, name text, muscle_group text, equipment text, level text, aliases jsonb)
  )
  insert into public.gym_exercises (id, name, muscle_group, equipment, level, aliases, is_system)
  select r.id, r.name, r.muscle_group, r.equipment, r.level,
    coalesce((select array_agg(value) from jsonb_array_elements_text(r.aliases)), array[]::text[]), true
  from rows r
  on conflict (id) do update set
    name = excluded.name,
    muscle_group = excluded.muscle_group,
    equipment = excluded.equipment,
    level = excluded.level,
    aliases = excluded.aliases,
    is_system = true,
    created_by = null;`
  await executeSql(query, requestId++)
  console.log(`Exercícios: ${Math.min(index + rows.length, exerciseRows.length)}/${exerciseRows.length}`)
}

for (let index = 0; index < foodRows.length; index += 40) {
  const rows = foodRows.slice(index, index + 40)
  const query = `with rows as (
    select * from jsonb_to_recordset($gym$${JSON.stringify(rows)}$gym$::jsonb)
      as x(id text, name text, category text, default_portion integer, calories numeric,
        protein numeric, carbs numeric, fat numeric, fiber numeric, sugar numeric, sodium numeric, tags text)
  )
  insert into public.gym_foods (id, name, category, default_portion, calories, protein, carbs, fat, fiber, sugar, sodium, tags, is_system)
  select id, name, category, default_portion, calories, protein, carbs, fat, fiber, sugar, sodium, tags, true
  from rows
  on conflict (id) do update set
    name = excluded.name,
    category = excluded.category,
    default_portion = excluded.default_portion,
    calories = excluded.calories,
    protein = excluded.protein,
    carbs = excluded.carbs,
    fat = excluded.fat,
    fiber = excluded.fiber,
    sugar = excluded.sugar,
    sodium = excluded.sodium,
    tags = excluded.tags,
    is_system = true,
    created_by = null;`
  await executeSql(query, requestId++)
  console.log(`Alimentos: ${Math.min(index + rows.length, foodRows.length)}/${foodRows.length}`)
}
