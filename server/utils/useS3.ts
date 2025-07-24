import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const useS3 = () => {
  const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
    },
    endpoint: 'http://dev.jmeyer.dev',
    forcePathStyle: true,
  })

  const url = async (key: string, expiresIn: number = 3_600): Promise<URL> => {
    console.info(`url(${key})`)

    const command = new GetObjectCommand({
      Bucket: 'uploads',
      Key: key,
    })

    return new URL(await getSignedUrl(s3, command, { expiresIn }))
  }

  return {
    url,
  }
}
