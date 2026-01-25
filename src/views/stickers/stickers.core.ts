import { getConfiguration, setConfiguration } from "../../lib/configuration.js";

interface StickerData {
	id: number;
	x: number;
	y: number;
	rotation: number;
}

export class StickerService {
	private static _instance: StickerService;

	items = {};
	catalogue: string[] = [];

	static instance() {
		if (undefined === this._instance) this._instance = new StickerService();
		return this._instance;
	}

	async loadCurrentStickerCatalogue() {
		this.catalogue = [
			"Glepsticker.png",
			"Bojacksticker.png",
			"cuervo.png",
			"Dafunkyouwant.png",
			"Desdentaosticker.png",
			"Dscat.png",
			"Focassticker1.png",
			"Focassticker2.png",
			"Frierensticker.png",
			"Gatosmuffin1.png",
			"Gatosmuffin2.png",
			"Gatosmuffin3.png",
			"Gatosmuffin4.png",
			"sardiboy.png",
		];
	}
	loadMap() {
		let map = getConfiguration("stickers.map");
		if (undefined == map) {
			setConfiguration("stickers.map", JSON.stringify("{}"));
			map = "{}";
		}
		return JSON.parse(map);
	}

	getStickerFromCatalogueById(id: number) {
		return undefined != this.catalogue ? this.catalogue[id] : undefined;
	}

	updateSticker(id: string, sticker: StickerData) {
		this.items[id] = sticker;
		setConfiguration("stickers.map", JSON.stringify(this.items));
	}
}
