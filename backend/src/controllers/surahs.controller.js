const supabase = require('../config/supabase')
const { deleteFile, getBucketSize } = require('../services/r2Storage')
const env = require('../config/env')

async function getAllSurahs(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('surahs')
      .select('*')
      .eq('is_published', true)
      .order('number', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function getSurahById(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('surahs')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_published', true)
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Surah not found' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function getAllSurahsAdmin(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('surahs')
      .select('*')
      .order('number', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function createSurah(req, res, next) {
  try {
    const { number, name_ar, name_en, revelation, ayah_count, audio_url, audio_path, duration_sec, file_size_kb, is_published, video_url, video_path } = req.body

    const { data, error } = await supabase
      .from('surahs')
      .insert({ number, name_ar, name_en, revelation, ayah_count, audio_url, audio_path, duration_sec, file_size_kb, is_published: is_published ?? true, video_url, video_path })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

async function updateSurah(req, res, next) {
  try {
    const { id } = req.params
    const updates = { ...req.body, updated_at: new Date().toISOString() }

    if (req.body.audio_url && req.body.audio_path) {
      const { data: existing } = await supabase
        .from('surahs')
        .select('audio_path')
        .eq('id', id)
        .single()

      if (existing && existing.audio_path !== req.body.audio_path) {
        try { await deleteFile(env.R2_AUDIO_BUCKET, existing.audio_path) } catch {}
      }
    }

    if (req.body.video_url && req.body.video_path) {
      const { data: existing } = await supabase
        .from('surahs')
        .select('video_path')
        .eq('id', id)
        .single()

      if (existing && existing.video_path !== req.body.video_path) {
        try { await deleteFile(env.R2_AUDIO_BUCKET, existing.video_path) } catch {}
      }
    }

    const { data, error } = await supabase
      .from('surahs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Surah not found' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function deleteSurah(req, res, next) {
  try {
    const { id } = req.params

    const { data: surah } = await supabase
      .from('surahs')
      .select('audio_path, video_path')
      .eq('id', id)
      .single()

    if (surah?.audio_path) {
      try { await deleteFile(env.R2_AUDIO_BUCKET, surah.audio_path) } catch {}
    }
    if (surah?.video_path) {
      try { await deleteFile(env.R2_AUDIO_BUCKET, surah.video_path) } catch {}
    }

    const { error } = await supabase
      .from('surahs')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Surah deleted' })
  } catch (err) {
    next(err)
  }
}

async function getStorageStats(req, res, next) {
  try {
    const totalStorageKb = await getBucketSize(env.R2_AUDIO_BUCKET)
    res.json({ totalStorageKb, totalStorageMb: (totalStorageKb / 1024).toFixed(2) })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllSurahs, getSurahById, getAllSurahsAdmin, createSurah, updateSurah, deleteSurah, getStorageStats }
