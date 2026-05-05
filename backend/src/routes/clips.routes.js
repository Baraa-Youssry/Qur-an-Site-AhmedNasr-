const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const clipsController = require('../controllers/clips.controller')

router.get('/', clipsController.getAllClips)
router.get('/admin/all', authMiddleware, clipsController.getAllClipsAdmin)
router.post('/', authMiddleware, clipsController.createClip)
router.put('/reorder', authMiddleware, clipsController.reorderClips)
router.put('/:id', authMiddleware, clipsController.updateClip)
router.delete('/:id', authMiddleware, clipsController.deleteClip)

module.exports = router
