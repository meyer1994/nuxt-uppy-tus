import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import type { H3Event } from 'h3'
import { z } from 'zod'

const schema = z.object({
  isDocument: z.boolean()
    .describe('True if the image looks like a government issued document'),
  name: z.string().optional()
    .describe('Name of the document if detected'),
  dateOfBirth: z.string().optional()
    .describe('Date of birth if detected'),
  placeOfBirth: z.string().optional()
    .describe('Place of birth if detected'),
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

const bodySchema = z.object({
  image: z.string().base64(),
  type: z.string(),
  name: z.string(),
})

export default defineEventHandler(async (event: H3Event): Promise<Schema> => {
  const body = await readValidatedBody(event, i => bodySchema.parse(i))

  console.info(`Image type: ${body.type}`)
  console.info(`Image name: ${body.name}`)
  console.info(`Image size: ${body.image.length} bytes`)
  console.info(`Image base64: ${body.image.slice(0, 256)}...`)

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
            image: body.image,
          },
        ],
      },
    ],
  })

  console.info('AI Analysis Result:', response.object)
  return response.object
})
