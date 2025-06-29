import { BubbleUI } from "../../lib/bubble.js"
import { setDomEvents, uiComponent } from "../../lib/dom.js"
import { Html } from "../../lib/html.js"
import { getIcon } from "../../lib/icons.js"
import { Image } from "../../models/image.js"

const VISUALIZER_ID = "visualizer"
const VISUALIZER_CANVAS_ID = "canvas"
const BUTTON_BACK_ID = "visualizer-back"
const BUTTON_NEXT_ID = "visualizer-next"
const IMAGE_ID = "visualizer-image"
const NAME_ID = "visualizer-name"
const INFO_TEXT_ID = "visualizer-info-text"

/**
 * This class is responsible of processing 
 * the image gallery and current image to 
 * display.
 */
export class VisualizerProcessor {

  images: Array<Image> = new Array()
  index: number = 0

  load(images: Image[]) {
    this.images = images
  }

  isFirstImage(): boolean {
    if (0 == this.images.length) return false
    return 0 == this.index
  }

  isLastImage(): boolean {
    if (0 == this.images.length) return false
    return this.images.length - 1 == this.index
  }

  set(currentImage: Image) {
    this.index = this.getIndexOf(currentImage)
    if (this.index < 1) this.index = 0
  }

  getIndexOf(currentImage: Image): number {
    for (let i = 0; i < this.images.length; i++) {
      const image = this.images[i];
      if (image.name == currentImage.name) {
        return i
      }
    }
    return -1
  }

  getCurrentImage(): Image {
    if (0 == this.images.length) return null
    return this.images[this.index]
  }

  next() {
    if (0 == this.images.length) return

    this.index++
    if (this.images.length <= this.index) this.index = 0
  }

  previous() {
    if (0 == this.images.length) return
    this.index--
    if (0 > this.index) this.index = this.images.length - 1
  }

}

/**
 * This is a ui component responsible of showing
 * a gallery of images.
 */
export class Visualizer {

  /**
   * Render a visualizer
   */
  static render(processor: VisualizerProcessor): HTMLElement {
    let visualizer = document.getElementById(VISUALIZER_ID)
    return null == visualizer ? Visualizer.create(processor) : Visualizer.update(visualizer, processor)
  }

  /**
   * Create a new visualizer given an state
   */
  private static create(processor: VisualizerProcessor): HTMLElement {

    const visualizer = uiComponent({
      type: Html.Div,
      id: VISUALIZER_ID,
      classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter],
    })

    const buttonBack = getIcon("material", "back", "48px", "var(--text-color)")
    buttonBack.id = BUTTON_BACK_ID
    setDomEvents(buttonBack, {
      click: () => {
        processor.previous()
        this.render(processor)
      }
    })

    const buttonNext = getIcon("material", "back", "48px", "var(--text-color)")
    buttonNext.id = BUTTON_NEXT_ID
    setDomEvents(buttonNext, {
      click: () => {
        processor.next()
        this.render(processor)
      }
    })

    const imageCanvas = uiComponent({
      type: Html.Div,
      id: VISUALIZER_CANVAS_ID,
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter, BubbleUI.BoxXCenter]
    })

    const image = uiComponent({
      type: Html.Img,
      id: IMAGE_ID,
      attributes: {
        src: processor.getCurrentImage()?.path || "",
        loading: "lazy"
      },
    })
    imageCanvas.appendChild(image)

    const name = uiComponent({
      type: Html.H1,
      id: NAME_ID,
      text: processor.getCurrentImage()?.name,
      selectable: false
    })
    imageCanvas.appendChild(name)

    const infoText = uiComponent({
      type: Html.P,
      id: INFO_TEXT_ID,
      text: "Touch to close the visualizer.",
      classes: ["info-text"],
      selectable: false
    })

    setDomEvents(visualizer, {
      click: (event) => {

        //if the click is not on the image, close the visualizer
        if (event.target != visualizer && event.target != image && event.target != imageCanvas) return

        event.stopPropagation()
        visualizer.style.display = "none";
      }
    })



    visualizer.appendChild(buttonBack)
    visualizer.appendChild(imageCanvas)
    visualizer.appendChild(buttonNext)
    visualizer.appendChild(infoText)

    return visualizer
  }

  /**
   * Update the visualizer with the current processor state.
   */
  private static update(visualizer: HTMLElement, processor: VisualizerProcessor): HTMLElement {
    const image = document.getElementById(IMAGE_ID)
    image.style.display = "flex"
    image.setAttribute("src", processor.getCurrentImage()?.path || "")

    const name = document.getElementById(NAME_ID)
    name.innerText = processor.getCurrentImage().name || ""

    return visualizer
  }

  static show() {
    const visualizer = document.getElementById(VISUALIZER_ID)
    if (null == visualizer) return
    visualizer.style.display = "flex"
  }
}

