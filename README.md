# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Scratchpad

Sample PrimeVue FileUpload component with table of selected files.

```html
<script setup lang="ts">
  const uploader = async (e: FileUploadUploaderEvent) => {
    console.info("File upload event:", e);
    const files = Array.isArray(e.files) ? e.files : [e.files];
    if (files.length === 0) return;

    await Promise.all(
      files.map(async (file) => {
        const form = new FormData();
        form.append("file", file);
        await $fetch<never>("/api/files", {
          method: "POST",
          body: form,
        });
      })
    );
  };
</script>

<FileUpload
  v-if="false"
  url="/api/files"
  :multiple="true"
  accept="image/jpeg,image/png,image/jpg,application/pdf"
  :pt="{ root: 'w-full' }"
  :custom-upload="true"
  @uploader="(e: FileUploadUploaderEvent) => uploader(e)"
>
  <!-- selected files -->
  <template #content="{ files, removeFileCallback }">
    <DataTable v-if="files.length > 0" :value="files" size="small">
      <Column field="name" header="Filename">
        <template #body="{ data: { name } }">
          {{ name.length > 11 ? name.slice(0, 14) + '...' : name }}
        </template>
      </Column>
      <Column field="size" header="Size">
        <template #body="{ data: { size } }">
          {{ (size / 1024).toFixed(1) }} KB
        </template>
      </Column>
      <Column field="type" header="Type" />
      <Column header="Remove">
        <template #body="{ index }">
          <button
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
    <div
      class="flex flex-col items-center justify-center h-full w-full gap-2 p-4"
    >
      <i class="pi pi-upload text-4xl text-primary-500" />
      <span class="text-base font-semibold">Drag and drop files here</span>
    </div>
  </template>
</FileUpload>
```
