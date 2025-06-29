import { setDomDataset } from "../lib/dom.js"

export class Theme {

  static toggle() {
    if (document.documentElement.dataset.theme == "dark") {
      setDomDataset(document.documentElement, { theme: "light" })
    } else {
      setDomDataset(document.documentElement, { theme: "dark" })
    }

  }


}
