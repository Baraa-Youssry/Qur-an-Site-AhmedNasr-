const supabase = require('../config/supabase')
const { loginLimiter } = require('../middleware/rateLimiter')

async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (err) {
    next(err)
  }
}

async function getMe(req, res, next) {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
      },
    })
  } catch (err) {
    next(err)
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/admin/reset-password`,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Password reset email sent' })
  } catch (err) {
    next(err)
  }
}

async function resetPassword(req, res, next) {
  try {
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Reset token required' })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired reset token' })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, {
      password,
    })

    if (updateError) {
      return res.status(400).json({ error: updateError.message })
    }

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { login, getMe, forgotPassword, resetPassword }
