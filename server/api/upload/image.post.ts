import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import type { H3Event } from 'h3'
import { z } from 'zod'
import { identity } from '~/shared/schemas'

const schema = z.object({
  isDocument: z.boolean()
    .describe('True if the image contains a Brazilian government-issued identity document (CIN, RG, CNH, passaporte, etc.)'),
  identity: identity,
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
    model: openai('gpt-4.1'),
    // model: openai('gpt-4o'),
    schema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Analise esta imagem e determine se ela contém um documento de identidade brasileiro. ',
              'Procure especificamente por: ',
              '1. Carteira de Identidade Nacional (CIN) ou Registro Geral (RG) ',
              '2. Carteira Nacional de Habilitação (CNH) ',
              '3. Passaporte brasileiro ',
              '4. Carteira de Trabalho ',
              '5. Outros documentos oficiais brasileiros com foto ',
              '',
              'Se for um documento de identidade brasileiro, extraia TODAS as informações visíveis: ',
              '- Nome completo do portador ',
              '- Data de nascimento (formato DD/MM/AAAA) ',
              '- Local/cidade de nascimento (naturalidade) ',
              '- Filiação (nome dos pais/mãe/pai) ',
              '- Número do documento (RG ou número da CIN) ',
              '- CPF (Cadastro de Pessoa Física) - formato XXX.XXX.XXX-XX ',
              '- Sexo/Gênero (M/F) ',
              '- Nacionalidade (geralmente BRA para brasileiros) ',
              '',
              'Procure por texto em português e formato brasileiro. ',
              'Seja preciso na extração dos dados e mantenha a formatação original dos números e datas.',
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
