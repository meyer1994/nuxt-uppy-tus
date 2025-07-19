import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import type { H3Event } from 'h3'
import { z } from 'zod'
import { realEstate } from '~/shared/schemas'

const schema = z.object({
  isDocument: z.boolean()
    .describe('True if the PDF contains an official Brazilian real estate transaction document (escritura de compra e venda, certidão, etc.)'),
  realEstate: realEstate,
})

export type Schema = z.infer<typeof schema>

const bodySchema = z.object({
  pdf: z.string().base64(),
  type: z.string(),
  name: z.string(),
})

export default defineEventHandler(async (event: H3Event): Promise<Schema> => {
  const body = await readValidatedBody(event, i => bodySchema.parse(i))

  console.info(`PDF type: ${body.type}`)
  console.info(`PDF name: ${body.name}`)
  console.info(`PDF size: ${body.pdf.length} bytes`)
  console.info(`PDF base64: ${body.pdf.slice(0, 128)}...`)

  // Analyze the PDF with AI
  const response = await generateObject<typeof schema>({
    model: openai('gpt-4.1'),
    // model: openai('gpt-4o'),
    schema,
    messages: [
      {
        role: 'system',
        content: [
          'System Prompt: Brazilian Real Estate Document Data Extractor',
          'You are an automated data extraction service. Your sole function is to analyze a Brazilian real estate document provided by the user and extract key information.',
          '',
          'Instructions:',
          '',
          '1. The user will provide a PDF document.',
          '2. First, determine if the document is an official Brazilian real estate transaction document (Escritura Pública de Compra e Venda, Certidão de Imóveis, Registro de Imóveis, etc.).',
          '3. If it is a real estate document, extract the seller (OUTORGANTE VENDEDOR), buyer (OUTORGADO COMPRADOR), and property details.',
          '4. You MUST respond ONLY with a JSON object containing the extracted data.',
          '5. The JSON object MUST strictly adhere to the schema provided below.',
          '6. If a specific piece of information cannot be found in the document, use null as its value.',
          '7. Do not add any explanatory text, apologies, or conversational filler. Your entire response must be the JSON object.',
          '',
          'REQUIRED OUTPUT SCHEMA (JSON):',
          '',
          '{',
          '  "isDocument": boolean, // True if this is an official Brazilian real estate transaction document',
          '  "realEstate": {',
          '    "owner": {',
          '      "name": "Full name of the seller/owner",',
          '      "dateOfBirth": "DD/MM/YYYY format if available",',
          '      "placeOfBirth": "City and state (e.g., SÃO PAULO/SP)",',
          '      "documentNumber": "RG, CPF, or CIN number",',
          '      "cpf": "CPF in format XXX.XXX.XXX-XX",',
          '      "fatherName": "Father\'s full name",',
          '      "motherName": "Mother\'s full name",',
          '      "gender": "M or F",',
          '      "nationality": "BRASILEIRA or other"',
          '    },',
          '    "buyer": {',
          '      "name": "Full name of the buyer",',
          '      "dateOfBirth": "DD/MM/YYYY format if available",',
          '      "placeOfBirth": "City and state (e.g., SÃO PAULO/SP)",',
          '      "documentNumber": "RG, CPF, or CIN number",',
          '      "cpf": "CPF in format XXX.XXX.XXX-XX",',
          '      "fatherName": "Father\'s full name",',
          '      "motherName": "Mother\'s full name",',
          '      "gender": "M or F",',
          '      "nationality": "BRASILEIRA or other"',
          '    },',
          '    "property": {',
          '      "address": "Full address including street, number, city, and state",',
          '      "area": number, // Total area in square meters',
          '      "price": number // Price in Brazilian Real (BRL)',
          '    }',
          '  }',
          '}',
          '',
          'Look specifically for Brazilian Portuguese text and official notarial document formatting. Extract data precisely and maintain original formatting of names and addresses.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this Brazilian real estate document and extract the required information according to the schema provided.',
          },
          {
            type: 'file',
            data: body.pdf,
            mediaType: 'application/pdf',
          },
        ],
      },
    ],
  })

  console.info('AI Analysis Result:', response.object)
  return response.object
})
