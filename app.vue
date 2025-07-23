<script setup lang="ts">
const { data, refresh } = useFetch('/api/files', { default: () => ({ files: [] }) })

const onDeleteFile = async (id: number) => {
  await $fetch('/api/files', { method: 'DELETE', body: { id } })
  await refresh()
}
</script>

<template>
  <main class="flex flex-col gap-4 max-w-[80%] mx-auto p-6">
    <div class="grid grid-cols-2 gap-4">
      <FileUpload
        url="/api/files"
        :auto="true"
        mode="basic"
        @upload="() => refresh()"
      />
      <Button
        label="Refresh"
        @click="() => refresh()"
      />
    </div>
    <DataTable :value="data.files">
      <Column
        field="id"
        header="ID"
        sortable
      >
        <template #body="{ data: { id } }">
          #<span class="hover:underline cursor-pointer">{{ id }}</span>
        </template>
      </Column>
      <Column
        field="name"
        header="Filename"
        sortable
      />
      <Column
        field="mimeType"
        header="File Type"
        sortable
      />
      <Column
        field="documentType"
        header="Document Type"
        sortable
      />
      <Column
        field="createdAt"
        header="Created At"
        sortable
      >
        <template #body="{ data: { createdAt } }">
          <NuxtTime
            relative
            title
            :datetime="new Date(createdAt)"
          />
        </template>
      </Column>
      <Column
        field="actions"
        header="Actions"
      >
        <template #body="{ data: { id } }">
          <Button
            severity="danger"
            icon="pi pi-trash"
            size="small"
            @click="() => onDeleteFile(id)"
          />
        </template>
      </Column>
    </DataTable>
  </main>
</template>
