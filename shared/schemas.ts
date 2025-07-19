import { z } from 'zod'

export const identity = z.object({
  name: z.string().nullish()
    .describe('Full name of the document holder as it appears on the document (e.g., "JOÃO SILVA SANTOS")'),
  dateOfBirth: z.string().nullish()
    .describe('Date of birth in DD/MM/YYYY format as shown on Brazilian documents (e.g., "15/03/1990")'),
  placeOfBirth: z.string().nullish()
    .describe('Place of birth (naturalidade) including city and state (e.g., "SÃO PAULO/SP", "RIO DE JANEIRO/RJ")'),
  documentNumber: z.string().nullish()
    .describe('Document identification number - could be RG number, CPF, or CIN number (e.g., "12.345.678-9", "123.456.789-10")'),
  cpf: z.string().nullish()
    .describe('CPF (Cadastro de Pessoa Física) - Brazilian taxpayer ID number in format XXX.XXX.XXX-XX (e.g., "123.456.789-01")'),
  fatherName: z.string().nullish()
    .describe('Father\'s full name as listed in the "Filiação" section (e.g., "JOSÉ SILVA SANTOS")'),
  motherName: z.string().nullish()
    .describe('Mother\'s full name as listed in the "Filiação" section (e.g., "MARIA SANTOS SILVA")'),
  gender: z.string().nullish()
    .describe('Gender/sex as indicated on the document - typically "M" for Masculino or "F" for Feminino'),
  nationality: z.string().nullish()
    .describe('Nationality as shown on the document - typically "BRA" for Brazilian or "BRASILEIRA"'),
})

export const realEstate = z.object({
  owner: identity.nullish()
    .describe('Owner of the property'),
  buyer: identity.nullish()
    .describe('Buyer of the property'),
  property: z.object({
    address: z.string().nullish()
      .describe('Full address of the property, including street, number, city, and state (e.g., "Rua das Flores, 123, São Paulo/SP")'),
    area: z.number().nullish()
      .describe('Total area of the property in square meters (e.g., 120.5)'),
    price: z.number().nullish()
      .describe('Price of the property in Brazilian Real (BRL)'),
  }),
})
