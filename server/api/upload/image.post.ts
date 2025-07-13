import { z } from 'zod'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { H3Event } from 'h3'

const schema = z.object({
  isDocument: z.boolean()
    .describe('True if the image looks like a government issued document'),
  name: z.string().optional()
    .describe('Name of the document if detected'),
  dateOfBirth: z.string().optional()
    .describe('Date of birth if detected'),
  dateOfExpiry: z.string().optional()
    .describe('Date of expiry if detected'),
  documentNumber: z.string().optional()
    .describe('Document number if detected'),
  fatherName: z.string().optional()
    .describe('Father\'s name if detected'),
  motherName: z.string().optional()
    .describe('Mother\'s name if detected'),
  gender: z.string().optional()
    .describe('Gender if detected'),
  nationality: z.string().optional()
    .describe('Nationality if detected'),
})

export type Schema = z.infer<typeof schema>

export default defineEventHandler(async (event: H3Event): Promise<Schema> => {
  const data = await readMultipartFormData(event)
  if (!data) throw createError({ status: 400 })
  const image = data[0]

  console.info(`Image name: ${image.filename}`)
  console.info(`Image size: ${image.data.length} bytes`)
  console.info(`Image type: ${image.type}`)

  const base64Image = image.data.toString('base64')

  // Analyze the image with AI
  const response = await generateObject<typeof schema>({
    model: openai('gpt-4.1-nano'),
    schema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Analyze this image and determine if it contains an ',
              'identification document. Look for official government-issued ',
              'IDs like passports, driver licenses, ID cards, etc.',
            ].join(''),
          },
          {
            type: 'image',
            image: `data:${image.type};base64,${base64Image}`,
          },
        ],
      },
    ],
  })

  console.info('AI Analysis Result:', response.object)

  return response.object
})
