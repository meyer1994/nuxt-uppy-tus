<script setup lang="ts">
import type { FileUploadSelectEvent, FileUploadUploadEvent } from 'primevue/fileupload'
import type { Schema } from '~/server/api/upload/image.post'

const isLoading = ref(false)
const result = ref<Schema | null>(null)
const preview = ref<string | null>(null)

const onSelect = ({ files }: FileUploadSelectEvent) => {
  if (!files) return
  const file = files[0]
  preview.value = URL.createObjectURL(file)
}

const onBeforeUpload = () => {
  isLoading.value = true
}

const onUpload = ({ xhr }: FileUploadUploadEvent) => {
  const response: Schema = JSON.parse(xhr.response)
  result.value = response
  isLoading.value = false
}
</script>

<template>
  <Card>
    <template #title>
      <h1 class="text-2xl font-bold">
        Identidate
      </h1>
    </template>

    <template #subtitle>
      <p>
        Faça o upload de uma imagem de um documento de identificação'
      </p>
    </template>

    <template #content>
      <!-- Upload -->
      <FileUpload
        mode="basic"
        accept="image/*"
        url="/api/upload/image"
        name="file"
        :auto="true"
        choose-label="Escolher"
        @upload="onUpload"
        @before-upload="onBeforeUpload"
        @select="onSelect"
      />

      <!-- Contents -->
      <div class="flex flex-col gap-4 mt-4">
        <!-- Header -->
        <h2 class="text-lg font-bold">
          Preview
        </h2>

        <!-- Preview -->
        <Image
          v-if="preview"
          :src="preview"
          alt="Preview da imagem selecionada"
          width="512"
        />
        <p
          v-else
          class="text-center text-gray-500"
        >
          Nenhuma imagem selecionada
        </p>

        <div v-if="preview">
          <!-- Header -->
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold">
              Resultado
            </h2>
            <ProgressSpinner
              v-if="isLoading"
              class="max-h-[0.8em] max-w-[1em] ml-2"
            />
          </div>

          <!-- Result -->
          <div v-if="result">
            <hr class="mb-2">
            <ul
              v-if="result.isDocument"
              class="text-sm"
            >
              <li><strong>Nome:</strong> {{ result.name }}</li>
              <li><strong>Número do documento:</strong> {{ result.documentNumber }}</li>
              <li><strong>Data de nascimento:</strong> {{ result.dateOfBirth }}</li>
              <li><strong>Local de nascimento:</strong> {{ result.placeOfBirth }}</li>
              <li><strong>Nome do pai:</strong> {{ result.fatherName }}</li>
              <li><strong>Nome da mãe:</strong> {{ result.motherName }}</li>
              <li><strong>Gênero:</strong> {{ result.gender }}</li>
              <li><strong>Nacionalidade:</strong> {{ result.nationality }}</li>
            </ul>
            <p v-else>
              Imagem não é um documento de identificação
            </p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
