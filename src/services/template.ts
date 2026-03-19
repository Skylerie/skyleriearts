export default class Templates {
  /**
   * Load the content of a given template
   * @param path the template path
   * @returns the template contents
   */
  static async getHTML(path: string): Promise<string> {
    try {
      let error: Error;
      const request = fetch(path);
      request.catch((err) => (error = err));

      const response = await request;
      if (error) {
        return undefined;
      }

      return await response.text();
    } catch (e) {
      return undefined;
    }
  }

  static async load(path: string, container: HTMLElement) {
    container.innerHTML = await Templates.getHTML(path);
  }
}
