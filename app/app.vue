<script setup lang="ts">
import type { UppyFile } from '@uppy/core'
import Uppy from '@uppy/core'
import type { TusBody } from '@uppy/tus'
import Tus from '@uppy/tus'
import { Dashboard } from '@uppy/vue'

import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'

const success = ref<UppyFile<TusBody, Record<string, never>>[]>([])
const failed = ref<UppyFile<TusBody, Record<string, never>>[]>([])

let uppy: Uppy<TusBody, Record<string, never>>
onMounted(() => {
  uppy = new Uppy<TusBody, Record<string, never>>({
    debug: true,
    restrictions: { allowedFileTypes: ['image/*'] },
  }).use(Tus, {
    endpoint: 'api/tus/upload', // we need to add the /upload
    removeFingerprintOnSuccess: true,
  })

  uppy.on('complete', async (result) => {
    success.value = result.successful ?? []
    failed.value = result.failed ?? []
  })
})
</script>

<template>
  <div>
    <ClientOnly>
      <Dashboard :uppy="uppy" />
    </ClientOnly>
    <div class="results-grid">
      <details>
        <summary>Successful Uploads</summary>
        <pre>{{ success }}</pre>
      </details>
      <details>
        <summary>Failed Uploads</summary>
        <pre>{{ failed }}</pre>
      </details>
    </div>
  </div>
</template>

<style scoped>
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
