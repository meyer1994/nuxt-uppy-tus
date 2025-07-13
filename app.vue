<script setup lang="ts">
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import type { Schema } from '~/server/api/upload/image.post'

const toast = useToast()

const onUpload = async (event: FileUploadUploaderEvent) => {
  if (!event.files) return

  const file = Array.isArray(event.files) ? event.files[0] : event.files
  const blob = new Blob([file], { type: file.type })

  const form = new FormData()
  form.append('file', blob)

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: form,
  })

  const data: Schema = await response.json()
  if (!data.isDocument) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'The uploaded image is not a government issued document',
    })
    return
  }
}
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <Toast />
    <Card>
      <template #title>
        <h1>Hello World</h1>
      </template>
      <template #content>
        <FileUpload
          mode="basic"
          accept="image/*"
          url="/api/upload/image"
          :auto="true"
          :custom-upload="true"
          @uploader="onUpload"
        />
      </template>
    </Card>
  </div>
</template>
