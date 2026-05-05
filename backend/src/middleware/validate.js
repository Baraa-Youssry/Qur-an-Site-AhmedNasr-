const { z } = require('zod')

function validate(schema) {
  return (req, res, next) => {
    try {
      if (schema.body) schema.body.parse(req.body)
      if (schema.params) schema.params.parse(req.params)
      if (schema.query) schema.query.parse(req.query)
      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = validate
