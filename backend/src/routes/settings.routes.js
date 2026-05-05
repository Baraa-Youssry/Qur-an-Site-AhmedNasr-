const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const settingsController = require('../controllers/settings.controller')

router.get('/', settingsController.getSettings)
router.put('/', authMiddleware, settingsController.updateSettings)

router.get('/social-links', settingsController.getSocialLinks)
router.get('/social-links/admin/all', authMiddleware, settingsController.getAllSocialLinks)
router.post('/social-links', authMiddleware, settingsController.createSocialLink)
router.put('/social-links/:id', authMiddleware, settingsController.updateSocialLink)
router.delete('/social-links/:id', authMiddleware, settingsController.deleteSocialLink)

router.get('/milestones', settingsController.getMilestones)
router.get('/milestones/admin/all', authMiddleware, settingsController.getAllMilestones)
router.post('/milestones', authMiddleware, settingsController.createMilestone)
router.put('/milestones/:id', authMiddleware, settingsController.updateMilestone)
router.delete('/milestones/:id', authMiddleware, settingsController.deleteMilestone)

module.exports = router
