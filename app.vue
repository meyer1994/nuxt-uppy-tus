<script setup lang="ts">
import type { FileSelect } from './server/utils/drizzle'

const { data, refresh, status } = useFetch('/api/files', { default: () => ({ files: [] }) })
useIntervalFn(refresh, 3_000)

const open = ref(false)
const file = ref<FileSelect | null>(null)

const onDeleteFile = async (id: string) => {
  await $fetch('/api/files', { method: 'DELETE', body: { id } })
  await refresh()
}

const onDialogOpen = async (e: FileSelect) => {
  file.value = e
  open.value = true
}
</script>

<template>
  <main class="flex flex-col gap-4 max-w-[80%] mx-auto p-6">
    <div class="grid grid-cols-2 gap-4">
      <FileUpload
        url="/api/files"
        :auto="true"
        :multiple="true"
        mode="basic"
        accept="image/jpeg,image/png,image/jpg,application/pdf"
        @upload="() => refresh()"
      />
      <Button
        label="Refresh"
        @click="() => refresh()"
      />
    </div>

    <DataTable
      :value="data.files"
      :loading="status === 'pending'"
    >
      <Column
        field="id"
        header="ID"
        sortable
      >
        <template #body="{ data: { id } }">
          <div class="text-sm font-mono">
            #<span class="hover:underline cursor-pointer">{{ id.slice(0, 8) }}</span>
          </div>
        </template>
      </Column>
      <Column
        field="name"
        header="Filename"
        sortable
      />
      <Column
        field="info.type"
        header="Document Type"
        sortable
      />
      <Column
        field="created_at"
        header="Created At"
        sortable
      >
        <template #body="{ data: { created_at } }">
          <NuxtTime
            relative
            title
            locale="pt-BR"
            :datetime="new Date(created_at)"
          />
        </template>
      </Column>
      <Column
        field="actions"
        header="Actions"
      >
        <template #body="{ data: cellFile }">
          <div class="flex gap-2">
            <Button
              severity="danger"
              icon="pi pi-trash"
              size="small"
              @click="() => onDeleteFile(cellFile.id)"
            />
            <Button
              severity="info"
              icon="pi pi-search"
              size="small"
              @click="() => onDialogOpen(cellFile)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="open"
      :modal="true"
      :header="file?.name"
      :draggable="false"
    >
      <pre>{{ file }}</pre>
    </Dialog>
  </main>
</template>
