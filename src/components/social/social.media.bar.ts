import { HTML } from "../../lib/gtdf/components/dom";
import {
  UIComponent,
  UIProperties,
} from "../../lib/gtdf/components/uicomponent.js";
import { SocialIcons } from "../../lib/gtdf/resources/SocialIcons.js";
import { Gtdf } from "../../lib/others/gtdf.js";

export default class SocialMediaBar extends UIComponent {
  public constructor() {
    super({
      type: HTML.DIV,
      classes: [
        "social-media-bar",
        Gtdf.BOX_ROW,
        Gtdf.BOX_X_CENTER,
        Gtdf.BOX_Y_CENTER,
      ],
    });
    this.configure();
  }

  private configure(): void {
    const socialMedia = {
      twitter: "https://twitter.com/Skyleriearts",
      instagram: "https://www.instagram.com/skyleriie/",
      telegram: "https://t.me/skylerie",
      patreon: "https://www.patreon.com/skylerie",
    };

    for (const media in socialMedia) {
      const url = socialMedia[media];

      const button = new SocialMediaButton({
        icon: media,
        url: url,
      });
      button.appendTo(this);
    }
  }
}

interface SocialMediaButtonProperties {
  icon: string;
  url: string;
}

class SocialMediaButton extends UIComponent {
  public constructor(properties: SocialMediaButtonProperties) {
    super({
      type: HTML.A,
      classes: [Gtdf.BOX_CENTER],
      attributes: {
        href: properties.url,
      },
    });
    this.configure(properties);
  }

  private configure(properties: SocialMediaButtonProperties): void {
    const iconComponent = SocialIcons.get(properties.icon, {
      fill: "#444",
      size: "2rem",
      classes: ["material-icons"],
    });

    iconComponent.appendTo(this);
  }
}
