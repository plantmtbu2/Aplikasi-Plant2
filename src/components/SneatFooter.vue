<template>
  <footer class="content-footer footer bg-footer-theme py-3 px-4 mt-auto">
    <div class="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
      <div class="mb-2 mb-md-0 text-muted small">
        © {{ currentYear }} <strong class="text-primary">REPORTING PLANT 2</strong> — Heavy Equipment Reliability & Maintenance Management.
      </div>
      <div class="text-muted small">
        <span class="badge bg-label-primary me-2">Sneat Admin v2.4</span>
        <span class="badge bg-label-success">Supabase Ready</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>
