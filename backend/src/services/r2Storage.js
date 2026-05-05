const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')
const env = require('../config/env')

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

async function uploadFile(bucket, key, buffer, contentType) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    },
  })

  await upload.done()

  const publicUrlBase = bucket === env.R2_AUDIO_BUCKET
    ? env.R2_AUDIO_PUBLIC_URL
    : env.R2_IMAGES_PUBLIC_URL

  return {
    publicUrl: `${publicUrlBase}/${key}`,
    storagePath: key,
  }
}

async function deleteFile(bucket, key) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

async function getBucketSize(bucket) {
  const response = await s3.send(new ListObjectsV2Command({ Bucket: bucket }))
  let totalBytes = 0
  if (response.Contents) {
    for (const obj of response.Contents) {
      totalBytes += obj.Size
    }
  }
  return Math.round(totalBytes / 1024)
}

module.exports = { uploadFile, deleteFile, getBucketSize }
