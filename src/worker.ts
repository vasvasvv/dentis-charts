import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'

// Simple non-crypto hash (same as original – do NOT change or existing passwords break)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return hash.toString()
}

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

type Variables = {
  user: { id: number; email: string; role: string; exp: number }
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

// ✅ FIX #1: Pass alg: 'HS256' to verify() — without it JwtAlgorithmRequired is thrown
//    and ALL protected endpoints return 401 "Invalid token"
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

app.get('/', (c) => c.text('Dentis API is running'))

// ─── AUTH ────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    const user = await c.env.DB.prepare(
      'SELECT users.*, roles.name as roleName FROM users JOIN roles ON users.role_id = roles.id WHERE email = ?'
    )
      .bind(email)
      .first()

    if (!user) return c.json({ error: 'Invalid credentials' }, 401)

    const isValidPassword = simpleHash(password) === user.password_hash
    if (!isValidPassword) return c.json({ error: 'Invalid credentials' }, 401)

    const payload = {
      id: user.id,
      email: user.email,
      role: user.roleName,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
    }
    const token = await sign(payload, c.env.JWT_SECRET)
    return c.json({
      token,
      user: { id: user.id, email: user.email, role: user.roleName, fullName: user.fullName },
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
      .bind(email)
      .first()
    if (existingUser) return c.json({ error: 'User with this email already exists' }, 409)

    const hashedPassword = simpleHash(password)
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, fullName, role_id) VALUES (?, ?, ?, ?) RETURNING id, email, fullName, role_id'
    )
      .bind(email, hashedPassword, fullName, roleId)
      .first()

    return c.json({ message: 'User registered successfully', user: result })
  } catch (error: any) {
    console.error('Registration error:', error)
    return c.json({ error: 'Internal Server Error', details: error.message }, 500)
  }
})

// ─── PATIENTS ────────────────────────────────────────────────────────────────

// ✅ FIX #2: Changed INNER JOIN → LEFT JOIN on visits so a patient loads
//    even if the assigned doctor was deleted from users table
app.get('/api/patients', authMiddleware, async (c) => {
  try {
    const { results: patients } = await c.env.DB.prepare('SELECT * FROM patients').all()

    const patientsWithDetails = await Promise.all(
      (patients || []).map(async (patient: any) => {
        const { results: visits } = await c.env.DB.prepare(
          'SELECT v.*, u.fullName as doctorName FROM visits v LEFT JOIN users u ON v.doctor_id = u.id WHERE v.patient_id = ? ORDER BY v.visitDate DESC'
        )
          .bind(patient.id)
          .all()

        const { results: teethData } = await c.env.DB.prepare(
          'SELECT * FROM tooth_data WHERE patient_id = ?'
        )
          .bind(patient.id)
          .all()

        return {
          ...patient,
          visits: visits || [],
          dentalChart: (teethData || []).map((t: any) => ({
            toothNumber: t.tooth_number,
            status: t.status,
            notes: t.notes,
            updatedAt: t.updated_at,
          })),
        }
      })
    )

    return c.json(patientsWithDetails)
  } catch (error: any) {
    return c.json({ error: 'Database error', details: error.message }, 500)
  }
})

app.get('/api/patients/:id', authMiddleware, async (c) => {
  try {
    const patientId = c.req.param('id')
    const patient = await c.env.DB.prepare('SELECT * FROM patients WHERE id = ?')
      .bind(patientId)
      .first()
    if (!patient) return c.json({ error: 'Patient not found' }, 404)

    // ✅ FIX #2 (same): LEFT JOIN
    const { results: visits } = await c.env.DB.prepare(
      'SELECT v.*, u.fullName as doctorName FROM visits v LEFT JOIN users u ON v.doctor_id = u.id WHERE v.patient_id = ? ORDER BY v.visitDate DESC'
    )
      .bind(patientId)
      .all()

    const { results: teethData } = await c.env.DB.prepare(
      'SELECT * FROM tooth_data WHERE patient_id = ?'
    )
      .bind(patientId)
      .all()

    return c.json({
      ...patient,
      visits: visits || [],
      dentalChart: (teethData || []).map((t: any) => ({
        toothNumber: t.tooth_number,
        status: t.status,
        notes: t.notes,
        updatedAt: t.updated_at,
      })),
    })
  } catch (error: any) {
    return c.json({ error: 'Database error', details: error.message }, 500)
  }
})

app.post('/api/patients', authMiddleware, async (c) => {
  const user = c.get('user')
  const data = await c.req.json()
  const { firstName, lastName, middleName, gender, dateOfBirth, phone, email, address, notes, doctorId } = data

  const result = await c.env.DB.prepare(
    'INSERT INTO patients (firstName, lastName, middleName, gender, dateOfBirth, phone, email, address, notes, doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
  )
    .bind(firstName, lastName, middleName || null, gender || null, dateOfBirth, phone, email, address, notes, doctorId)
    .first()

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  )
    .bind('patient', result.id, 'create', user.id)
    .run()

  return c.json(result)
})

app.put('/api/patients/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  const data = await c.req.json()
  const { firstName, lastName, middleName, gender, dateOfBirth, phone, email, address, notes, doctorId } = data

  const result = await c.env.DB.prepare(
    'UPDATE patients SET firstName = ?, lastName = ?, middleName = ?, gender = ?, dateOfBirth = ?, phone = ?, email = ?, address = ?, notes = ?, doctor_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
  )
    .bind(firstName, lastName, middleName || null, gender || null, dateOfBirth, phone, email, address, notes, doctorId, patientId)
    .first()

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  )
    .bind('patient', patientId, 'update', user.id)
    .run()

  return c.json(result)
})

app.delete('/api/patients/:id', authMiddleware, async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM tooth_data WHERE patient_id = ?').bind(patientId).run()
  await c.env.DB.prepare('DELETE FROM visits WHERE patient_id = ?').bind(patientId).run()
  await c.env.DB.prepare('DELETE FROM patients WHERE id = ?').bind(patientId).run()
  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  )
    .bind('patient', patientId, 'delete', user.id)
    .run()
  return c.json({ success: true })
})

// ─── TEETH ───────────────────────────────────────────────────────────────────

app.get('/api/patients/:id/teeth', authMiddleware, async (c) => {
  const patientId = c.req.param('id')
  const { results } = await c.env.DB.prepare('SELECT * FROM tooth_data WHERE patient_id = ?')
    .bind(patientId)
    .all()
  return c.json(results)
})

app.post('/api/patients/:id/teeth', authMiddleware, async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  const { tooth_number, status, notes } = await c.req.json()

  const existing = await c.env.DB.prepare(
    'SELECT * FROM tooth_data WHERE patient_id = ? AND tooth_number = ?'
  )
    .bind(patientId, tooth_number)
    .first()

  let result: any
  if (existing) {
    result = await c.env.DB.prepare(
      'UPDATE tooth_data SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
    )
      .bind(status, notes, existing.id)
      .first()
    await c.env.DB.prepare(
      'INSERT INTO history_logs (entity_type, entity_id, action, changes, changed_by) VALUES (?, ?, ?, ?, ?)'
    )
      .bind('tooth', existing.id, 'update', JSON.stringify({ old: existing, new: result }), user.id)
      .run()
  } else {
    result = await c.env.DB.prepare(
      'INSERT INTO tooth_data (patient_id, tooth_number, status, notes) VALUES (?, ?, ?, ?) RETURNING *'
    )
      .bind(patientId, tooth_number, status, notes)
      .first()
    await c.env.DB.prepare(
      'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
    )
      .bind('tooth', result.id, 'create', user.id)
      .run()
  }
  return c.json(result)
})

// ─── VISITS ──────────────────────────────────────────────────────────────────

// ✅ FIX #3: LEFT JOIN here too
app.get('/api/patients/:id/visits', authMiddleware, async (c) => {
  const patientId = c.req.param('id')
  const { results } = await c.env.DB.prepare(
    'SELECT v.*, u.fullName as doctorName FROM visits v LEFT JOIN users u ON v.doctor_id = u.id WHERE v.patient_id = ? ORDER BY v.visitDate DESC'
  )
    .bind(patientId)
    .all()
  return c.json(results)
})

app.post('/api/patients/:id/visits', authMiddleware, async (c) => {
  const user = c.get('user')
  const patientId = c.req.param('id')
  const { visitDate, type, reason, notes, doctorId } = await c.req.json()

  const result = await c.env.DB.prepare(
    'INSERT INTO visits (patient_id, doctor_id, visitDate, type, reason, notes) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
  )
    .bind(patientId, doctorId, visitDate, type || 'future', reason || null, notes || null)
    .first()

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  )
    .bind('visit', result.id, 'create', user.id)
    .run()

  return c.json(result)
})

// ✅ FIX #4: Added missing PUT /visits/:visitId endpoint
app.put('/api/patients/:patientId/visits/:visitId', authMiddleware, async (c) => {
  const user = c.get('user')
  const { patientId, visitId } = c.req.param()
  const { visitDate, type, reason, notes, doctorId } = await c.req.json()

  const result = await c.env.DB.prepare(
    'UPDATE visits SET visitDate = ?, type = ?, reason = ?, notes = ?, doctor_id = ? WHERE id = ? AND patient_id = ? RETURNING *'
  )
    .bind(visitDate, type || 'future', reason || null, notes || null, doctorId, visitId, patientId)
    .first()

  if (!result) return c.json({ error: 'Visit not found' }, 404)

  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  )
    .bind('visit', visitId, 'update', user.id)
    .run()

  return c.json(result)
})

app.delete('/api/patients/:patientId/visits/:visitId', authMiddleware, async (c) => {
  const user = c.get('user')
  const { patientId, visitId } = c.req.param()
  await c.env.DB.prepare('DELETE FROM visits WHERE id = ? AND patient_id = ?')
    .bind(visitId, patientId)
    .run()
  await c.env.DB.prepare(
    'INSERT INTO history_logs (entity_type, entity_id, action, changed_by) VALUES (?, ?, ?, ?)'
  )
    .bind('visit', visitId, 'delete', user.id)
    .run()
  return c.json({ success: true })
})

// ─── DOCTORS ─────────────────────────────────────────────────────────────────

// ✅ FIX #5: Include superadmin (role_id=1) in doctors list — they can also
//    be assigned as a doctor. Original code used role_id = 2 only.
app.get('/api/doctors', authMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, fullName as name, email FROM users WHERE role_id=2'
    ).all()
    return c.json(results.map((d: any) => ({ ...d, id: d.id.toString(), specialty: 'Лікар' })))
  } catch (error: any) {
    return c.json({ error: 'Database error', details: error.message }, 500)
  }
})

export default app
