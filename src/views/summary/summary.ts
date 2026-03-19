import { BubbleUI } from "../../lib/bubble.js";
import { getConfiguration } from "../../lib/configuration.js";
import { uiComponent } from "../../lib/dom.js";
import { Html } from "../../lib/html.js";
import { httpGet } from "../../lib/http.js";
import Icons from "../../services/icons.js";

export async function showSummaryView(_: string[], container: HTMLElement) {
  const view = uiComponent({
    type: Html.View,
    id: "summary",
    classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter]
  });
  container.appendChild(view);

  const title = uiComponent({
    type: Html.Img,
    id: "logo",
    attributes: {
      src: `${getConfiguration("path")["images"]}/skyleriearts-logo.png`
    }
  });
  view.appendChild(title);

  const comment = uiComponent({
    type: Html.Text,
    id: "subtitle",
    text: "We are rebuilding this website!"
  });
  view.appendChild(comment);

  const merchBanner = uiComponent({
    id: "merch-banner",
    classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter]
  });
  view.appendChild(merchBanner);

  merchBanner.onclick = () => {
    window.open("https://skyleriearts.etsy.com", "_blank");
  };

  const merchTextColumn = uiComponent({});
  merchBanner.appendChild(merchTextColumn);

  const merchText = uiComponent({
    type: Html.P,
    id: "merch-text",
    text: "New merch available!"
  });
  merchTextColumn.appendChild(merchText);

  const merchText2 = uiComponent({
    type: Html.P,
    id: "merch-text-2",
    text: "Click here to visit the store."
  });
  merchTextColumn.appendChild(merchText2);

  const merchIcon = uiComponent({
    type: Html.Div
  });
  merchBanner.appendChild(merchIcon);

  const linksResponse = await httpGet({
    url: `${getConfiguration("path")["data"]}/social.json`,
    parameters: {}
  });

  const links = await linksResponse.json();
  const linkContainer = uiComponent({
    classes: [BubbleUI.BoxRow]
  });

  for (const name in links) {
    const socialButton = uiComponent({
      type: Html.A,
      text: name,
      classes: ["social-button"],

      attributes: {
        href: links[name],
        target: "_blank"
      }
    });
    linkContainer.appendChild(socialButton);
    Icons.load(`/resources/icons/${name}.svg`, (content) => (socialButton.innerHTML = content));
  }

  view.appendChild(linkContainer);

  Icons.load("/resources/icons/shopping_bag.svg", (content) => (merchIcon.innerHTML = content));
}
