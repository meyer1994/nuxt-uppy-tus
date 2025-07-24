import { z } from 'zod'

export const FILE_TYPE_SCHEMA = z.object({
  type: z.nativeEnum(AIDocumentTypes),
})

export const RG_SCHEMA = z.object({
  nome_completo: z.string().nullable().describe('Nome completo do portador'),
  data_nascimento: z.string().nullable().describe('Data de nascimento (DD/MM/AAAA)'),
  numero_rg: z.string().nullable().describe('Número do RG'),
  orgao_emissor: z.string().nullable().describe('Órgão emissor (SSP, DETRAN, etc.)'),
  data_emissao: z.string().nullable().describe('Data de emissão (DD/MM/AAAA)'),
  local_nascimento: z.string().nullable().describe('Local de nascimento'),
  pai: z.string().nullable().describe('Nome do pai'),
  mae: z.string().nullable().describe('Nome da mãe'),
  naturalidade: z.string().nullable().describe('Naturalidade'),
  uf: z.string().nullable().describe('Estado de emissão'),
})

export const CPF_SCHEMA = z.object({
  numero_cpf: z.string().nullable().describe('Número do CPF (apenas números)'),
  nome_completo: z.string().nullable().describe('Nome completo do titular'),
  data_nascimento: z.string().nullable().describe('Data de nascimento (DD/MM/AAAA)'),
  situacao_cadastral: z.string().nullable().describe('Situação cadastral (Regular, Pendente, etc.)'),
  data_inscricao: z.string().nullable().describe('Data de inscrição (DD/MM/AAAA)'),
  orgao_emissor: z.string().nullable().describe('Órgão emissor (Receita Federal)'),
})

export const CNH_SCHEMA = z.object({
  nome_completo: z.string().nullable().describe('Nome completo do condutor'),
  data_nascimento: z.string().nullable().describe('Data de nascimento (DD/MM/AAAA)'),
  numero_registro: z.string().nullable().describe('Número de registro da CNH'),
  categoria: z.string().nullable().describe('Categoria de habilitação (A, B, C, D, E, AB, AC, AD, AE)'),
  data_emissao: z.string().nullable().describe('Data de emissão (DD/MM/AAAA)'),
  data_validade: z.string().nullable().describe('Data de validade (DD/MM/AAAA)'),
  orgao_emissor: z.string().nullable().describe('Órgão emissor (DETRAN)'),
  local_emissao: z.string().nullable().describe('Local de emissão'),
  cpf: z.string().nullable().describe('CPF do condutor'),
  rg: z.string().nullable().describe('RG do condutor'),
  uf: z.string().nullable().describe('Estado de emissão'),
})

export const CNPJ_SCHEMA = z.object({
  numero_cnpj: z.string().nullable().describe('Número do CNPJ (apenas números)'),
  razao_social: z.string().nullable().describe('Razão social da empresa'),
  nome_fantasia: z.string().nullable().describe('Nome fantasia (se houver)'),
  data_abertura: z.string().nullable().describe('Data de abertura (DD/MM/AAAA)'),
  endereco: z.string().nullable().describe('Endereço completo'),
  cep: z.string().nullable().describe('CEP'),
  municipio: z.string().nullable().describe('Município'),
  uf: z.string().nullable().describe('Estado'),
  telefone: z.string().nullable().describe('Telefone'),
  email: z.string().nullable().describe('Email'),
  situacao_cadastral: z.string().nullable().describe('Situação cadastral (Ativa, Suspensa, etc.)'),
  tipo_empresa: z.string().nullable().describe('Tipo de empresa (LTDA, ME, EIRELI, etc.)'),
  atividade_economica: z.string().nullable().describe('Atividade econômica'),
})

export const CERTIDAO_SCHEMA = z.object({
  nome_comprador: z.string().nullable().describe('Nome completo do comprador'),
  nome_vendedor: z.string().nullable().describe('Nome completo do vendedor'),
  data_compra_venda: z.string().nullable().describe('Data da compra e venda (DD/MM/AAAA)'),
  valor_transacao: z.string().nullable().describe('Valor da transação'),
  endereco_imovel: z.string().nullable().describe('Endereço completo do imóvel'),
  area_imovel: z.string().nullable().describe('Área do imóvel'),
  matricula_imovel: z.string().nullable().describe('Matrícula do imóvel'),
  cartorio_registro: z.string().nullable().describe('Cartório de registro'),
  data_certidao: z.string().nullable().describe('Data da certidão (DD/MM/AAAA)'),
  numero_certidao: z.string().nullable().describe('Número da certidão'),
  municipio: z.string().nullable().describe('Município'),
  uf: z.string().nullable().describe('Estado'),
})
