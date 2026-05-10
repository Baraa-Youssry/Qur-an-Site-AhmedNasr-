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
  'http://localhost:3000',
  env.CLIENT_URL,
  env.CLIENT_URL_NGROK,
].filter(Boolean)

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('ngrok'))) {
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

const PORT = process.env.PORT || 4000
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}, accessible on all interfaces (0.0.0.0)`)
})
server.timeout = 300000
server.keepAliveTimeout = 120000
server.headersTimeout = 120000

module.exports = app
