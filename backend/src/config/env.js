require('dotenv').config()
const { z } = require('zod')

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_ENDPOINT: z.string().url(),
  R2_AUDIO_BUCKET: z.string().min(1),
  R2_IMAGES_BUCKET: z.string().min(1),
  R2_AUDIO_PUBLIC_URL: z.string().url(),
  R2_IMAGES_PUBLIC_URL: z.string().url(),
  CLIENT_URL: z.string().min(1).optional(),
  CLIENT_URL_NGROK: z.string().min(1).optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

module.exports = parsed.data
