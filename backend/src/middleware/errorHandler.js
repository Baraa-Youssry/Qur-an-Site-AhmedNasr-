function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`)

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation error', details: err.errors })
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message })
  }

  res.status(500).json({ error: 'Internal server error' })
}

module.exports = errorHandler
