import { httpGet } from "../lib/http.js";

export default class Icons {
  static async load(path: string, callback: (icon: string) => void) {
    const content = await httpGet({
      url: path,
      parameters: {}
    });

    callback(await content.text());
  }
}
