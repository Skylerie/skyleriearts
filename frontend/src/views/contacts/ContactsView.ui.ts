import { UIComponent, setStyles } from "../../lib/gtd/web/uicomponent.js";
import { ViewUI } from "../../lib/gtdf/views/ViewUI.js";
import { getSocialIcon } from "../../lib/socialicons.js";

export class ContactsView extends ViewUI {

    private static ID = "contacts";
    private static BOX_CLASS = "social-box";
    

    constructor(){
        super({
            type: "view",
            id: ContactsView.ID,
            classes: ["box-column","box-center"],
        });
    }


    public async show(params : string[], container : UIComponent): Promise<void> {
 
        this.createSocialBox("twitter","Skyleriearts","https://twitter.com/Skyleriearts");
        this.createSocialBox("instagram","Skyleriie","https://www.instagram.com/skyleriie/");
        this.createSocialBox("telegram","SkylerieArt","https://t.me/skylerie");

        this.appendTo(container);
    }

    createSocialBox(icon : string, text : string, link : string){

        const twitterBox = new UIComponent({
            type: "a",
            classes: ["box-row", "box-center", "box-x-start", ContactsView.BOX_CLASS],
            attributes: {
                href: link,
                target: "_blank",
            },
        });

        const iconComponent = getSocialIcon(icon, {
            fill: "white",
            size: "2.5rem",
        });

        setStyles(iconComponent.element, {
            margin: "0 .5rem",
        });

        const textComponent = new UIComponent({
            type: "p",
            text: text
        });

        iconComponent.appendTo(twitterBox);
        textComponent.appendTo(twitterBox);
        twitterBox.appendTo(this);
    }

}