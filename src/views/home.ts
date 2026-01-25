import { BubbleUI } from '../lib/bubble.js';
import { uiComponent } from '../lib/dom.js';
import { Html } from '../lib/html.js';

/**
 * Show home view
 */
export async function showHomeView(parameters: string[], container: HTMLElement) {
  const view = uiComponent({
    type: Html.View,
    id: 'home',
    classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYStart]
  });

  const stickerLink = uiComponent({
    type: Html.A,
    text: 'Stickers',
    attributes: {
      href: '#/stickers'
    }
  });

  view.appendChild(stickerLink);
  container.appendChild(view);
}
