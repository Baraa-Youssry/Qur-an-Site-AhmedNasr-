const router = require('express').Router()
const { loginLimiter } = require('../middleware/rateLimiter')
const authMiddleware = require('../middleware/auth')
const authController = require('../controllers/auth.controller')

router.post('/login', loginLimiter, authController.login)
router.get('/me', authMiddleware, authController.getMe)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

module.exports = router
