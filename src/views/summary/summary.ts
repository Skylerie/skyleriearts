import { BubbleUI } from '../../lib/bubble.js';
import { getConfiguration } from '../../lib/configuration.js';
import { uiComponent } from '../../lib/dom.js';
import { Html } from '../../lib/html.js';
import { httpGet } from '../../lib/http.js';

export async function showSummaryView(
  parameters: string[],
  container: HTMLElement
) {
  const view = uiComponent({
    type: Html.View,
    id: 'summary',
    classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter],
    styles: {
      marginTop: '10rem'
    }
  });

  const title = uiComponent({
    type: Html.Img,
    attributes: {
      src: `${getConfiguration('path')['images']}/skyleriearts-logo.png`
    },
    styles: {
      width: '20rem'
    }
  });
  view.appendChild(title);

  const comment = uiComponent({
    type: Html.Text,
    text: 'We are rebuilding this website!',
    styles: {
      marginTop: '2rem',
      color: '#A870C3',
      fontSize: '1rem'
    }
  });
  view.appendChild(comment);

  const description = uiComponent({
    type: Html.Text,
    text: 'Contact me',
    styles: {
      marginTop: '5rem',
      color: '#A870C3',
      fontSize: '2rem',
      textDecoration: 'underline'
    }
  });
  view.appendChild(description);

  const linksResponse = await httpGet({
    url: `${getConfiguration('path')['data']}/social.json`,
    parameters: {}
  });

  const links = await linksResponse.json();

  for (const name in links) {
    const socialButton = uiComponent({
      type: Html.A,
      text: name,
      attributes: {
        href: links[name],
        target: '_blank'
      },
      styles: {
        marginTop: '1rem',
        fontSize: '1.5rem'
      }
    });
    view.appendChild(socialButton);
  }
  container.appendChild(view);
}
