import { BubbleUI } from "../../lib/bubble.js";
import { getConfiguration } from "../../lib/configuration.js";
import { uiComponent } from "../../lib/dom.js";
import { Html } from "../../lib/html.js";
import { httpGet } from "../../lib/http.js";
import Icons from "../../services/icons.js";
import Templates from "../../services/template.js";

export async function showSummaryView(_: string[], container: HTMLElement) {
  const view = uiComponent({
    type: Html.View,
    id: "summary",
    classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter]
  });
  container.appendChild(view);

  await Templates.load("/views/summary.html", view);

  const linksResponse = await httpGet({
    url: `${getConfiguration("path")["data"]}/social.json`,
    parameters: {}
  });

  const links = await linksResponse.json();
  const linkContainer = uiComponent({ classes: [BubbleUI.BoxRow] });
  for (const name in links) {
    const socialButton = uiComponent({
      type: Html.A,
      text: "",
      classes: ["social-button", "hidden"],
      attributes: {
        href: links[name],
        target: "_blank"
      }
    });
    linkContainer.appendChild(socialButton);
    Icons.load(`/resources/icons/${name}.svg`, (content) => show(socialButton, content));
  }

  view.appendChild(linkContainer);
}

function show(container: HTMLElement, content: string): void {
  container.innerHTML = content;
  container.classList.remove("hidden");
}
