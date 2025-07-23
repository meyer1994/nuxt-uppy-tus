import { openai } from '@ai-sdk/openai'
import type { SystemModelMessage, UserModelMessage } from 'ai'
import { generateObject } from 'ai'
import { z } from 'zod'

interface AiOptions {
  model?: string
}

enum FileTypes {
  RG = 'RG',
  CPF = 'CPF',
  CNH = 'CNH',
  CNPJ = 'CNPJ',
  CERTIDAO = 'CERTIDAO',
  DESCONHECIDO = 'DESCONHECIDO',
}

export type SupportedMimeTypes = 'application/pdf' | 'image/jpg' | 'image/png' | 'image/jpeg'

// Zod schemas for each document type
const RG_SCHEMA = z.object({
  nome_completo: z.string().nullable(),
  data_nascimento: z.string().nullable(),
  numero_rg: z.string().nullable(),
  orgao_emissor: z.string().nullable(),
  data_emissao: z.string().nullable(),
  local_nascimento: z.string().nullable(),
  pai: z.string().nullable(),
  mae: z.string().nullable(),
  naturalidade: z.string().nullable(),
  uf: z.string().nullable(),
})

const CPF_SCHEMA = z.object({
  numero_cpf: z.string().nullable(),
  nome_completo: z.string().nullable(),
  data_nascimento: z.string().nullable(),
  situacao_cadastral: z.string().nullable(),
  data_inscricao: z.string().nullable(),
  orgao_emissor: z.string().nullable(),
})

const CNH_SCHEMA = z.object({
  nome_completo: z.string().nullable(),
  data_nascimento: z.string().nullable(),
  numero_registro: z.string().nullable(),
  categoria: z.string().nullable(),
  data_emissao: z.string().nullable(),
  data_validade: z.string().nullable(),
  orgao_emissor: z.string().nullable(),
  local_emissao: z.string().nullable(),
  cpf: z.string().nullable(),
  rg: z.string().nullable(),
  uf: z.string().nullable(),
})

const CNPJ_SCHEMA = z.object({
  numero_cnpj: z.string().nullable(),
  razao_social: z.string().nullable(),
  nome_fantasia: z.string().nullable(),
  data_abertura: z.string().nullable(),
  endereco: z.string().nullable(),
  cep: z.string().nullable(),
  municipio: z.string().nullable(),
  uf: z.string().nullable(),
  telefone: z.string().nullable(),
  email: z.string().nullable(),
  situacao_cadastral: z.string().nullable(),
  tipo_empresa: z.string().nullable(),
  atividade_economica: z.string().nullable(),
})

const CERTIDAO_SCHEMA = z.object({
  nome_comprador: z.string().nullable(),
  nome_vendedor: z.string().nullable(),
  data_compra_venda: z.string().nullable(),
  valor_transacao: z.string().nullable(),
  endereco_imovel: z.string().nullable(),
  area_imovel: z.string().nullable(),
  matricula_imovel: z.string().nullable(),
  cartorio_registro: z.string().nullable(),
  data_certidao: z.string().nullable(),
  numero_certidao: z.string().nullable(),
  municipio: z.string().nullable(),
  uf: z.string().nullable(),
})

// Information extraction prompts
const PROMPT_EXTRACT_RG = `
Você é um especialista em extrair informações de documentos brasileiros. Analise o RG fornecido e extraia as seguintes informações em formato JSON:

{
  "nome_completo": "Nome completo do portador",
  "data_nascimento": "Data de nascimento (DD/MM/AAAA)",
  "numero_rg": "Número do RG",
  "orgao_emissor": "Órgão emissor (SSP, DETRAN, etc.)",
  "data_emissao": "Data de emissão (DD/MM/AAAA)",
  "local_nascimento": "Local de nascimento",
  "pai": "Nome do pai",
  "mae": "Nome da mãe",
  "naturalidade": "Naturalidade",
  "uf": "Estado de emissão"
}

Extraia apenas as informações que estão visíveis no documento. Se alguma informação não estiver presente, use null.
`

const PROMPT_EXTRACT_CPF = `
Você é um especialista em extrair informações de documentos brasileiros. Analise o CPF fornecido e extraia as seguintes informações em formato JSON:

{
  "numero_cpf": "Número do CPF (apenas números)",
  "nome_completo": "Nome completo do titular",
  "data_nascimento": "Data de nascimento (DD/MM/AAAA)",
  "situacao_cadastral": "Situação cadastral (Regular, Pendente, etc.)",
  "data_inscricao": "Data de inscrição (DD/MM/AAAA)",
  "orgao_emissor": "Órgão emissor (Receita Federal)"
}

Extraia apenas as informações que estão visíveis no documento. Se alguma informação não estiver presente, use null.
`

const PROMPT_EXTRACT_CNH = `
Você é um especialista em extrair informações de documentos brasileiros. Analise a CNH fornecida e extraia as seguintes informações em formato JSON:

{
  "nome_completo": "Nome completo do condutor",
  "data_nascimento": "Data de nascimento (DD/MM/AAAA)",
  "numero_registro": "Número de registro da CNH",
  "categoria": "Categoria de habilitação (A, B, C, D, E, AB, AC, AD, AE)",
  "data_emissao": "Data de emissão (DD/MM/AAAA)",
  "data_validade": "Data de validade (DD/MM/AAAA)",
  "orgao_emissor": "Órgão emissor (DETRAN)",
  "local_emissao": "Local de emissão",
  "cpf": "CPF do condutor",
  "rg": "RG do condutor",
  "uf": "Estado de emissão"
}

Extraia apenas as informações que estão visíveis no documento. Se alguma informação não estiver presente, use null.
`

const PROMPT_EXTRACT_CNPJ = `
Você é um especialista em extrair informações de documentos brasileiros. Analise o CNPJ fornecido e extraia as seguintes informações em formato JSON:

{
  "numero_cnpj": "Número do CNPJ (apenas números)",
  "razao_social": "Razão social da empresa",
  "nome_fantasia": "Nome fantasia (se houver)",
  "data_abertura": "Data de abertura (DD/MM/AAAA)",
  "endereco": "Endereço completo",
  "cep": "CEP",
  "municipio": "Município",
  "uf": "Estado",
  "telefone": "Telefone",
  "email": "Email",
  "situacao_cadastral": "Situação cadastral (Ativa, Suspensa, etc.)",
  "tipo_empresa": "Tipo de empresa (LTDA, ME, EIRELI, etc.)",
  "atividade_economica": "Atividade econômica"
}

Extraia apenas as informações que estão visíveis no documento. Se alguma informação não estiver presente, use null.
`

const PROMPT_EXTRACT_CERTIDAO = `
Você é um especialista em extrair informações de documentos brasileiros. Analise a CERTIDÃO fornecida e extraia as seguintes informações em formato JSON:

{
  "nome_comprador": "Nome completo do comprador",
  "nome_vendedor": "Nome completo do vendedor",
  "data_compra_venda": "Data da compra e venda (DD/MM/AAAA)",
  "valor_transacao": "Valor da transação",
  "endereco_imovel": "Endereço completo do imóvel",
  "area_imovel": "Área do imóvel",
  "matricula_imovel": "Matrícula do imóvel",
  "cartorio_registro": "Cartório de registro",
  "data_certidao": "Data da certidão (DD/MM/AAAA)",
  "numero_certidao": "Número da certidão",
  "municipio": "Município",
  "uf": "Estado"
}

Extraia apenas as informações que estão visíveis no documento. Se alguma informação não estiver presente, use null.
`

// Information extraction prompts mapping
const INFORMATION_EXTRACTION_PROMPTS: Record<Exclude<FileTypes, FileTypes.DESCONHECIDO>, string> = {
  [FileTypes.RG]: PROMPT_EXTRACT_RG,
  [FileTypes.CPF]: PROMPT_EXTRACT_CPF,
  [FileTypes.CNH]: PROMPT_EXTRACT_CNH,
  [FileTypes.CNPJ]: PROMPT_EXTRACT_CNPJ,
  [FileTypes.CERTIDAO]: PROMPT_EXTRACT_CERTIDAO,
} as const

// Schema mapping
const SCHEMA_MAPPING: Record<Exclude<FileTypes, FileTypes.DESCONHECIDO>, z.ZodSchema> = {
  [FileTypes.RG]: RG_SCHEMA,
  [FileTypes.CPF]: CPF_SCHEMA,
  [FileTypes.CNH]: CNH_SCHEMA,
  [FileTypes.CNPJ]: CNPJ_SCHEMA,
  [FileTypes.CERTIDAO]: CERTIDAO_SCHEMA,
} as const

export const useAi = (opts: AiOptions = {}) => {
  const model = openai(opts.model || 'gpt-4o-mini')

  const _toUrl = async (url: URL, mimeType: SupportedMimeTypes) => {
    const data = await $fetch<Blob>(url.toString(), { responseType: 'blob' })
    if (!data) throw new Error('Failed to fetch data')

    const arrayBuffer = await data.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mediaUrl = `data:${mimeType};base64,${base64}`
    console.info('mediaUrl', mediaUrl.slice(0, 64))

    return mediaUrl
  }

  const _message = (mimeType: SupportedMimeTypes, mediaUrl: string): UserModelMessage => {
    switch (mimeType) {
      case 'application/pdf':
        return {
          role: 'user',
          content: [{
            type: 'file',
            data: mediaUrl,
            mediaType: mimeType,
          }],
        }
      case 'image/jpg':
      case 'image/jpeg':
      case 'image/png':
        return {
          role: 'user',
          content: [{
            type: 'image',
            image: mediaUrl,
            mediaType: mimeType,
          }],
        }
      default:
        throw new Error(`Unsupported mime type: ${mimeType}`)
    }
  }

  const type = async (url: URL, mimeType: SupportedMimeTypes) => {
    console.info('type', url.toString(), mimeType)

    const mediaUrl = await _toUrl(url, mimeType)

    const messages: Array<SystemModelMessage | UserModelMessage> = [
      {
        role: 'system',
        content: `
        Você é um assistente útil que pode determinar o tipo de um documento brasileiro a partir do arquivo enviado.

        Os tipos de documento possíveis são:
        - RG: Registro Geral, documento de identidade brasileiro, normalmente contém nome completo, data de nascimento, filiação, número do RG, órgão emissor e foto.
        - CPF: Cadastro de Pessoas Físicas, documento fiscal brasileiro, geralmente apresenta apenas o número do CPF, nome completo e data de nascimento.
        - CNH: Carteira Nacional de Habilitação, documento de habilitação para dirigir, inclui foto, número de registro, categoria, validade, nome completo e data de nascimento.
        - CNPJ: Cadastro Nacional da Pessoa Jurídica, documento de identificação de empresas, normalmente apresenta razão social, número do CNPJ, endereço e data de abertura.
        - CERTIDAO: Certidão de compra e venda de imóvel, documento de identificação de imóvel, normalmente apresenta nome do comprador, nome do vendedor, data da compra e venda, valor da compra e venda, endereço do imóvel e data da certidão.

        Se não tiver certeza, retorne 'DESCONHECIDO'.

        ALWAYS RETURN A RESPONSE.
        `,
      },
      _message(mimeType, mediaUrl),
    ]

    const { object } = await generateObject({
      model,
      messages,
      output: 'enum',
      enum: Object.values(FileTypes),
    })

    return { type: object }
  }

  const info = async (url: URL, mimeType: SupportedMimeTypes, type: FileTypes) => {
    console.info('info', url.toString(), mimeType, type)
    if (type === FileTypes.DESCONHECIDO) return {}

    const mediaUrl = await _toUrl(url, mimeType)

    const messages: Array<SystemModelMessage | UserModelMessage> = [
      {
        role: 'system',
        content: INFORMATION_EXTRACTION_PROMPTS[type],
      },
      _message(mimeType, mediaUrl),
    ]

    const { object } = await generateObject({
      model,
      messages,
      schema: SCHEMA_MAPPING[type],
    })

    return object
  }

  return { type, info }
}
