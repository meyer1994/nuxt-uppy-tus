<script setup lang="ts">
import type { FileUploadSelectEvent, FileUploadUploaderEvent } from 'primevue/fileupload'
import type { Schema } from '~/server/api/upload/pdf.post'

const isLoading = ref(false)
const result = ref<Schema | null>(null)
const selectedFile = ref<string | null>(null)

const onSelect = ({ files }: FileUploadSelectEvent) => {
  console.info('onSelect')
  if (!files) return
  const file = files[0]
  selectedFile.value = file.name
}

const uploader = ({ files }: FileUploadUploaderEvent) => {
  if (!files) return
  if (isLoading.value) return

  result.value = null
  isLoading.value = true

  const file = Array.isArray(files) ? files[0] : files
  const reader = new FileReader()

  reader.onload = async () => {
    const base64Url = reader.result as string
    const [_, base64] = base64Url.split(';base64,')
    result.value = await $fetch<Schema>('/api/upload/pdf', {
      method: 'POST',
      body: { pdf: base64, type: file.type, name: file.name },
    })
    isLoading.value = false
  }

  reader.readAsDataURL(file)
}
</script>

<template>
  <Card>
    <template #title>
      <h1 class="text-2xl font-bold">
        Certidão de imóvel
      </h1>
    </template>

    <template #subtitle>
      <p>
        Faça o upload de um PDF de uma certidão de imóvel
      </p>
    </template>

    <template #content>
      <!-- Upload -->
      <FileUpload
        mode="basic"
        accept="application/pdf"
        url="/api/upload/pdf"
        name="file"
        :auto="true"
        choose-label="Escolher PDF"
        :custom-upload="true"
        @select="onSelect"
        @uploader="uploader"
      />

      <!-- Contents -->
      <div class="flex flex-col gap-4 mt-4">
        <!-- Header -->
        <h2 class="text-lg font-bold">
          Arquivo Selecionado
        </h2>

        <!-- Selected File -->
        <div
          v-if="selectedFile"
          class="p-4 border border-gray-200 rounded-lg bg-gray-50"
        >
          TEST
        </div>
        <p
          v-else
          class="text-center text-gray-500"
        >
          Nenhum PDF selecionado
        </p>

        <div v-if="selectedFile">
          <!-- Header -->
          <div class="flex justify-start items-center gap-2">
            <h2 class="text-lg font-bold">
              Resultado
            </h2>
            <div v-if="isLoading">
              <ProgressSpinner class="max-h-[1em] max-w-[1em]" />
            </div>
          </div>

          <!-- Result -->
          <div v-if="result">
            <hr class="mb-2">
            <ul
              v-if="result.isDocument"
              class="text-sm"
            >
              <li><strong>Vendedor/Proprietário Original:</strong> {{ result.realEstate.owner?.name }}</li>
              <li><strong>CPF do Vendedor/Proprietário Original:</strong> {{ result.realEstate.owner?.cpf }}</li>
              <li><strong>Comprador/Adquirente:</strong> {{ result.realEstate.buyer?.name }}</li>
              <li><strong>CPF do Comprador/Adquirente:</strong> {{ result.realEstate.buyer?.cpf }}</li>
              <li><strong>Endereço do Imóvel:</strong> {{ result.realEstate.property.address }}</li>
              <li><strong>Área do Imóvel:</strong> {{ result.realEstate.property.area }}</li>
              <li><strong>Preço do Imóvel:</strong> {{ result.realEstate.property.price }}</li>
            </ul>
            <p v-else>
              PDF não contém um documento de identificação
            </p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
