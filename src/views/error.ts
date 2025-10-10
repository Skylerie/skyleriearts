import { getErrorByCode } from '../errors/errors.js';
import { getConfiguration } from '../lib/configuration.js';
import { uiComponent } from '../lib/dom.js';
import { Html } from '../lib/html.js';

const DEFAULT_ERROR_CODE = 404;
const ID = 'error';
const IMAGE_ID = 'error-img';
const TITLE_ID = 'error-title';

export async function showErrorView(params: string[], container: HTMLElement) {
  const view = uiComponent({
    type: 'view',
    id: ID,
    classes: ['box-column', 'box-center']
  });

  const code = parseInt(params[0]);
  let error = getErrorByCode(code);

  // Default error set if no error parameter was given
  if (!error) {
    error = getErrorByCode(DEFAULT_ERROR_CODE);
  }

  // Image
  const image = uiComponent({
    type: Html.Img,
    id: IMAGE_ID,
    attributes: {
      src: `${getConfiguration('path')['icons']}/error.svg`
    }
  });
  view.appendChild(image);

  // Error title
  const title = uiComponent({
    type: Html.H1,
    id: TITLE_ID,
    text: error.friendly
  });

  view.appendChild(title);

  // Error description
  const description = uiComponent({
    type: Html.P,
    text: error.description
  });

  view.appendChild(description);
  container.appendChild(view);
}
