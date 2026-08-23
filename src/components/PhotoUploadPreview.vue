<template>
  <div class="photo-upload-wrapper">
    <label v-if="label" class="form-label fw-semibold small mb-1">{{ label }}</label>
    
    <div v-if="modelValue" class="position-relative border rounded p-1 mb-2 bg-light dark-bg text-center" style="max-height: 180px; overflow: hidden;">
      <img :src="modelValue" alt="Preview" class="img-fluid rounded" style="max-height: 160px; object-fit: cover; width: 100%;" />
      <button 
        type="button" 
        class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle p-1"
        @click="$emit('update:modelValue', '')"
        title="Hapus Foto"
        style="width: 28px; height: 28px; line-height: 1;"
      >
        <i class="bx bx-x"></i>
      </button>
    </div>

    <div v-else class="d-flex flex-column gap-2">
      <div 
        class="border border-dashed rounded p-3 text-center cursor-pointer bg-light dark-bg hover-border-primary"
        @click="triggerFileInput"
      >
        <i class="bx bx-camera text-primary fs-2 mb-1"></i>
        <div class="text-xs fw-semibold text-muted">Klik untuk Upload / Ambil Foto</div>
        <div class="text-xs text-muted opacity-75">Format: JPG, PNG (Maks 5MB)</div>
      </div>

      <!-- Quick Preset / URL input toggle -->
      <div class="d-flex gap-1">
        <input 
          type="text" 
          class="form-control form-control-sm text-xs" 
          placeholder="Atau tempel URL Foto / Link Google Drive..." 
          :value="modelValue"
          @input="handleTextInput(($event.target as HTMLInputElement).value)"
        />
        <button 
          type="button" 
          class="btn btn-sm btn-outline-secondary text-nowrap text-xs"
          @click="useSamplePhoto"
          title="Gunakan Foto Sampel Alat Berat"
        >
          <i class="bx bx-image-add me-1"></i> Sample
        </button>
      </div>
    </div>

    <input 
      ref="fileInputRef" 
      type="file" 
      accept="image/*" 
      class="d-none" 
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { compressImage, formatDirectImageUrl } from '../services/imageHelper';

defineProps<{
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits(['update:modelValue']);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  try {
    const compressed = await compressImage(file, 640, 0.75);
    emit('update:modelValue', compressed);
  } catch (err) {
    console.warn('Image compression fallback:', err);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        emit('update:modelValue', e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }
}

function handleTextInput(val: string) {
  emit('update:modelValue', formatDirectImageUrl(val));
}

const samplePhotos = [
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'
];

function useSamplePhoto() {
  const randomPic = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
  emit('update:modelValue', randomPic);
}
</script>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}
.hover-border-primary:hover {
  border-color: #696cff !important;
  background-color: rgba(105, 108, 255, 0.05) !important;
}
.dark-style .dark-bg {
  background-color: #2b2c40 !important;
  border-color: #444564 !important;
}
</style>
