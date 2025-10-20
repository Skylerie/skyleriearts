import { BubbleUI } from "../../lib/bubble.js";
import { uuidv4 } from "../../lib/crypto.js";
import {
	setDomDataset,
	setDomEvents,
	setDomStyles,
	uiComponent,
} from "../../lib/dom.js";
import { Html } from "../../lib/html.js";
import { StickerService } from "./stickers.core.js";

enum SELECTION_MODE {
	NONE,
	SELECTING,
}

let selectionMode = SELECTION_MODE.NONE;
let currentSticker = undefined;
let currentStickerId = 0;

export async function showStickerView(
	parameters: string[],
	container: HTMLElement,
) {
	const view = uiComponent({
		type: Html.View,
		id: "stickers",
		classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYStart],
	});

	await StickerService.instance().loadCurrentStickerCatalogue();

	setDomEvents(view, {
		mousemove: (e: MouseEvent) => moveSelected(e),
		wheel: (e: WheelEvent) => rotateSelected(e),
	});

	let selector = uiComponent({
		type: Html.Img,
		id: "selector",
		attributes: {
			src: `resources/images/stickers/${StickerService.instance().getStickerFromCatalogueById(currentStickerId)}`,
		},
	}) as HTMLImageElement;

	selector.onclick = () => addNewSticker(view);

	const button1 = uiComponent({
		type: Html.Button,
		text: "<",
		styles: {
			fontWeight: "bold",
			fontSize: "2rem",
			height: "auto",
			padding: "1rem 3rem",
			position: "fixed",
		},
	});

	button1.onclick = () => {
		currentStickerId--;
		if (currentStickerId < 0) {
			currentStickerId = StickerService.instance().catalogue.length - 1;
		}
		selector.src = `resources/images/stickers/${StickerService.instance().getStickerFromCatalogueById(currentStickerId)}`;
	};

	const button2 = uiComponent({
		type: Html.Button,
		text: ">",
		styles: {
			fontWeight: "bold",
			fontSize: "2rem",
			height: "auto",
			padding: "1rem 3rem",
			position: "fixed",
		},
	});

	button2.onclick = () => {
		currentStickerId++;
		if (currentStickerId >= StickerService.instance().catalogue.length) {
			currentStickerId = 0;
		}
		selector.src = `resources/images/stickers/${StickerService.instance().getStickerFromCatalogueById(currentStickerId)}`;
	};

	view.appendChild(selector);
	view.appendChild(button1);
	view.appendChild(button2);
	container.appendChild(view);

	move(
		selector,
		`calc(95% - ${selector.offsetWidth}px)`,
		`calc(10% - ${selector.offsetHeight / 2}px)`,
	);
	move(
		button1,
		`calc(95% - ${selector.offsetWidth}px - 5rem)`,
		`calc(5% + 10rem)`,
	);
	move(
		button2,
		`calc(95% - ${selector.offsetWidth}px + 5rem)`,
		`calc(5% + 10rem)`,
	);

	loadMap(view);
}

function move(object: HTMLElement, x: string, y: string) {
	setDomStyles(object, { left: x, top: y });
	setDomDataset(object, { x: x, y: y });
}

function createSticker(): HTMLElement {
	let sticker = uiComponent({
		type: Html.Img,
		classes: ["sticker"],
		attributes: {
			src: `resources/images/stickers/${StickerService.instance().getStickerFromCatalogueById(currentStickerId)}`,
		},
		data: {
			uuid: uuidv4(),
		},
	});

	StickerService.instance().updateSticker(sticker.dataset.uuid, {
		id: currentStickerId,
		x: 0,
		y: 0,
		rotation: 0,
	});

	return sticker;
}

function addNewSticker(container: HTMLElement) {
	currentSticker = createSticker();
	container.appendChild(currentSticker);
	currentSticker.onclick = (e: Event) =>
		select(container, e.target as HTMLElement);
}

function select(container: HTMLElement, selectedSticker: HTMLElement) {
	if (selectionMode == SELECTION_MODE.NONE) {
		selectionMode = SELECTION_MODE.SELECTING;
	} else {
		selectionMode = SELECTION_MODE.NONE;
	}

	currentSticker = selectedSticker;
	for (const sticker of container.querySelectorAll("sticker")) {
		sticker.classList.remove("selected");
	}

	currentSticker.classList.toggle("selected");
}
function moveSelected(e: MouseEvent): void {
	if (selectionMode != SELECTION_MODE.SELECTING || currentSticker == undefined)
		return;
	move(
		currentSticker,
		`calc(${e.clientX}px - ${currentSticker.offsetWidth / 2}px)`,
		`calc(${e.clientY}px - ${currentSticker.offsetHeight / 2}px)`,
	);
}

function rotateSelected(e: WheelEvent): void {
	if (selectionMode != SELECTION_MODE.SELECTING || currentSticker == undefined)
		return;

	let rotation = 0;
	if (currentSticker.dataset.rotation != undefined) {
		rotation = parseInt(currentSticker.dataset.rotation);
	}

	rotation += e.deltaY > 0 ? 2 : -2;
	currentSticker.dataset.rotation = rotation;
	currentSticker.style.setProperty("--rotation", `${rotation}deg`);
}

function loadMap(view: HTMLElement) {
	let map = StickerService.instance().loadMap();
	for (let item in map) {
		console.log(item);
	}
}
