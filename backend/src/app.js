require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const errorHandler = require('./middleware/errorHandler')
const env = require('./config/env')

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  env.CLIENT_URL,
].filter(Boolean)

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(morgan('dev'))

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/surahs', require('./routes/surahs.routes'))
app.use('/api/clips', require('./routes/clips.routes'))
app.use('/api/settings', require('./routes/settings.routes'))
app.use('/api/admin/upload', require('./routes/upload.routes'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

const PORT = env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
server.timeout = 300000
server.keepAliveTimeout = 120000
server.headersTimeout = 120000

module.exports = app
