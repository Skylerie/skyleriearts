import { Header } from "../../components/header/header.js"
import { uiComponent } from "../../lib/dom.js"
import { connectToSignal } from "../../lib/signals.js"

export default class BioView {

  static readonly ABOUT_ME_TAG = "About me"
  static readonly SOCIAL_MEDIA_TAG = "Social media"
  static readonly PROJECT_TAG = "Projects"

  public static async show(parameters: string[], container: HTMLElement) {

    container.innerHTML = ""

    const options = new Set<string>()
    options.add(BioView.ABOUT_ME_TAG)
    options.add(BioView.SOCIAL_MEDIA_TAG)
    options.add(BioView.PROJECT_TAG)

    const header = Header.render(options)
    container.appendChild(header)

    const content = uiComponent({

    })

    connectToSignal(Header.OPTION_SELECTED_SIGNAL, async option => {
      switch (option) {
        case BioView.PROJECT_TAG:
          window.open("/#/", "_self")
          break
        case BioView.ABOUT_ME_TAG:
          BioView.renderAboutMe(content)
          break
        case BioView.SOCIAL_MEDIA_TAG:
          BioView.renderSocialMedia(content)
          break
        default: break;
      }
    })
    container.appendChild(content)
  }

  private static renderAboutMe(container: HTMLElement) {
    container.innerHTML = "About me"
  }

  private static renderSocialMedia(container: HTMLElement) {
    container.innerHTML = "Social media"
  }

}
