import { zodTextFormat } from 'openai/helpers/zod'
import type { ResponseInputItem } from 'openai/resources/responses/responses.mjs'
import type { z } from 'zod'
import * as PROMPTS from './ai/prompts'
import * as SCHEMAS from './ai/schemas'
import { useOpenAI } from './useOpenAI'

export enum AIDocumentTypes {
  RG = 'RG',
  CPF = 'CPF',
  CNH = 'CNH',
  CNPJ = 'CNPJ',
  CERTIDAO = 'CERTIDAO',
  DESCONHECIDO = 'DESCONHECIDO',
}

type RGType = z.infer<typeof SCHEMAS.RG_SCHEMA> & { type: AIDocumentTypes.RG }
type CPFType = z.infer<typeof SCHEMAS.CPF_SCHEMA> & { type: AIDocumentTypes.CPF }
type CNHType = z.infer<typeof SCHEMAS.CNH_SCHEMA> & { type: AIDocumentTypes.CNH }
type CNPJType = z.infer<typeof SCHEMAS.CNPJ_SCHEMA> & { type: AIDocumentTypes.CNPJ }
type CERTIDAOType = z.infer<typeof SCHEMAS.CERTIDAO_SCHEMA> & { type: AIDocumentTypes.CERTIDAO }
type DESCONHECIDOType = { type: AIDocumentTypes.DESCONHECIDO }

export type AIInfoTypes = RGType | CPFType | CNHType | CNPJType | CERTIDAOType | DESCONHECIDOType
export type AIMimeTypes = 'application/pdf' | 'image/jpg' | 'image/png' | 'image/jpeg'

const buildMessage = (url: URL, mime: AIMimeTypes): ResponseInputItem.Message => {
  switch (mime) {
    case 'application/pdf':
      return {
        role: 'user',
        content: [{ type: 'input_file', file_url: url.toString() }],
      }

    case 'image/png':
    case 'image/jpg':
    case 'image/jpeg':
      return {
        role: 'user',
        content: [{ type: 'input_image', image_url: url.toString(), detail: 'high' }],
      }

    default:
      throw new Error(`Unsupported mime type: ${mime}`)
  }
}

const buildPrompt = (type: AIDocumentTypes) => {
  if (type === AIDocumentTypes.RG) return PROMPTS.PROMPT_EXTRACT_RG
  if (type === AIDocumentTypes.CPF) return PROMPTS.PROMPT_EXTRACT_CPF
  if (type === AIDocumentTypes.CNH) return PROMPTS.PROMPT_EXTRACT_CNH
  if (type === AIDocumentTypes.CNPJ) return PROMPTS.PROMPT_EXTRACT_CNPJ
  if (type === AIDocumentTypes.CERTIDAO) return PROMPTS.PROMPT_EXTRACT_CERTIDAO
  throw new Error(`Unsupported document type: ${type}`)
}

const buildSchema = (type: AIDocumentTypes) => {
  if (type === AIDocumentTypes.RG) return SCHEMAS.RG_SCHEMA
  if (type === AIDocumentTypes.CPF) return SCHEMAS.CPF_SCHEMA
  if (type === AIDocumentTypes.CNH) return SCHEMAS.CNH_SCHEMA
  if (type === AIDocumentTypes.CNPJ) return SCHEMAS.CNPJ_SCHEMA
  if (type === AIDocumentTypes.CERTIDAO) return SCHEMAS.CERTIDAO_SCHEMA
  throw new Error(`Unsupported document type: ${type}`)
}

export const useAi = () => {
  const config = useRuntimeConfig()
  const openai = useOpenAI()

  const type = async (url: URL, mimeType: AIMimeTypes) => {
    const message = buildMessage(url, mimeType)

    const response = await openai.responses.parse({
      model: config.openai.model,
      text: { format: zodTextFormat(SCHEMAS.FILE_TYPE_SCHEMA, 'type') },
      input: [
        { role: 'system', content: PROMPTS.PROMPT_SYSTEM_TYPE_DOCUMENT },
        message,
      ],
    })

    if (!response.output_parsed) throw new Error('No output parsed')
    return response.output_parsed.type
  }

  const info = async (url: URL, mime: AIMimeTypes, type: AIDocumentTypes): Promise<AIInfoTypes> => {
    if (type === AIDocumentTypes.DESCONHECIDO) return { type }

    const schema = buildSchema(type)
    const prompt = buildPrompt(type)
    const message = buildMessage(url, mime)

    const response = await openai.responses.parse({
      model: config.openai.model,
      text: { format: zodTextFormat(schema, 'info') },
      input: [
        { role: 'system', content: prompt },
        message,
      ],
    })

    if (!response.output_parsed) throw new Error('No output parsed')
    return { ...response.output_parsed, type } as AIInfoTypes
  }

  return { type, info }
}
