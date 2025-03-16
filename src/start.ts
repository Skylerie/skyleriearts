import { prefersDarkMode } from "./lib/browser.js";
import { getConfiguration, loadConfiguration } from "./lib/configuration.js";
import { Display } from "./lib/display.js";
import { setDomDataset } from "./lib/dom.js";
import { loadIcons } from "./lib/icons.js";
import { setNotFoundRoute, setRoute, showRoute } from "./lib/router.js";
import ImageService from "./services/image.js";
import BioView from "./views/bio/bio.js";
import { showErrorView } from "./views/error/error.js";
import HomeView from "./views/home/home.js";

/**
 * When the dynamic URL changes loads
 * the correspoding view from the URL
 */
window.addEventListener("hashchange", start);

/**
 * When the window is loaded load
 * the app state to show
 */
window.onload = async function() {

  await loadConfiguration("gtdf.config.json")
  Display.checkType()

  await loadIcons("material", `${getConfiguration("path")["icons"]}/materialicons.json`)
  await loadIcons("social", `${getConfiguration("path")["icons"]}/socialicons.json`)
  await ImageService.load()
  await start()
}

window.onresize = async function() {
  Display.checkType()
}

/** Start the web app     */
async function start() {

  setRoute("", HomeView.show)
  setRoute("bio", BioView.show)

  setNotFoundRoute(showErrorView)
  showRoute(window.location.hash.slice(1).toLowerCase(), document.body)
}






































































































