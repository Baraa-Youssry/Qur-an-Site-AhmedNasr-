const router = require('express').Router()
const authMiddleware = require('../middleware/auth')
const uploadController = require('../controllers/upload.controller')

router.post('/audio', authMiddleware, uploadController.upload.single('file'), uploadController.uploadAudio)
router.post('/image', authMiddleware, uploadController.upload.single('file'), uploadController.uploadImage)
router.post('/video', authMiddleware, uploadController.videoUpload.single('file'), uploadController.uploadVideo)

module.exports = router
