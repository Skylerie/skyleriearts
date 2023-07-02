import { getMaterialIcon } from "../../lib/gtd/material/materialicons.js";
import { UIComponent, setEvents, setStyles } from "../../lib/gtd/web/uicomponent.js";
export class Visualizer extends UIComponent {
    constructor() {
        super({
            type: "div",
            id: Visualizer.ID,
            classes: ["box-row", "box-center"],
        });
        setEvents(this.element, {
            click: (event) => {
                //if the click is not on the image, close the visualizer
                if (event.target != this.element) {
                    return;
                }
                event.stopPropagation();
                this.close();
            }
        });
        this.buttonClose = getMaterialIcon("close", {
            fill: "white",
            size: "48px",
        });
        setEvents(this.buttonClose.element, {
            click: () => {
                this.close();
            }
        });
        setStyles(this.buttonClose.element, {
            position: "absolute",
            top: "0px",
            right: "0px",
        });
        this.buttonBack = getMaterialIcon("back", {
            fill: "white",
            size: "48px",
        });
        setEvents(this.buttonBack.element, {
            click: () => this.showBack()
        });
        this.image = new UIComponent({
            type: "img",
            attributes: { src: "" },
        });
        this.buttonNext = getMaterialIcon("front", {
            fill: "white",
            size: "48px",
        });
        setEvents(this.buttonNext.element, {
            click: () => this.showNext()
        });
        this.infoText = new UIComponent({
            type: "p",
            id: Visualizer.INFO_TEXT_ID,
            text: "Touch outside the image to close the visualizer.",
            classes: ["info-text"],
        });
        this.buttonClose.element.id = Visualizer.BUTTON_CLOSE_ID;
        this.buttonBack.element.id = Visualizer.BUTTON_BACK_ID;
        this.buttonNext.element.id = Visualizer.BUTTON_NEXT_ID;
        this.buttonClose.appendTo(this);
        this.buttonBack.appendTo(this);
        this.image.appendTo(this);
        this.buttonNext.appendTo(this);
        this.infoText.appendTo(this);
    }
    async show(image, list) {
        console.log(image);
        this.list = list;
        this.index = list.indexOf(image);
        this.element.style.display = "flex";
        if (this.index == 0) {
            this.buttonBack.element.style.visibility = "hidden";
        }
        else {
            this.buttonBack.element.style.visibility = "visible";
        }
        if (this.index == list.length - 1) {
            this.buttonNext.element.style.visibility = "hidden";
        }
        else {
            this.buttonNext.element.style.visibility = "visible";
        }
        this.image.element.setAttribute("src", image);
    }
    showBack() {
        this.show(this.list[this.index - 1], this.list);
    }
    showNext() {
        this.show(this.list[this.index + 1], this.list);
    }
    close() {
        this.element.style.display = "none";
    }
}
Visualizer.ID = "visualizer";
Visualizer.BUTTON_CLOSE_ID = "close";
Visualizer.BUTTON_BACK_ID = "back";
Visualizer.BUTTON_NEXT_ID = "next";
Visualizer.INFO_TEXT_ID = "info-text";
