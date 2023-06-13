export default class Piece {
  constructor(rowIndex, colIndex, size, color, pcData) {
    this.rowIndex = (pcData && pcData.rowIndex) || rowIndex
    this.colIndex = (pcData && pcData.colIndex) || colIndex
    this.x =
      (pcData && pcData.x) ||
      size.value.x + (size.value.width * this.colIndex) / size.value.columns
    this.y =
      (pcData && pcData.y) ||
      size.value.y + (size.value.height * this.rowIndex) / size.value.rows
    this.width = size.value.width / size.value.columns
    this.height = size.value.height / size.value.rows
    this.xCorrect = (pcData && pcData.xCorrect) || this.x
    this.yCorrect = (pcData && pcData.yCorrect) || this.y
    this.correct = pcData ? pcData.correct : true
    this.color = (pcData && pcData.color) || color
    this.bottom = (pcData && pcData.bottom) || null
    this.top = (pcData && pcData.top) || null
    this.right = (pcData && pcData.right) || null
    this.left = (pcData && pcData.left) || null
  }

  draw(context, img, size, useImg = true) {
    context.beginPath()

    const sz = Math.min(this.width, this.height)
    const neck = 0.1 * sz
    const tabWidth = 0.2 * sz
    const tabHeight = 0.2 * sz

    // From top left
    context.moveTo(this.x, this.y)
    // to top right
    if (this.top) {
      context.lineTo(this.x + this.width * Math.abs(this.top) - neck, this.y)
      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.top) - neck,
        this.y - tabHeight * Math.sign(this.top) * 0.2,

        this.x + this.width * Math.abs(this.top) - tabWidth,
        this.y - tabHeight * Math.sign(this.top),

        this.x + this.width * Math.abs(this.top),
        this.y - tabHeight * Math.sign(this.top)
      )
      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.top) + tabWidth,
        this.y - tabHeight * Math.sign(this.top),

        this.x + this.width * Math.abs(this.top) + neck,
        this.y - tabHeight * Math.sign(this.top) * 0.2,

        this.x + this.width * Math.abs(this.top) + neck,
        this.y
      )
    }
    context.lineTo(this.x + this.width, this.y)

    //to bottom right
    if (this.right) {
      context.lineTo(
        this.x + this.width,
        this.y + this.height * Math.abs(this.right) - neck
      )
      context.bezierCurveTo(
        this.x + this.width - tabHeight * Math.sign(this.right) * 0.2,
        this.y + this.height * Math.abs(this.right) - neck,

        this.x + this.width - tabHeight * Math.sign(this.right),
        this.y + this.height * Math.abs(this.right) - tabWidth,

        this.x + this.width - tabHeight * Math.sign(this.right),
        this.y + this.height * Math.abs(this.right)
      )
      context.bezierCurveTo(
        this.x + this.width - tabHeight * Math.sign(this.right),
        this.y + this.height * Math.abs(this.right) + tabWidth,

        this.x + this.width - tabHeight * Math.sign(this.right) * 0.2,
        this.y + this.height * Math.abs(this.right) + neck,

        this.x + this.width,
        this.y + this.height * Math.abs(this.right) + neck
      )
    }
    context.lineTo(this.x + this.width, this.y + this.height)

    //to bottom left
    if (this.bottom) {
      context.lineTo(
        this.x + this.width * Math.abs(this.bottom) + neck,
        this.y + this.height
      )

      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.bottom) + neck,
        this.y + this.height + tabHeight * Math.sign(this.bottom) * 0.2,

        this.x + this.width * Math.abs(this.bottom) + tabWidth,
        this.y + this.height + tabHeight * Math.sign(this.bottom),

        this.x + this.width * Math.abs(this.bottom),
        this.y + this.height + tabHeight * Math.sign(this.bottom)
      )

      context.bezierCurveTo(
        this.x + this.width * Math.abs(this.bottom) - tabWidth,
        this.y + this.height + tabHeight * Math.sign(this.bottom),

        this.x + this.width * Math.abs(this.bottom) - neck,
        this.y + this.height + tabHeight * Math.sign(this.bottom) * 0.2,

        this.x + this.width * Math.abs(this.bottom) - neck,
        this.y + this.height
      )
    }
    context.lineTo(this.x, this.y + this.height)

    //to top left
    if (this.left) {
      context.lineTo(this.x, this.y + this.height * Math.abs(this.left) + neck)

      context.bezierCurveTo(
        this.x + tabHeight * Math.sign(this.left) * 0.2,
        this.y + this.height * Math.abs(this.left) + neck,

        this.x + tabHeight * Math.sign(this.left),
        this.y + this.height * Math.abs(this.left) + tabWidth,

        this.x + tabHeight * Math.sign(this.left),
        this.y + this.height * Math.abs(this.left)
      )

      context.bezierCurveTo(
        this.x + tabHeight * Math.sign(this.left),
        this.y + this.height * Math.abs(this.left) - tabWidth,

        this.x + tabHeight * Math.sign(this.left) * 0.2,
        this.y + this.height * Math.abs(this.left) - neck,

        this.x,
        this.y + this.height * Math.abs(this.left) - neck
      )
    }
    context.lineTo(this.x, this.y)

    context.save()
    context.clip()

    const scaledTabHeight =
      (Math.min(
        img.value.width / size.value.columns,
        img.value.height / size.value.rows
      ) *
        tabHeight) /
      sz

    if (useImg) {
      context.drawImage(
        img.value,
        (this.colIndex * img.value.width) / size.value.columns -
          scaledTabHeight,
        (this.rowIndex * img.value.height) / size.value.rows - scaledTabHeight,
        img.value.width / size.value.columns + scaledTabHeight * 2,
        img.value.height / size.value.rows + scaledTabHeight * 2,
        this.x - tabHeight,
        this.y - tabHeight,
        this.width + tabHeight * 2,
        this.height + tabHeight * 2
      )
    } else {
      context.fillStyle = this.color
      context.fillRect(
        this.x - tabHeight,
        this.y - tabHeight,
        this.width + tabHeight * 2,
        this.height * tabHeight * 2
      )
    }

    context.restore()
    context.stroke()
  }
  isClose() {
    if (
      distance(
        { x: this.x, y: this.y },
        { x: this.xCorrect, y: this.yCorrect }
      ) <
      this.width / 3
    ) {
      return true
    }
    return false
  }
  snap(popSound) {
    this.x = this.xCorrect
    this.y = this.yCorrect
    this.correct = true
    popSound.play()
  }
}

function distance(p1, p2) {
  return Math.sqrt(
    (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  )
}
