import { ImageGallery } from "../../components/gallery/gallery.js";
import { Header } from "../../components/header/header.js";
import { Visualizer, VisualizerProcessor } from "../../components/visualizer/visualizer.js";
import { BubbleUI } from "../../lib/bubble.js";
import { getConfiguration } from "../../lib/configuration.js";
import { Display } from "../../lib/display.js";
import { setDomDataset, setDomEvents, uiComponent } from "../../lib/dom.js";
import { Html } from "../../lib/html.js";
import { connectToSignal, emitSignal, setSignal } from "../../lib/signals.js";
import ImageService from "../../services/image.js";


export default class HomeView {

  // HTML ids and classes
  static readonly VIEW_ID = "home"
  static readonly VIEW_HEADER_ID = "view-header"
  static readonly TITLE_BAR_ID = "title-bar"
  static readonly TITLE_ID = "title"

  // Signals
  static readonly PROJECT_SELECTED_SIGNAL: string = setSignal()

  // Data
  static readonly visualizerProcessor: VisualizerProcessor = new VisualizerProcessor()

  /**
  * Show home view
  */
  static async show(parameters: string[], container: HTMLElement) {

    const categories = new Set(ImageService.getCategories())
    const view = uiComponent({
      type: Html.View,
      id: HomeView.VIEW_ID,
      classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYStart],
    })

    const selectedCategory = parameters[0] || categories.values().next().value
    const visualizer = Visualizer.render(HomeView.visualizerProcessor)
    const header = Header.render(categories)

    const galleryContainer = uiComponent({
      type: Html.Div,
      id: "gallery-container",
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxXStart, BubbleUI.BoxYStart],
    });

    connectToSignal(Header.OPTION_SELECTED_SIGNAL, async category => HomeView.showImages(galleryContainer, category, undefined))
    connectToSignal(HomeView.PROJECT_SELECTED_SIGNAL, async data => HomeView.showImages(galleryContainer, data?.category, data?.project))

    view.appendChild(header)
    view.appendChild(galleryContainer)
    view.appendChild(visualizer)
    container.appendChild(view)

    if (Display.isMobile() == false)
      emitSignal(Header.OPTION_SELECTED_SIGNAL, selectedCategory)
  }

  /**
   * Show the projects of the selected tag
   * @param container The container of the gallery
   * @param currentCategoryName The selected tag
   * @param currentProject The selected project
   */
  private static async showImages(container: HTMLElement, currentCategoryName: string, currentProjectName: string): Promise<void> {

    // If container is not present, return
    if (undefined == container) {
      console.error(`Undefined container.`)
      return
    }

    // If tag is not selected, return
    if (undefined == currentCategoryName) {
      console.error(`Tag ${currentCategoryName} not found.`)
      return
    }

    // If the project is not found, return
    const projects = ImageService.getProjectsOfCategory(currentCategoryName)
    if (undefined == projects || 0 == projects.size) {
      console.error(`No projects present.`)
      return
    }

    // Get current project
    if (currentProjectName == undefined) currentProjectName = projects.values().next().value

    const projectChanged = container.dataset.project != currentProjectName
    const categoryChanged = container.dataset.category != currentCategoryName

    if (categoryChanged) {

      if (!Display.isMobile()) {

        // Disappear animation
        container.style.opacity = "0";
        await new Promise(resolve => setTimeout(resolve, 500))

      }
      container.innerHTML = ""

      const viewHeader = uiComponent({
        id: HomeView.VIEW_HEADER_ID
      })

      const titleBar = uiComponent({
        classes: [BubbleUI.BoxRow, BubbleUI.BoxXBetween, BubbleUI.BoxYCenter],
        id: HomeView.TITLE_BAR_ID,
        styles: {
          width: "100%"
        }
      })

      const title = uiComponent({
        type: Html.H1,
        text: currentCategoryName,
        id: "title"
      })
      titleBar.appendChild(title)

      if (Display.isMobile()) {
        const icon = uiComponent({
          type: Html.Img,
          attributes: {
            src: getConfiguration("path")["icons"] + "/menu-icon.svg"
          }
        })
        titleBar.appendChild(icon)

        setDomEvents(icon, {
          click: () => { Header.toggle() }
        })
      }
      viewHeader.appendChild(titleBar)

      const bar = HomeView.renderProjectBar(projects, currentProjectName, currentCategoryName)
      viewHeader.appendChild(bar)

      container.appendChild(viewHeader)
      this.render(container, currentProjectName, currentCategoryName)

      // appear animation
      container.style.opacity = "1";
      await new Promise(resolve => setTimeout(resolve, 260))

    } else if (projectChanged) {
      let title = container.querySelector("#title")
      title.innerHTML = currentCategoryName

      this.render(container, currentProjectName, currentCategoryName)
    }

    setDomDataset(container, {
      project: currentProjectName,
      category: currentCategoryName
    })

  }

  private static async render(container: HTMLElement, currentProjectName: string, currentCategoryName: string) {

    // Create the project gallery
    const images = ImageService.getImagesByProjectAndCategory(currentProjectName, currentCategoryName)

    let gallery = document.querySelector(`.${ImageGallery.CLASS}`)
    if (null == gallery) {

      gallery = ImageGallery.render(images)
      connectToSignal(ImageGallery.IMAGE_SELECTED_SIGNAL, async data => {
        HomeView.visualizerProcessor.load(data.images)
        HomeView.visualizerProcessor.set(data.selected)
        Visualizer.render(HomeView.visualizerProcessor)
        Visualizer.show()
      })
      container.appendChild(gallery)
    } else {
      this.selectProject(container, currentProjectName)
      ImageGallery.update(gallery as HTMLElement, images)
    }
  }

  /**
   * Render the project bar
   * @param projects The projects to add to the bar
   * @param currentProjectName The current selected project name
   * @param categoryName The current category name 
   * @returns The composed HTML element
   */
  private static renderProjectBar(projects: Set<string>, currentProjectName: string, categoryName: string): HTMLElement {
    const bar = uiComponent({
      type: Html.Div,
      id: "project-bar",
      classes: [BubbleUI.BoxRow, BubbleUI.BoxXCenter, BubbleUI.BoxYStart],
    })

    projects.forEach(project => {
      const button = uiComponent({
        type: Html.Button,
        text: project,
        classes: project == currentProjectName ? ["selected"] : [],
      })

      button.onclick = () => emitSignal(HomeView.PROJECT_SELECTED_SIGNAL, {
        category: categoryName,
        project: project,
      })

      bar.appendChild(button)
    })

    return bar
  }

  private static selectProject(container: HTMLElement, currentProject: string) {

    const buttons = container.querySelectorAll(`#project-bar button`)
    console.log(buttons);

    for (const button of buttons) {
      const htmlButton = button as HTMLButtonElement
      if (htmlButton.textContent == currentProject) {
        htmlButton.classList.add("selected")
      } else {
        htmlButton.classList.remove("selected")
      }
    }

  }

}
