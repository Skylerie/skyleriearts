import { BubbleUI } from "../../lib/bubble.js";
import { setDomClasses, setDomEvents, uiComponent } from "../../lib/dom.js";
import { Html } from "../../lib/html.js";
import { isSmallDevice } from "../../lib/browser.js";
import { emitSignal, setSignal } from "../../lib/signals.js";
import { Image } from "../../models/image.js";


/**
 * Renderer class for the image galleries.
 */
export class ImageGallery {

  public static readonly CLASS = "gallery";
  private static readonly LIST_ID = "image-list";
  private static readonly MOBILE_CLASS = "mobile";

  static readonly IMAGE_SELECTED_SIGNAL = setSignal()

  /**
   * Render a gallery
   * @param images The images to show
   * @returns The composed HTML element
   */
  static render(images: Set<Image>): HTMLElement {

    // if nothing to show, return
    if (undefined == images) {
      console.error("No images to show in gallery.")
      return
    }

    let gallery = uiComponent({
      type: Html.Div,
      classes: [
        ImageGallery.CLASS,
        BubbleUI.BoxColumn,
        BubbleUI.BoxXStart,
        BubbleUI.BoxYStart,
      ],
    })

    // turn on mobile class if needed
    if (isSmallDevice()) {
      gallery.classList.add(ImageGallery.MOBILE_CLASS);
    }

    // Add a list of images to show
    // in the gallery
    const list = this.createImageList(images)
    gallery.appendChild(list)

    return gallery
  }

  static update(container: HTMLElement, images: Set<Image>): HTMLElement {
    container.innerHTML = ""
    container.appendChild(this.createImageList(images))
    return container
  }

  static createImageList(images: Set<Image>): HTMLElement {

    // Add a list of images to show
    // in the gallery
    const list = uiComponent({
      type: Html.Ul,
      id: ImageGallery.LIST_ID,
    })

    images?.forEach((image: Image) => this.register(list, image, images))
    return list
  }

  /**
   * Register an image in the gallery
   * @param container The HTML container to attach the images to 
   * @param image The image to attach
   * @param album The album the image is belonging to
   */
  static register(container: HTMLElement, image: Image, album: Set<Image>) {
    const item = uiComponent({ type: Html.Li })
    const canvas = this.renderImageCanvas(image, album)
    setTimeout(() => canvas.style.opacity = "1", 1)
    item.appendChild(canvas)
    container.appendChild(item)
  }

  /**
   * Render the canvas for the image
   * @param image The image to attach to the canvas
   * @param album The album the image belongs to 
   * @returns The composed HTML element   
   */
  static renderImageCanvas(image: Image, album: Set<Image>): HTMLElement {
    const canvas = uiComponent({
      type: Html.Div,
      classes: ["canvas"],
    })

    setDomEvents(canvas, {
      click: () => {
        emitSignal(ImageGallery.IMAGE_SELECTED_SIGNAL, {
          images: Array.from(album.values()),
          selected: image,
        })
      },
    })

    const imageComponent = uiComponent({
      type: Html.Img,
      attributes: {
        src: image.minPath,
        alt: image.name,
        loading: "lazy",
        background: "#fff",
      },
    }) as HTMLImageElement

    imageComponent.onload = () => setDomClasses(canvas, ["loaded"])

    setDomEvents(imageComponent, {
      load: () => (imageComponent.style.opacity = "1"),
    })

    canvas.appendChild(imageComponent)
    return canvas
  }
} 
