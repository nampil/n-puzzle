<template>
  <div class="wrap">
    <canvas v-show="!loading" id="main-canvas" ref="canvas"></canvas>

    <canvas
      id="helper-canvas"
      ref="helperCanvas"
      style="display: none"
    ></canvas>

    <div v-if="!loading" class="header">
      <button @click="playing = !playing">
        <span class="material-icons-sharp"> settings </span>
      </button>
      <div class="time">{{ time }}</div>
      <div class="reset-btn">
        <button @click="starOver">Start Over</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="loading" class="loading">Loading...</div>
    </transition>

    <transition name="fade">
      <div v-if="!playing && !loading" class="menu-items" ref="menuItems">
        <h1>N-Puzzle</h1>
        <div class="menu" ref="menu">
          <div class="control" ref="control">
            <div class="control-difficulty">
              <span>Difficulty </span>
              <select
                name=""
                id="difficulty"
                ref="difficulty"
                class="form-control"
                v-model="diff"
              >
                <option v-for="(opt, key) in diffMap" :key="key" :value="opt">
                  {{ key }}
                </option>
              </select>
            </div>
            <button class="start-btn" @click="restart">Start</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import Piece from './Classes/piece.js'
import defaultImageSrc from '../assets/default.jpg'
import popSoundSrc from '../assets/pop.wav'
import winSoundSrc from '../assets/win.wav'

const loading = ref(true)
const menuItems = ref(null)
const canvas = ref(null)
const context = ref(null)
const helperCanvas = ref(null)
const helperContext = ref(null)
const startTime = ref(null)
const endTime = ref(null)
const time = ref('')
const popSound = ref(null)
const winSound = ref(null)
const diff = ref(null)
const img = ref(null)
const pieces = ref([])
const selectedPiece = ref(null)
const scaler = ref(0.8)
const size = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  rows: 3,
  columns: 3,
})
const playing = ref(false)
const diffMap = {
  dev: { rows: 3, columns: 3 },
  easy: { rows: 4, columns: 7 },
  medium: { rows: 9, columns: 14 },
  hard: { rows: 12, columns: 21 },
  insane: { rows: 20, columns: 35 },
}

watch(
  () => diff.value,
  (newVal) => {
    if (!playing.value) {
      initializePieces()
    }
  }
)

const gameStatus = computed(() => {
  return {
    playing: playing.value,
    pieces: pieces.value,
    diff: diff.value,
    time: time.value,
    imgUrl: img.value.src,
    size: size.value,
  }
})

const starOver = () => {
  playing.value = false
  localStorage.removeItem('npuzzle')
  time.value = ''
  startTime.value = null
  pieces.value = []
  initializePieces()
  updateGame()
}

const restart = () => {
  startTime.value = new Date().getTime()
  endTime.value = null
  randomizePieces()
  playing.value = true
  setLocalStorage()
}
const isComplete = () => {
  for (let i = 0; i < pieces.value.length; i++) {
    const element = pieces.value[i]

    if (element.correct === false) {
      return false
    }
  }
  return true
}

const updateTime = () => {
  let now = new Date().getTime()
  if (!playing.value) return
  if (startTime.value != null) {
    if (endTime.value != null) {
      time.value = formatTime(endTime.value - startTime.value)
    } else {
      time.value = formatTime(now - startTime.value)
    }
  }
}

const formatTime = (millis) => {
  let seconds = Math.floor(millis / 1000)
  let sec = Math.floor(seconds % 60)
  let min = Math.floor((seconds % (60 * 60)) / 60)
  let hou = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60))

  let formattedTime = `${hou.toString().padStart(2, '0')}:${min
    .toString()
    .padStart(2, '0')}:${sec.toString().padStart(2, '0')}`

  return formattedTime
}

const randomizePieces = () => {
  for (let i = 0; i < pieces.value.length; i++) {
    let loc = {
      x: Math.random() * (canvas.value.width - pieces.value[i].width),
      y: Math.random() * (canvas.value.height - pieces.value[i].height),
    }
    if (
      loc.y < 57 &&
      loc.x > canvas.value.width / 2 - 142 &&
      loc.x < canvas.value.width / 2 + 142
    ) {
      loc.y += 57
    }
    pieces.value[i].x = loc.x
    pieces.value[i].y = loc.y
    pieces.value[i].correct = false
  }
}

const getRandomColor = () => {
  const red = Math.floor(Math.random() * 255)
  const green = Math.floor(Math.random() * 255)
  const blue = Math.floor(Math.random() * 255)
  return 'rgb(' + red + ',' + green + ',' + blue + ')'
}

const initializePieces = (pcs) => {
  if (time.value) return
  const { rows, columns } = diff.value
  size.value.columns = columns
  size.value.rows = rows
  pieces.value = []
  const uniqueRandomColor = []
  if (pcs && pcs.length) {
    pcs.forEach((pz) => {
      pieces.value.push(new Piece(pz.rowIndex, pz.colIndex, size, pz.color, pz))
    })
  } else {
    for (let i = 0; i < size.value.rows; i++) {
      for (let j = 0; j < size.value.columns; j++) {
        let color = getRandomColor()
        while (uniqueRandomColor.includes(color)) {
          color.getRandomColor()
        }
        uniqueRandomColor.push(color)

        pieces.value.push(new Piece(i, j, size, color))
      }
    }

    let cnt = 0
    for (let i = 0; i < size.value.rows; i++) {
      for (let j = 0; j < size.value.columns; j++) {
        const piece = pieces.value[cnt]

        if (i === size.value.rows - 1) {
          piece.bottom = null
        } else {
          const sgn = Math.random() - 0.5 < 0 ? -1 : 1
          piece.bottom = sgn * (Math.random() * 0.4 + 0.3)
        }

        if (j === size.value.columns - 1) {
          piece.right = null
        } else {
          const sgn = Math.random() - 0.5 < 0 ? -1 : 1
          piece.right = sgn * (Math.random() * 0.4 + 0.3)
        }

        if (j === size.value.columns - 1) {
          piece.right = null
        } else {
          const sgn = Math.random() - 0.5 < 0 ? -1 : 1
          piece.right = sgn * (Math.random() * 0.4 + 0.3)
        }

        if (j === 0) {
          piece.left = null
        } else {
          piece.left = -pieces.value[cnt - 1].right
        }

        if (i === 0) {
          piece.top = null
        } else {
          piece.top = -pieces.value[cnt - size.value.columns].bottom
        }

        cnt++
      }
    }
  }
}

const handleResize = () => {
  if (!canvas || !canvas.value) {
    return
  }
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
  helperCanvas.value.width = window.innerWidth
  helperCanvas.value.height = window.innerHeight
  let resizer =
    scaler.value *
    Math.min(
      window.innerWidth / img.value.width,
      window.innerHeight / img.value.height
    )

  size.value.width = resizer * img.value.width
  size.value.height = resizer * img.value.height
  size.value.x = window.innerWidth / 2 - size.value.width / 2
  size.value.y = window.innerHeight / 2 - size.value.height / 2

  if (pieces.value.length) {
    for (let i = 0; i < pieces.value.length; i++) {
      pieces.value[i].width = size.value.width / size.value.columns
      pieces.value[i].height = size.value.height / size.value.rows
      pieces.value[i].xCorrect =
        size.value.x +
        pieces.value[i].colIndex * (size.value.width / size.value.columns)
      pieces.value[i].yCorrect =
        size.value.y +
        pieces.value[i].rowIndex * (size.value.height / size.value.rows)

      if (pieces.value[i].x + pieces.value[i].width > canvas.value.width) {
        pieces.value[i].x = canvas.value.width - pieces.value[i].width
      }
      if (pieces.value[i].y + pieces.value[i].height > canvas.value.height) {
        pieces.value[i].y = canvas.value.height - pieces.value[i].height
      }
    }
  }
}

const updateGame = () => {
  if (!canvas.value) return

  context.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  helperContext.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  context.value.globalAlpha = 0.5
  context.value.drawImage(
    img.value,
    size.value.x,
    size.value.y,
    size.value.width,
    size.value.height
  )
  context.value.globalAlpha = 1

  for (let i = 0; i < pieces.value.length; i++) {
    pieces.value[i].draw(context.value, img, size)
    pieces.value[i].draw(helperContext.value, img, size, false)
  }
  updateTime()
  window.requestAnimationFrame(updateGame)
}
const onMouseDown = (event) => {
  const _imgData = helperContext.value.getImageData(event.x, event.y, 1, 1)
  if (_imgData.data[3] === 0) return
  const clickedColor =
    'rgb(' +
    _imgData.data[0] +
    ',' +
    _imgData.data[1] +
    ',' +
    _imgData.data[2] +
    ')'
  selectedPiece.value = getPressedPieceByColor(event, clickedColor)
  // selectedPiece.value = getPressedPiece(event)

  if (!selectedPiece.value) return

  const index = pieces.value.indexOf(selectedPiece.value)
  if (index > -1) {
    pieces.value.splice(index, 1)
    pieces.value.push(selectedPiece.value)
  }
  selectedPiece.value.offset = {
    x: event.x - selectedPiece.value.x,
    y: event.y - selectedPiece.value.y,
  }
  selectedPiece.value.correct = false
}
const onMouseMove = (event) => {
  if (selectedPiece.value != null) {
    selectedPiece.value.x = event.x - selectedPiece.value.offset.x
    selectedPiece.value.y = event.y - selectedPiece.value.offset.y
  }
}
const onMouseUp = (event) => {
  if (selectedPiece.value && selectedPiece.value.isClose()) {
    selectedPiece.value.snap(popSound.value)

    if (isComplete() && endTime.value === null) {
      let now = new Date().getTime()
      endTime.value = now
      setTimeout(() => {
        winSound.value.play()
      }, 500)
    }
  }
  if (selectedPiece.value) {
    setLocalStorage()
  }
  selectedPiece.value = null
}

const onTouchStart = (evt) => {
  let loc = { x: evt.touches[0].clientX, y: evt.touches[0].clientY }
  onMouseDown(loc)
}
const onTouchMove = (evt) => {
  let loc = { x: evt.touches[0].clientX, y: evt.touches[0].clientY }
  onMouseMove(loc)
}
const onTouchEnd = () => {
  onMouseUp()
}

const addEventListeners = () => {
  canvas.value.addEventListener('mousedown', onMouseDown)
  canvas.value.addEventListener('mousemove', onMouseMove)
  canvas.value.addEventListener('mouseup', onMouseUp)
  canvas.value.addEventListener('touchstart', onTouchStart)
  canvas.value.addEventListener('touchmove', onTouchMove)
  canvas.value.addEventListener('touchend', onTouchEnd)
}

const getPressedPieceByColor = (loc, color) => {
  for (let i = pieces.value.length - 1; i >= 0; i--) {
    if (pieces.value[i].color === color) {
      return pieces.value[i]
    }
  }
  return null
}

const setLocalStorage = () => {
  localStorage.setItem('npuzzle', JSON.stringify(gameStatus.value))
}

onMounted(async () => {
  // const defaultImg = new Image()
  // defaultImg.src = await defaultImageSrc
  // img.value = defaultImg
  // diff.value = diffMap.dev

  context.value = await canvas.value.getContext('2d')
  helperContext.value = await helperCanvas.value.getContext('2d')

  const config = JSON.parse(localStorage.getItem('npuzzle'))

  if (config) {
    const _img = new Image()
    _img.src = config.imgUrl
    img.value = _img
    diff.value = config.diff
    size.value.columns = config.size.columns
    size.value.height = config.size.height
    playing.value = config.playing

    handleResize()
    initializePieces(config.pieces)
  } else {
    const defaultImg = new Image()
    defaultImg.src = defaultImageSrc
    img.value = defaultImg
    diff.value = diffMap.dev
  }

  popSound.value = new Audio(popSoundSrc)
  popSound.value.volume = 0.25
  winSound.value = new Audio(winSoundSrc)
  winSound.value.volume = 0.5

  window.addEventListener('resize', handleResize)
  addEventListeners()

  loading.value = true

  setTimeout(() => {
    handleResize()
    // initializePieces()
    updateGame()
    loading.value = false
  }, 2000)
})
</script>

<style lang="scss" scoped>
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.menu-items {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 5vmin;
  background-color: hsla(0, 0%, 80%, 0.666);
  width: 90%;
  max-width: 600px;
  font-size: 1.5rem;
  text-align: center;
  border-radius: 4px;
}
.menu {
  .control {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
    align-items: center;
  }
}
.start-btn {
  background-color: hsl(var(--clr-primary-400));
  border: none;
  color: #fff;
  padding-block: 0.5em;
  padding-inline: 1em;
  font-family: inherit;
  font-size: 1rem;
  &:hover {
    background-color: hsl(var(--clr-primary-700));
  }
}

.header {
  position: absolute;
  top: 0;
  left: 50%;
  display: flex;
  gap: 1rem;
  padding: 12px 6px;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
}
.time {
  text-align: center;
  font-size: 1.5rem;
  color: hsl(var(--clr-primary-400));
}

.settings-backdrop {
  position: absolute;
  inset: 0;
  background-color: hsla(var(--clr-primary-700), 0.5);
}
.settings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: hsla(var(--clr-neutral-200), 0.5);
  width: 90%;
  max-width: 600px;
  min-height: 50vh;
  ul {
    padding: 2rem;
  }
}
.form-control {
  padding: 6px 12px;
  font-size: inherit;
}

.fade-enter-active,
.fade-leave-active {
  transform-origin: 50%, 50%;
  transition: all 250ms ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  transform: translate(-50%, -50%) scale(2);
  opacity: 0;
}
</style>
