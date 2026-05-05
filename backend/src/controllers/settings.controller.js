const supabase = require('../config/supabase')

async function getSettings(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')

    if (error) throw error

    const settings = {}
    data.forEach((row) => { settings[row.key] = row.value })
    res.json(settings)
  } catch (err) {
    next(err)
  }
}

async function updateSettings(req, res, next) {
  try {
    const entries = req.body
    if (!entries || typeof entries !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' })
    }

    const promises = Object.entries(entries).map(([key, value]) =>
      supabase
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' })
    )

    await Promise.all(promises)
    res.json({ message: 'Settings updated' })
  } catch (err) {
    next(err)
  }
}

async function getSocialLinks(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function getAllSocialLinks(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function createSocialLink(req, res, next) {
  try {
    const { platform, url, sort_order, is_active } = req.body
    const { data, error } = await supabase
      .from('social_links')
      .insert({ platform, url, sort_order: sort_order ?? 0, is_active: is_active ?? true })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

async function updateSocialLink(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Social link not found' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function deleteSocialLink(req, res, next) {
  try {
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Social link deleted' })
  } catch (err) {
    next(err)
  }
}

async function getMilestones(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function getAllMilestones(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function createMilestone(req, res, next) {
  try {
    const { year, title_ar, title_en, description_ar, description_en, sort_order, is_active } = req.body
    const { data, error } = await supabase
      .from('milestones')
      .insert({ year, title_ar, title_en, description_ar, description_en, sort_order: sort_order ?? 0, is_active: is_active ?? true })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

async function updateMilestone(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Milestone not found' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function deleteMilestone(req, res, next) {
  try {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error
    res.json({ message: 'Milestone deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getSettings, updateSettings,
  getSocialLinks, getAllSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink,
  getMilestones, getAllMilestones, createMilestone, updateMilestone, deleteMilestone,
}
