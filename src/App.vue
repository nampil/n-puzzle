<template>
  <div class="wrap">
    <Playground></Playground>
  </div>
</template>
<script setup>
import { provide, ref } from 'vue'
import Playground from './components/Playground.vue'

const input = ref(null)
const imgData = ref('')
provide('imgData', imgData)
const dropzone = ref(null)
const handleInput = () => {}

const handleDropping = (event) => {
  const file = event.dataTransfer.files[0]
  if (file.type && !file.type.startsWith('image/')) {
    console.log('File is not an image.', file.type, file)
    return
  }
  const reader = new FileReader()
  reader.addEventListener('load', (event) => {
    imgData.value = event.target.result
  })
  reader.readAsDataURL(file)
}

const handleDragging = (event) => {
  const eventType = event.type

  switch (eventType) {
    case 'dragenter':
      dropzone.value.classList.add('dragging-over')
      break
    case 'dragleave':
      dropzone.value.classList.remove('dragging-over')
      break
  }
}
const handleClosePreviewImg = () => {
  imgData.value = ''
  dropzone.value.classList.remove('dragging-over')
}
</script>

<style lang="scss">
*,
*::before,
*::after {
  box-sizing: border-box;
}
:root {
  --clr-primary-200: 211, 82%, 80%;
  --clr-primary-400: 211, 82%, 45%;
  --clr-primary-700: 211, 82%, 20%;
  --clr-neutral-200: 0, 0%, 90%;
  --clr-neutral-400: 0, 0%, 60%;
  --clr-neutral-700: 0, 0%, 33%;
  --clr-neutral-900: 0, 0%, 20%;
  --clr-primary-200-hsl: hsl(211, 82%, 80%);
  --clr-primary-400-hsl: hsl(211, 82%, 45%);
  --clr-primary-700-hsl: hsl(211, 82%, 20%);
  --clr-neutral-200-hsl: hsl(0, 0%, 90%);
  --clr-neutral-400-hsl: hsl(0, 0%, 60%);
  --clr-neutral-700-hsl: hsl(0, 0%, 33%);
  --clr-neutral-900-hsl: hsl(0, 0%, 20%);
}
body {
  margin: 0;
  font-family: Helvetica, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  overscroll-behavior-y: none;
  overflow: hidden;
  background-color: hsl(var(--clr-neutral-200));
}
.container {
  padding: 1rem;
  max-width: 1200px;
  width: 100%;
}
.dropzone {
  margin: 0 auto;

  max-width: 400px;
  aspect-ratio: 16/9;
  background: hsl(var(--clr-neutral-200));
  border: 2px dashed hsl(var(--clr-primary-400));
  display: flex;
  justify-content: center;
  align-items: center;
  color: hsl(var(--clr-neutral-400));
  &.dragging-over {
    border-style: solid;
    background-color: hsl(var(--clr-primary-200));
  }
  .preview {
    height: 100%;
    width: 100%;
    position: relative;
  }
  .preview-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    padding: 6px;
    background-color: transparent;
    border: 1px solid red;
    border-radius: 50%;
  }
  .x-icon {
    display: block;
    width: 2ch;
    aspect-ratio: 1;
    background-color: red;
    clip-path: polygon(
      15% 0,
      0 15%,
      35% 50%,
      0 85%,
      15% 100%,
      50% 65%,
      85% 100%,
      100% 85%,
      65% 50%,
      100% 15%,
      85% 0,
      50% 35%
    );
  }
}
.input-zone {
  margin-block: 1rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.play-btn {
  background-color: hsl(var(--clr-primary-400));
  border: none;
  color: #fff;
  padding-block: 0.5em;
  padding-inline: 1em;
  font-family: inherit;
  font-size: 1rem;
  margin-left: auto;
  &:disabled {
    opacity: 0.6;
  }
}
</style>
