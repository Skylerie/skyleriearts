import { getConfiguration } from "../lib/configuration.js"
import { Image } from "../models/image.js"

export default class ImageService {

  private static categories: Map<string, Set<Image>> = new Map()

  /**
   * Load the data from external resource
   */
  static async load() {
    const response = await fetch(`${getConfiguration("path")["resources"]}/data/images.json`)
    const data = await response.json()

    ImageService.categories = new Map()
    for (const imageName in data) {
      const image = data[imageName]

      for (const categoryName of image.categories) {
        if (ImageService.categories.has(categoryName)) {
          ImageService.categories.get(categoryName).add(image)
        } else {
          ImageService.categories.set(categoryName, new Set([image]))
        }
      }
    }
  }

  /**
   * Get image by name
   * @param name The image name
   * @returns the image with that name
   */
  static getImage(name: string): Image {
    for (const categoryName in ImageService.categories.values()) {
      const images = ImageService.categories.get(categoryName)
      for (const image of images) {
        if (image.name === name)
          return image
      }
    }
  }

  /**
   * Get the images belonging to a project and a category
   * @param project The project name
   * @param category The category name 
   * @returns the images belonging to the project and category 
   */
  static getImagesByProjectAndCategory(project: string, category: string): Set<Image> {

    const foundImages = new Set<Image>()
    ImageService.categories.get(category)?.forEach(image => {
      if (-1 != image.projects.indexOf(project)) {
        foundImages.add(image)
      }
    })

    return foundImages
  }

  /**
   * Get all the categories 
   * @returns The categories 
   */
  static getCategories(): Set<string> {
    return new Set(ImageService.categories.keys())
  }

  /**
   * Get the project of a category
   * @returns The projects of a category
   */
  static getProjectsOfCategory(category: string): Set<string> {

    const found = new Set<string>()
    for (const images of ImageService.categories.get(category)) {
      for (const project of images.projects) {
        found.add(project)
      }
    }
    return found
  }
}
