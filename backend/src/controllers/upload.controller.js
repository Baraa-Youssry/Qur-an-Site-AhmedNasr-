const multer = require('multer')
const path = require('path')
const { parseBuffer } = require('music-metadata')
const { uploadFile, getBucketSize } = require('../services/r2Storage')
const env = require('../config/env')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/ogg']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only MP3, AAC, WAV, and OGG are allowed.'), false)
    }
  },
})

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, OGG, and MKV are allowed.'), false)
    }
  },
})

async function uploadAudio(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const { number } = req.body
    if (!number) {
      return res.status(400).json({ error: 'Surah number is required' })
    }

    const ext = path.extname(req.file.originalname) || '.mp3'
    const key = `surah-${String(number).padStart(3, '0')}${ext}`

    const { publicUrl, storagePath } = await uploadFile(
      env.R2_AUDIO_BUCKET,
      key,
      req.file.buffer,
      req.file.mimetype
    )

    let durationSec = null
    try {
      const metadata = await parseBuffer(req.file.buffer, req.file.mimetype)
      durationSec = Math.round(metadata.format.duration)
    } catch {
      // metadata extraction failed, skip
    }

    const fileSizeKb = Math.round(req.file.size / 1024)

    const totalStorageKb = await getBucketSize(env.R2_AUDIO_BUCKET)

    res.json({
      publicUrl,
      storagePath,
      durationSec,
      fileSizeKb,
      totalStorageKb,
    })
  } catch (err) {
    next(err)
  }
}

async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.' })
    }

    const ext = path.extname(req.file.originalname) || '.jpg'
    const key = `images/${Date.now()}${ext}`

    const { publicUrl, storagePath } = await uploadFile(
      env.R2_IMAGES_BUCKET,
      key,
      req.file.buffer,
      req.file.mimetype
    )

    res.json({ publicUrl, storagePath })
  } catch (err) {
    next(err)
  }
}

async function uploadVideo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const { number } = req.body
    if (!number) {
      return res.status(400).json({ error: 'Surah number is required' })
    }

    const ext = path.extname(req.file.originalname) || '.mp4'
    const key = `videos/surah-${String(number).padStart(3, '0')}${ext}`

    const { publicUrl, storagePath } = await uploadFile(
      env.R2_AUDIO_BUCKET,
      key,
      req.file.buffer,
      req.file.mimetype
    )

    const fileSizeKb = Math.round(req.file.size / 1024)

    res.json({
      publicUrl,
      storagePath,
      fileSizeKb,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { upload, videoUpload, uploadAudio, uploadImage, uploadVideo }
