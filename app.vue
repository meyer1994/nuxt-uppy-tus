<script setup lang="ts">
import type { FileUploadUploaderEvent } from 'primevue/fileupload'

const { data, refresh, status } = useFetch('/api/files', { default: () => ({ files: [] }) })
useIntervalFn(refresh, 5_000)

const remove = async (id: string) => {
  await $fetch(`/api/files/${id}`, { method: 'DELETE' })
  await refresh()
}

const uploader = async (e: FileUploadUploaderEvent) => {
  console.info('File upload event:', e)
  const files = Array.isArray(e.files) ? e.files : [e.files]
  if (files.length === 0) return

  await Promise.all(files.map(async (file) => {
    const form = new FormData()
    form.append('file', file)
    await $fetch<never>('/api/files', {
      method: 'POST',
      body: form,
    })
  }))
}

const doGet = async (id: string) => {
  await $fetch(`/api/files/${id}`, { method: 'GET' })
  console.info('Data refreshed')
}
</script>

<template>
  <!-- full with with padding is defined here -->
  <main class="flex flex-col gap-4 min-h-screen p-4">
    <!-- upload form -->
    <FileUpload
      url="/api/files"
      :multiple="true"
      accept="image/jpeg,image/png,image/jpg,application/pdf"
      :pt="{ root: 'w-full' }"
      :custom-upload="true"
      @uploader="(e: FileUploadUploaderEvent) => uploader(e)"
    >
      <!-- selected files -->
      <template #content="{ files, removeFileCallback }">
        <DataTable
          v-if="files.length > 0"
          :value="files"
          size="small"
        >
          <Column
            field="name"
            header="Filename"
          >
            <template #body="{ data: { name } }">
              {{ name.length > 11 ? name.slice(0, 14) + '...' : name }}
            </template>
          </Column>
          <Column
            field="size"
            header="Size"
          >
            <template #body="{ data: { size } }">
              {{ (size / 1024).toFixed(1) }} KB
            </template>
          </Column>
          <Column
            field="type"
            header="Type"
          />
          <Column
            header="Remove"
          >
            <template #body="{ index }">
              <Button
                icon="pi pi-times"
                severity="danger"
                size="small"
                @click="() => removeFileCallback(index)"
              />
            </template>
          </Column>
        </DataTable>
      </template>

      <template #empty>
        <div class="flex flex-col items-center justify-center h-full w-full gap-2 p-4">
          <i class="pi pi-upload text-4xl text-primary-500" />
          <span class="text-base font-semibold">Drag and drop files here</span>
        </div>
      </template>
    </FileUpload>

    <!-- uploads table -->
    <DataTable
      :value="data.files"
      :loading="status === 'pending'"
      size="small"
      data-key="id"
    >
      <Column
        field="id"
        header="ID"
        sortable
      >
        <template #body="{ data: { id } }">
          <div
            class="text-sm font-mono"
            :title="id"
          >
            #<span class="hover:underline cursor-pointer">{{ id.slice(0, 8) }}</span>
          </div>
        </template>
      </Column>
      <Column
        field="file_name"
        header="Filename"
      >
        <template #body="{ data: { key } }">
          <span
            class="text-sm font-mono"
            :title="key"
          >
            {{ key.length > 11 ? key.slice(0, 14) + '...' : key }}
          </span>
        </template>
      </Column>
      <Column
        field="meta"
        header="Metadata"
      />
      <Column
        field="created_at"
        header="Created At"
      >
        <template #body="{ data: { created_at } }">
          <NuxtTime
            relative
            title
            :datetime="created_at"
          />
        </template>
      </Column>
      <Column>
        <template #body="{ data: { id, url } }">
          <Button
            icon="pi pi-trash"
            severity="danger"
            size="small"
            @click="() => remove(id)"
          />
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            size="small"
            @click="() => doGet(id)"
          />
          <Button
            icon="pi pi-download"
            severity="info"
            size="small"
            as="a"
            :href="`/api/files/${id}/download`"
            target="_blank"
            title="Download file"
          />
        </template>
      </Column>
    </DataTable>
  </main>
</template>
