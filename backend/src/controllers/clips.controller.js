const supabase = require('../config/supabase')
const { extractYouTubeId } = require('../services/youtubeHelper')

async function getAllClips(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function getAllClipsAdmin(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function createClip(req, res, next) {
  try {
    const { title_ar, title_en, description_ar, description_en, youtube_url, is_published } = req.body

    if (!youtube_url) return res.status(400).json({ error: 'YouTube URL is required' })

    const youtubeId = extractYouTubeId(youtube_url)
    if (!youtubeId) return res.status(400).json({ error: 'Invalid YouTube URL' })

    const { data, error } = await supabase
      .from('clips')
      .insert({ title_ar, title_en, description_ar, description_en, youtube_url, youtube_id: youtubeId, is_published: is_published ?? false })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

async function updateClip(req, res, next) {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() }

    if (req.body.youtube_url) {
      const youtubeId = extractYouTubeId(req.body.youtube_url)
      if (!youtubeId) return res.status(400).json({ error: 'Invalid YouTube URL' })
      updates.youtube_id = youtubeId
    }

    const { data, error } = await supabase
      .from('clips')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Clip not found' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function reorderClips(req, res, next) {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array is required' })

    const promises = items.map(({ id, sort_order }) =>
      supabase.from('clips').update({ sort_order }).eq('id', id)
    )

    await Promise.all(promises)
    res.json({ message: 'Clips reordered' })
  } catch (err) {
    next(err)
  }
}

async function deleteClip(req, res, next) {
  try {
    const { error } = await supabase
      .from('clips')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Clip deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllClips, getAllClipsAdmin, createClip, updateClip, reorderClips, deleteClip }
