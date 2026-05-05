const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const surahsController = require('../controllers/surahs.controller')

router.get('/', surahsController.getAllSurahs)
router.get('/admin/all', authMiddleware, surahsController.getAllSurahsAdmin)
router.get('/stats', authMiddleware, surahsController.getStorageStats)
router.get('/:id', surahsController.getSurahById)
router.post('/', authMiddleware, surahsController.createSurah)
router.put('/:id', authMiddleware, surahsController.updateSurah)
router.delete('/:id', authMiddleware, surahsController.deleteSurah)

module.exports = router
