import { BubbleUI } from "../lib/bubble.js";
import { setDomEvents, setDomStyles, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";

let stickers = {
	Bojack: "Bojacksticker.png",
	Cuervo: "cuervo.png",
	"Da funk": "Dafunkyouwant.png",
	Desdentao: "Desdentaosticker.png",
	"Cat souls": "Dscat.png",
	"Focas 1": "Focassticker1.png",
	"Focas 2": "Focassticker2.png",
	Frieren: "Frierensticker.png",
	"Meowdalenas 1": "Gatosmuffin1.png",
	"Meowdalenas 2": "Gatosmuffin2.png",
	"Meowdalenas 3": "Gatosmuffin3.png",
	"Meowdalenas 4": "Gatosmuffin4.png",
	Gelp: "Glepsticker.png",
	Sardiboy: "sardiboy.png",
};

let currentStickerId = "Gelp";
let selected = false;

let currentSticker;

export async function showStickerView(
	parameters: string[],
	container: HTMLElement,
) {
	const view = uiComponent({
		type: Html.View,
		id: "home",
		classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYStart],
		styles: {
			width: "100%",
			height: "100%",
			transition: "top 5s, left 5s",
		},
	});

	setDomEvents(view, {
		mousemove: (e: MouseEvent) => {
			if (!selected || currentSticker == undefined) return;
			let x = e.clientX;
			let y = e.clientY;
			setDomStyles(currentSticker, {
				top: `calc(${y}px - ${currentSticker.offsetHeight / 2}px)`,
				left: `calc(${x}px - ${currentSticker.offsetWidth / 2}px)`,
			});
		},
	});

	let selector = uiComponent({
		type: Html.Img,
		attributes: {
			src: `resources/images/stickers/${stickers[currentStickerId]}`,
		},
		styles: {
			position: "fixed",
			width: "10rem",
			transform: "scale(1)",
			transition: "transform .25s",
			filter: "drop-shadow(.2rem .2rem rgba(0,0,0,0.15))",
		},
	});

	setDomStyles(selector, {
		top: `calc(50% - ${selector.offsetHeight / 2}px)`,
		left: `calc(50% - ${selector.offsetWidth / 2}px)`,
	});

	selector.onclick = () => {
		currentSticker = createSticker();
		view.appendChild(currentSticker);

		currentSticker.onclick = () => {
			selected = !selected;
			setDomStyles(currentSticker, {
				transform: selected ? "scale(1.2)" : "scale(1)",
			});
		};
	};

	view.appendChild(selector);
	container.appendChild(view);
}

function createSticker(): HTMLElement {
	let sticker = uiComponent({
		type: Html.Img,
		attributes: {
			src: `resources/images/stickers/${stickers[currentStickerId]}`,
		},
		styles: {
			position: "fixed",
			width: "10rem",
			transform: "scale(2)",
			filter: "drop-shadow(.2rem .2rem rgba(0,0,0,0.15))",
		},
	});

	return sticker;
}
