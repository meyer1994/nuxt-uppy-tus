import OpenAI from 'openai'

export const useOpenAI = () => {
  const config = useRuntimeConfig()
  return new OpenAI({ apiKey: config.openai.apiKey })
}
