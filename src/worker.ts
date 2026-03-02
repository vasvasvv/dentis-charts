import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/utils/jwt/jwt'

// ─── Хешування паролів ───────────────────────────────────────────────────────
//
// СТАРА схема: simpleHash (небезпечна, тільки для міграції)
// НОВА схема:  SHA-256 + сіль через Web Crypto API (вбудований у Workers)
//
// При логіні: якщо пароль збігається зі старим хешем — автоматично
// перехешовується новим способом і зберігається в БД (міграція прозора)
// ─────────────────────────────────────────────────────────────────────────────

const HASH_SALT = "dentis-clinic-salt-2024"

// Стара функція — тільки для перевірки під час міграції
function legacyHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash.toString()
}

// Нова безпечна функція — SHA-256 через Web Crypto
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + HASH_SALT)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}

// Перевірка пароля з підтримкою обох схем
async function verifyPassword(
  password: string,
  storedHash: string,
  userId: number,
  db: D1Database
): Promise<boolean> {
  // Спочатку перевіряємо новим способом (SHA-256, 64 символи hex)
  if (storedHash.length === 64) {
    const newHash = await hashPassword(password)
    return newHash === storedHash
  }

  // Якщо хеш старий (коротке число) — перевіряємо legacyHash
  if (legacyHash(password) === storedHash) {
    // ✅ Пароль вірний — мігруємо на новий хеш прозоро
    const newHash = await hashPassword(password)
    await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .bind(newHash, userId)
      .run()
    console.log(`Migrated password hash for user ${userId}`)
    return true
  }

  return false
}

// ─── Матриця прав ─────────────────────────────────────────────────────────────
//
//  Роль        | читання | додавання | редагування | видалення
//  ------------|---------|-----------|-------------|----------
//  superadmin  |   ✅   |    ✅    |     ✅     |    ✅
//  doctor      |   ✅   |    ✅    |     ✅     |    ✅
//  admin       |   ✅   |    ✅    |     ✅     |    ❌
//
// ─────────────────────────────────────────────────────────────────────────────

const CAN_READ   = ['superadmin', 'doctor', 'admin']
const CAN_CREATE = ['superadmin', 'doctor', 'admin']
const CAN_UPDATE = ['superadmin', 'doctor', 'admin']
const CAN_DELETE = ['superadmin', 'doctor']

function hasRole(role: string, allowed: string[]): boolean {
  return allowed.includes(role)
}

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type Variables = {
  user: { id: number; email: string; role: string; exp: number }
}

type HistoryLogRow = {
  id: number
  entity_type: 'patient' | 'tooth' | 'visit'
  action: 'create' | 'update' | 'delete'
  changes: string | null
  changed_by: number
  changed_at: string
  userName: string | null
}

function mapHistoryAction(action: 'create' | 'update' | 'delete'): 'create' | 'edit' | 'delete' {
  return action === 'update' ? 'edit' : action
}

function buildHistoryDetails(log: HistoryLogRow): string {
  if (log.changes) {
    try {
      const parsed = JSON.parse(log.changes)
      if (typeof parsed?.details === 'string' && parsed.details.trim().length > 0) {
        return parsed.details
      }
    } catch {
      // ignore invalid JSON and fall back to generic text
    }
  }

  const targetLabel = log.entity_type === 'patient' ? 'Пацієнт' : log.entity_type === 'tooth' ? 'Зубна карта' : 'Візит'
  const actionLabel = log.action === 'create' ? 'створено' : log.action === 'update' ? 'оновлено' : 'видалено'
  return `${targetLabel}: ${actionLabel}`
}

async function getPatientHistory(db: D1Database, patientId: number | string) {
  const { results } = await db.prepare(
    `SELECT h.id, h.entity_type, h.action, h.changes, h.changed_by, h.changed_at, u.fullName as userName
     FROM history_logs h
     LEFT JOIN users u ON u.id = h.changed_by
     LEFT JOIN tooth_data td ON h.entity_type = 'tooth' AND td.id = h.entity_id
     LEFT JOIN visits v ON h.entity_type = 'visit' AND v.id = h.entity_id
     WHERE (h.entity_type = 'patient' AND h.entity_id = ?)
        OR (h.entity_type = 'tooth' AND td.patient_id = ?)
        OR (h.entity_type = 'visit' AND v.patient_id = ?)
     ORDER BY h.changed_at DESC`
  ).bind(patientId, patientId, patientId).all<HistoryLogRow>()

  return (results || []).map((log) => ({
    id: log.id.toString(),
    timestamp: new Date(log.changed_at).toISOString(),
    userId: log.changed_by?.toString() || '',
    userName: log.userName || 'Невідомий',
    action: mapHistoryAction(log.action),
    target: log.entity_type,
    details: buildHistoryDetails(log),
  }))
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use(
  '*',
  cors({
    origin: [
      'https://dentis-charts.pages.dev',
      'https://dentis-clinic.pp.ua',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// ─── Middleware: перевірка JWT ────────────────────────────────────────────────

const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)

  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    c.set('user', payload)
    await next()
  } catch (err: any) {
    return c.json({ error: 'Invalid token', details: err.message }, 401)
  }
}

// ─── Middleware: перевірка ролі ───────────────────────────────────────────────

const requireRole = (allowed: string[]) => async (c: any, next: any) => {
  const user = c.get('user')
  if (!user || !hasRole(user.role, allowed)) {
    return c.json({
      error: 'Forbidden',
      message: `Доступ заборонено. Ваша роль (${user?.role}) не має права виконувати цю дію.`,
    }, 403)
  }
  await next()
}

app.get('/', (c) => c.text('Dentis API is running'))

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    const user = await c.env.DB.prepare(
      'SELECT users.*, roles.name as roleName FROM users JOIN roles ON users.role_id = roles.id WHERE email = ?'
    ).bind(email).first()

    if (!user) return c.json({ error: 'Invalid credentials' }, 401)

    // Перевірка з автоматичною міграцією старого хешу на новий
    const isValid = await verifyPassword(password, user.password_hash as string, user.id as number, c.env.DB)
    if (!isValid) return c.json({ error: 'Invalid credentials' }, 401)

    const payload = {
      id: user.id,
      email: user.email,
      role: user.roleName,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }
    const token = await sign(payload, c.env.JWT_SECRET)

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.roleName,
        fullName: user.fullName,
        permissions: {
          canCreate: hasRole(user.roleName as string, CAN_CREATE),
          canUpdate: hasRole(user.roleName as string, CAN_UPDATE),
          canDelete: hasRole(user.roleName as string, CAN_DELETE),
        },
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal Server Error', details: error.message }, 500)
  }
})

app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, fullName, roleId } = await c.req.json()

    const existingUser = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email).first()
    if (existingUser) return c.json({ error: 'User with this email already exists' }, 409)

    // Новий користувач одразу отримує безпечний хеш
    const hashedPassword = await hashPassword(password)
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, fullName, role_id) VALUES (?, ?, ?, ?) RETURNING id, email, fullName, role_id'
    ).bind(email, hashedPassword, fullName, roleId).first()

    return c.json({ message: 'User registered successfully', user: result })
  } catch (error: any) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal Server Error', details: error.message }, 500)
  }
})

// ─── PATIENTS ────────────────────────────────────────────────────────────────

app.get('/api/patients', authMiddleware, requireRole(CAN_READ), async (c) => {
  try {
    const { results: patients } = await c.env.DB.prepare('SELECT * FROM patients').all()

    const patientsWithDetails = await Promise.all(
      (patients || []).map(async (patient: any) => {
        const { results: visits } = await c.env.DB.prepare(
          'SELECT v.*, u.fullName as doctorName FROM visits v LEFT JOIN users u ON v.doctor_id = u.id WHERE v.patient_id = ? ORDER BY v.visitDate DESC'
        ).bind(patient.id).all()

        const { results: teethData } = await c.env.DB.prepare(
          'SELECT * FROM tooth_data WHERE patient_id = ?'
        ).bind(patient.id).all()

        const changeHistory = await getPatientHistory(c.env.DB, patient.id)

        return {
          ...patient,
          visits: visits || [],
          dentalChart: (teethData || []).map((t: any) => ({
            toothNumber: t.tooth_number,
            status: t.status,
            notes: t.notes,
            updatedAt: t.updated_at,
          })),
          changeHistory,
        }
      })
    )

    return c.json(patientsWithDetails)
  } catch (error: any) {
    return c.json({ error: 'Database error', details: error.message }, 500)
  }
})

app.get('/api/patients/:id', authMiddleware, requireRole(CAN_READ), async (c) => {
  try {
    const patientId = c.req.param('id')
    const patient = await c.env.DB.prepare('SELECT * FROM patients WHERE id = ?')
      .bind(patientId).first()
    if (!patient) return c.json({ error: 'Patient not found' }, 404)

    const { results: visits } = await c.env.DB.prepare(
      'SELECT v.*, u.fullName as doctorName FROM visits v LEFT JOIN users u ON v.doctor_id = u.id WHERE v.patient_id = ? ORDER BY v.visitDate DESC'
    ).bind(patientId).all()

    const { results: teethData } = await c.env.DB.prepare(
      'SELECT * FROM tooth_data WHERE patient_id = ?'
    ).bind(patientId).all()

    const changeHistory = await getPatientHistory(c.env.DB, patientId)

    return c.json({
      ...patient,
      visits: visits || [],
      dentalChart: (teethData || []).map((t: any) => ({
        toothNumber: t.tooth_number,
        status: t.status,
        notes: t.notes,
        updatedAt: t.updated_at,
      })),
      changeHistory,
    })
  } catch (error: any) {
    return c.json({ error: 'Database error', details: error.message }, 500)
  }
})

app.post('/api/patients', authMiddleware, requireRole(CAN_CREATE), async (c) => {
  const user = c.get('user')
  const data = await c.req.json()
  const { firstName, lastName, middleName, gender, dateOfBirth, phone, email, address, notes, doctorId } = data

  const result = await c.env.DB.prepare(
    'INSERT INTO patients (firstName, lastName, middleName, gender, dateOfBirth, phone, email, address, notes, doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(firstName, lastName, middleName || null, gender || null, dateOfBirth, phone, email, address, notes, doctorId).first()

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  ).bind('patient', result.id, 'create', user.id).run()

  return c.json(result)
})

app.put('/api/patients/:id', authMiddleware, requireRole(CAN_UPDATE), async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  const data = await c.req.json()
  const { firstName, lastName, middleName, gender, dateOfBirth, phone, email, address, notes, doctorId, historyDetails } = data

  const result = await c.env.DB.prepare(
    'UPDATE patients SET firstName = ?, lastName = ?, middleName = ?, gender = ?, dateOfBirth = ?, phone = ?, email = ?, address = ?, notes = ?, doctor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
  ).bind(firstName, lastName, middleName || null, gender || null, dateOfBirth, phone, email, address, notes, doctorId, patientId).first()

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changes, changed_by) VALUES (?, ?, ?, ?, ?)'
  ).bind('patient', patientId, 'update', historyDetails ? JSON.stringify({ details: historyDetails }) : null, user.id).run()

  return c.json(result)
})

app.delete('/api/patients/:id', authMiddleware, requireRole(CAN_DELETE), async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM tooth_data WHERE patient_id = ?').bind(patientId).run()
  await c.env.DB.prepare('DELETE FROM visits WHERE patient_id = ?').bind(patientId).run()
  await c.env.DB.prepare('DELETE FROM patients WHERE id = ?').bind(patientId).run()
  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  ).bind('patient', patientId, 'delete', user.id).run()
  return c.json({ success: true })
})

// ─── TEETH ───────────────────────────────────────────────────────────────────

app.get('/api/patients/:id/teeth', authMiddleware, requireRole(CAN_READ), async (c) => {
  const patientId = c.req.param('id')
  const { results } = await c.env.DB.prepare('SELECT * FROM tooth_data WHERE patient_id = ?')
    .bind(patientId).all()
  return c.json(results)
})

app.post('/api/patients/:id/teeth', authMiddleware, requireRole(CAN_CREATE), async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  const { tooth_number, status, notes } = await c.req.json()

  const existing = await c.env.DB.prepare(
    'SELECT * FROM tooth_data WHERE patient_id = ? AND tooth_number = ?'
  ).bind(patientId, tooth_number).first()

  let result: any
  if (existing) {
    if (!hasRole(user.role, CAN_UPDATE)) {
      return c.json({ error: 'Forbidden', message: 'Недостатньо прав для редагування зуба.' }, 403)
    }
    result = await c.env.DB.prepare(
      'UPDATE tooth_data SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
    ).bind(status, notes, existing.id).first()
    await c.env.DB.prepare(
      'INSERT INTO history_logs (entity_type, entity_id, action, changes, changed_by) VALUES (?, ?, ?, ?, ?)'
    ).bind('tooth', existing.id, 'update', JSON.stringify({ old: existing, new: result }), user.id).run()
  } else {
    result = await c.env.DB.prepare(
      'INSERT INTO tooth_data (patient_id, tooth_number, status, notes) VALUES (?, ?, ?, ?) RETURNING *'
    ).bind(patientId, tooth_number, status, notes).first()
    await c.env.DB.prepare(
      'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
    ).bind('tooth', result.id, 'create', user.id).run()
  }
  return c.json(result)
})

// ─── VISITS ──────────────────────────────────────────────────────────────────

app.get('/api/patients/:id/visits', authMiddleware, requireRole(CAN_READ), async (c) => {
  const patientId = c.req.param('id')
  const { results } = await c.env.DB.prepare(
    'SELECT v.*, u.fullName as doctorName FROM visits v LEFT JOIN users u ON v.doctor_id = u.id WHERE v.patient_id = ? ORDER BY v.visitDate DESC'
  ).bind(patientId).all()
  return c.json(results)
})

app.post('/api/patients/:id/visits', authMiddleware, requireRole(CAN_CREATE), async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  const { visitDate, type, reason, notes, doctorId } = await c.req.json()

  const result = await c.env.DB.prepare(
    'INSERT INTO visits (patient_id, doctor_id, visitDate, type, reason, notes) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(patientId, doctorId, visitDate, type || 'future', reason || null, notes || null).first()

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  ).bind('visit', result.id, 'create', user.id).run()

  return c.json(result)
})

app.put('/api/patients/:patientId/visits/:visitId', authMiddleware, requireRole(CAN_UPDATE), async (c) => {
  const user = c.get('user')
  const { patientId, visitId } = c.req.param()
  const { visitDate, type, reason, notes, doctorId } = await c.req.json()

  const result = await c.env.DB.prepare(
    'UPDATE visits SET visitDate = ?, type = ?, reason = ?, notes = ?, doctor_id = ? WHERE id = ? AND patient_id = ? RETURNING *'
  ).bind(visitDate, type || 'future', reason || null, notes || null, doctorId, visitId, patientId).first()

  if (!result) return c.json({ error: 'Visit not found' }, 404)

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  ).bind('visit', visitId, 'update', user.id).run()

  return c.json(result)
})

app.delete('/api/patients/:patientId/visits/:visitId', authMiddleware, requireRole(CAN_DELETE), async (c) => {
  const user = c.get('user')
  const { patientId, visitId } = c.req.param()
  await c.env.DB.prepare('DELETE FROM visits WHERE id = ? AND patient_id = ?')
    .bind(visitId, patientId).run()
  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  ).bind('visit', visitId, 'delete', user.id).run()
  return c.json({ success: true })
})

// ─── DOCTORS ─────────────────────────────────────────────────────────────────

// Тільки лікарі (role_id = 2) — superadmin виключений зі списку
app.get('/api/doctors', authMiddleware, requireRole(CAN_READ), async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, fullName as name, email FROM users WHERE role_id = 2'
    ).all()
    return c.json(results.map((d: any) => ({ ...d, id: d.id.toString(), specialty: 'Лікар' })))
  } catch (error: any) {
    return c.json({ error: 'Database error', details: error.message }, 500)
  }
})

export default app
