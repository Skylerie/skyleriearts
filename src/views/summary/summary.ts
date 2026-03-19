import { BubbleUI } from "../../lib/bubble.js";
import { uiComponent } from "../../lib/dom.js";
import { Html } from "../../lib/html.js";
import Templates from "../../services/template.js";

export async function showSummaryView(_: string[], container: HTMLElement) {
  const view = uiComponent({
    type: Html.View,
    id: "summary",
    classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter, "hidden"]
  });
  container.appendChild(view);

  await Templates.load("/views/summary.html", view);
  const logo = document.getElementById("logo") as HTMLImageElement;
  logo.addEventListener("load", () => view.classList.remove("hidden"));

  const merchBanner = document.getElementById("merch-banner") as HTMLImageElement;
  merchBanner.onclick = () => window.open("https://skyleriearts.etsy.com", "_blank");
}
