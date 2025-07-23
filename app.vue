<script setup lang="ts">
const { data, refresh } = useFetch('/api/files', { default: () => ({ files: [] }) })
</script>

<template>
  <main class="max-w-[80%] mx-auto p-6">
    <FileUpload
      url="/api/files"
      :auto="true"
      :basic="true"
      @upload="() => refresh()"
    />
    <Button
      label="Refresh"
      @click="() => refresh()"
    />
    <DataTable :value="data.files">
      <Column
        field="name"
        header="Filename"
        sortable
      />
      <Column
        field="mimeType"
        header="Type"
        sortable
      />
      <Column
        field="createdAt"
        header="Created At"
        sortable
      >
        <template #body="{ data }">
          <NuxtTime
            relative
            :datetime="new Date(data.createdAt)"
          />
        </template>
      </Column>
    </DataTable>
  </main>
</template>
