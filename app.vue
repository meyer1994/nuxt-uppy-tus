<script setup lang="ts">
const { data } = useFetch('/api/files', { default: () => ({ files: [] }) })
</script>

<template>
  <main class="max-w-[80%] mx-auto p-6">
    <FileUpload
      multiple
      url="/api/files"
    />
    <DataTable :value="data.files">
      <Column
        field="filename"
        header="Filename"
        class="w-1/3 text-ellipsis"
        sortable
      />
      <Column
        field="mime_type"
        header="Type"
        sortable
        filter
      />
      <Column
        field="created_at"
        header="Created At"
        sortable
      />
    </DataTable>
  </main>
</template>
