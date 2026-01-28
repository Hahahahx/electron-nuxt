<template>
  <div class="container">
    <h1>Welcome to Electron + Nuxt 4.x</h1>
    <p>This is a template project combining Electron and Nuxt 4.x with TypeScript.</p>
    <div class="info">
      <p>App Version: {{ version || 'Loading...' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const version = ref<string>('');

onMounted(async () => {
  try {
    const appVersion = await (window as any).electronAPI.getAppVersion();
    version.value = appVersion;
  } catch (error) {
    console.error('Failed to get app version:', error);
  }
});
</script>

<style scoped>
.container {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #42b883;
  margin-bottom: 1rem;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
