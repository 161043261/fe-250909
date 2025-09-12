<script setup lang="ts">
import '@renderer/assets/main.css'
const handleIpc = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <RouterView />
  <a target="_blank" rel="noreferrer" @click="handleIpc">ping</a>
</template>
