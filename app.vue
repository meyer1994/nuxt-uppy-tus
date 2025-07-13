<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import type { FieldApi } from '@tanstack/vue-form'
import { z } from 'zod'

// Types
interface FormData { image: File | null }

// Zod validation schema
const schema = z
  .instanceof(File)
  .refine(file => file.type.startsWith('image/'), {
    message: 'Please select an image file',
  })
  .refine(file => file.size <= 10 * 1024 * 1024, {
    message: 'File size must be less than 10MB',
  })
</script>

<template>
  <Card />
</template>
