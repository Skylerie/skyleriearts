import { BubbleUI } from '../lib/bubble.js';
import { setConfiguration } from '../lib/configuration.js';
import { setDomDataset, setDomEvents, setDomStyles, uiComponent } from '../lib/dom.js';
import { Html } from '../lib/html.js';

let stickers = [
  'Glepsticker.png',
  'Bojacksticker.png',
  'cuervo.png',
  'Dafunkyouwant.png',
  'Desdentaosticker.png',
  'Dscat.png',
  'Focassticker1.png',
  'Focassticker2.png',
  'Frierensticker.png',
  'Gatosmuffin1.png',
  'Gatosmuffin2.png',
  'Gatosmuffin3.png',
  'Gatosmuffin4.png',
  'sardiboy.png'
];

interface StickerData {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

enum SELECTION_MODE {
  NONE,
  SELECTING
}

let state = {
  selectionMode: SELECTION_MODE.NONE,
  currentStickerId: 0,
  currentSticker: undefined,
  map: {}
};

export async function showStickerView(parameters: string[], container: HTMLElement) {
  const view = uiComponent({
    type: Html.View,
    id: 'stickers',
    classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYStart]
  });

  setDomEvents(view, {
    mousemove: (e: MouseEvent) => {
      if (state.selectionMode != SELECTION_MODE.SELECTING || state.currentSticker == undefined) return;
      move(
        state.currentSticker,
        `calc(${e.clientX}px - ${state.currentSticker.offsetWidth / 2}px)`,
        `calc(${e.clientY}px - ${state.currentSticker.offsetHeight / 2}px)`
      );
    },
    wheel: (e: WheelEvent) => {
      if (state.selectionMode != SELECTION_MODE.SELECTING || state.currentSticker == undefined) return;

      let rotation = 0;
      if (state.currentSticker.dataset.rotation != undefined) {
        rotation = parseInt(state.currentSticker.dataset.rotation);
      }

      rotation += e.deltaY > 0 ? 2 : -2;
      state.currentSticker.dataset.rotation = rotation;
      console.log('rotation:', rotation, 'delta:', e.deltaY);
      state.currentSticker.style.setProperty('--rotation', `${rotation}deg`);
    }
  });

  let selector = uiComponent({
    type: Html.Img,
    id: 'selector',
    attributes: {
      src: `resources/images/stickers/${stickers[state.currentStickerId]}`
    }
  }) as HTMLImageElement;

  selector.onclick = () => {
    state.currentSticker = createSticker();
    view.appendChild(state.currentSticker);

    state.currentSticker.onclick = (e) => {
      state.selectionMode = state.selectionMode == SELECTION_MODE.NONE ? SELECTION_MODE.SELECTING : SELECTION_MODE.NONE;
      state.currentSticker = e.target;

      for (const sticker of view.querySelectorAll('sticker')) {
        sticker.classList.remove('selected');
      }
      state.currentSticker.classList.toggle('selected');
    };
  };

  const button1 = uiComponent({
    type: Html.Button,
    text: '<',
    styles: {
      fontWeight: 'bold',
      fontSize: '2rem',
      height: 'auto',
      padding: '1rem 3rem',
      position: 'fixed'
    }
  });

  button1.onclick = () => {
    state.currentStickerId--;
    if (state.currentStickerId < 0) {
      state.currentStickerId = stickers.length - 1;
    }
    selector.src = `resources/images/stickers/${stickers[state.currentStickerId]}`;
  };

  const button2 = uiComponent({
    type: Html.Button,
    text: '>',
    styles: {
      fontWeight: 'bold',
      fontSize: '2rem',
      height: 'auto',
      padding: '1rem 3rem',
      position: 'fixed'
    }
  });

  button2.onclick = () => {
    state.currentStickerId++;
    if (state.currentStickerId >= stickers.length) {
      state.currentStickerId = 0;
    }
    selector.src = `resources/images/stickers/${stickers[state.currentStickerId]}`;
  };

  view.appendChild(selector);
  view.appendChild(button1);
  view.appendChild(button2);
  container.appendChild(view);

  move(selector, `calc(95% - ${selector.offsetWidth}px)`, `calc(10% - ${selector.offsetHeight / 2}px)`);
  move(button1, `calc(95% - ${selector.offsetWidth}px - 5rem)`, `calc(5% + 10rem)`);
  move(button2, `calc(95% - ${selector.offsetWidth}px + 5rem)`, `calc(5% + 10rem)`);
}

function move(object: HTMLElement, x: string, y: string) {
  setDomStyles(object, { left: x, top: y });
  setDomDataset(object, { x: x, y: y });
}

function createSticker(): HTMLElement {
  console.log(state.currentStickerId);
  let sticker = uiComponent({
    type: Html.Img,
    classes: ['sticker'],
    attributes: {
      src: `resources/images/stickers/${stickers[state.currentStickerId]}`
    }
  });

  updateSticker(state.currentStickerId, {
    id: state.currentStickerId,
    x: 0,
    y: 0,
    rotation: 0
  });

  return sticker;
}

function updateSticker(id: number, sticker: StickerData) {
  state.map[id] = sticker;
  setConfiguration('stickers.map', JSON.stringify(state.map));
}
