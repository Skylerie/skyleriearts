(function () {
    'use strict';

    /**
    * The id of the configuration used in the LocalStorage API
    * NOTE: Change this value with your app name.
    */
    const configurationId = "skyleriearts-website-config";
    /**
     * Load a JSON file as the configuration of the app
     * @param path The file path
     */
    async function loadConfiguration(path) {
        const loadedConfiguration = await fetch(path).then(res => res.json());
        localStorage[configurationId] = JSON.stringify(loadedConfiguration);
    }
    /**
     * Set a configuration parameter
     * @param id The configuration parameter id
     * @param value The value to set
     */
    function setConfiguration(id, value) {
        const configuration = JSON.parse(localStorage[configurationId] || "{}");
        configuration[id] = value;
        localStorage.setItem(configurationId, JSON.stringify(configuration));
    }
    /**
     * Get configuration value
     * @param id The parameter id
     * @returns The parameter value
     */
    function getConfiguration(id) {
        const configuration = JSON.parse(localStorage[configurationId]);
        return configuration[id];
    }

    const SMALL_DEVICE_WIDTH = 760;
    const MEDIUM_DEVICE_WIDTH = 1024;
    /**
    * Get if the device is a small device
    * @returns True if the device is a small device
    */
    function isSmallDevice() {
        return window.matchMedia(`only screen and (max-width: ${SMALL_DEVICE_WIDTH}px)`).matches;
    }
    /**
    * Get if the device is a medium device
    * @returns True if the device is a medium device
    */
    function isMediumDevice() {
        return window.matchMedia(`only screen and (min-width: ${SMALL_DEVICE_WIDTH}px) and (max-width: ${MEDIUM_DEVICE_WIDTH}px)`).matches;
    }
    /**
    * Get if matches one of the mobile media queries
    * @returns True if the device is a mobile device
    */
    function isMobile() {
        return (navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
            navigator.userAgent.match(/Opera Mini/i) ||
            navigator.userAgent.match(/IEMobile/i));
    }

    /** Create a DOM element */
    function uiComponent(properties) {
        const element = document.createElement(properties.type || "div");
        element.innerHTML = undefined != properties.text ? properties.text : "";
        if (undefined != properties.id)
            element.id = properties.id;
        setDomClasses(element, properties.classes);
        setDomAttributes(element, properties.attributes);
        setDomStyles(element, properties.styles);
        setDomDataset(element, properties.data);
        if (false == properties.selectable) {
            setDomStyles(element, { userSelect: "none" });
        }
        return element;
    }
    /** Set DOM attributes */
    function setDomAttributes(element, attributes) {
        if (undefined == element || undefined == attributes)
            return element;
        for (const key in attributes)
            element.setAttribute(key, attributes[key]);
        return element;
    }
    /** Set DOM classes */
    function setDomClasses(element, classes) {
        if (undefined == element || undefined == classes)
            return element;
        for (const cl of classes) {
            element.classList.add(cl);
        }
        return element;
    }
    /** Set DOM styles */
    function setDomStyles(element, styles) {
        if (undefined == element || undefined == styles)
            return element;
        for (const key in styles)
            element.style[key] = styles[key];
        return element;
    }
    /** Set DOM events*/
    function setDomEvents(element, events) {
        if (undefined == element || undefined == events)
            return element;
        for (const key in events)
            element.addEventListener(key, events[key]);
        return element;
    }
    /** Set DOM dataset */
    function setDomDataset(element, dataset) {
        if (undefined == element || undefined == dataset)
            return element;
        for (const key in dataset)
            element.dataset[key] = dataset[key];
        return element;
    }

    class Display {
        static checkType() {
            if (isMobile() || isSmallDevice() || isMediumDevice()) {
                setDomDataset(document.documentElement, {
                    display: "mobile"
                });
                setConfiguration("display", "mobile");
                return;
            }
            setDomDataset(document.documentElement, {
                display: "desktop"
            });
            setConfiguration("display", "desktop");
        }
        static isMobile() {
            return "mobile" == getConfiguration("display");
        }
    }

    const icons = new Map();
    /**
     * Load icon collection from the given path
     * WARNING: Icon collection must be a json file
     * with svg contents for each key.
     *
     * @param id The id to set to the collection
     * @param path The path to search the collection for
     */
    async function loadIcons(id, path) {
        const collection = await fetch(path).then(res => res.json()).catch(console.error);
        icons.set(id, collection);
    }
    /**
     * Get an icon from current bundle
     * @param collectionId The id of the collection to search in
     * @param key The id of the icon to search for
     * @param size (Optional) The size to apply to the icon, applies 24px by default
     * @param fill (Optional) The color to fill the icon, applies #222222 by default
     * @returns HTMLElement with the svg element inside, nothing if the icon or collection does not exist
     */
    function getIcon(collectionId, key, size = "24px", fill = "#222222") {
        const collection = icons.get(collectionId);
        if (undefined == collection)
            return undefined;
        const content = collection[key];
        if (undefined == content)
            return undefined;
        const svg = `<svg height="${size}" width="${size}" viewBox="0 0 24 24" fill="${fill}">${content || ""}</svg>`;
        return uiComponent({ type: "div", text: svg });
    }

    const paths = new Map();
    let homeHandler = async (_p, c) => { c.innerHTML = "Home page."; };
    let notFoundHandler = async (_p, c) => { c.innerHTML = "Page not found."; };
    /**
     * Register a new route.
     * @param path The router path
     * @param handler The route handler
     */
    function setRoute(path, handler) {
        // If the path is empry return 
        if (undefined == path)
            return;
        // If the path is blank or /, register home and return
        path = path.trim();
        // If the path is home
        if ("/" == path || "" == path) {
            homeHandler = handler;
            return;
        }
        // If the path ends with / trim it
        const indexOfSlash = path.indexOf("/");
        if (-1 != indexOfSlash && "/" == path.substring(path.length - 1))
            path = path.substring(0, path.length - 1);
        // Replace all the variables with regex expressions to capture them later
        const regexp = /\/(\$+)/g;
        path = path.replaceAll(regexp, "/([^\/]+)");
        paths.set(path, handler);
        console.debug(`Set route ${path}`);
    }
    /**
     * Register the route to display when route path is not found.
     * @param handler The view handler to call
     */
    function setNotFoundRoute(handler) {
        notFoundHandler = handler;
    }
    /**
     * Show view for the given route.
     * @param path The given path to search for
     * @param container The container to display the views in
     */
    function showRoute(path, container) {
        container.innerHTML = "";
        // If it is the home route, show
        if ("/" == path || "" == path) {
            homeHandler([], container);
            return;
        }
        // Else search matching route
        const keys = Array.from(paths.keys()).sort(compareRouteLength);
        for (const route of keys) {
            // Check if route matches
            const regexp = RegExp(route);
            const params = path.match(regexp);
            if (null != params && 0 != params.length) {
                paths.get(route)(params.slice(1), container);
                return;
            }
        }
        // If no route found, show not found view.
        notFoundHandler([], container);
    }
    /**
     * Compare the length of two routes
     */
    function compareRouteLength(a, b) {
        const aLength = a.split("/").length - 1;
        const bLength = b.split("/").length - 1;
        if (aLength == bLength)
            return 0;
        if (aLength < bLength)
            return 1;
        return -1;
    }

    class ImageService {
        /**
         * Load the data from external resource
         */
        static async load() {
            const response = await fetch(`${getConfiguration("path")["resources"]}/data/images.json`);
            const data = await response.json();
            ImageService.categories = new Map();
            for (const imageName in data) {
                const image = data[imageName];
                for (const categoryName of image.categories) {
                    if (ImageService.categories.has(categoryName)) {
                        ImageService.categories.get(categoryName).add(image);
                    }
                    else {
                        ImageService.categories.set(categoryName, new Set([image]));
                    }
                }
            }
        }
        /**
         * Get image by name
         * @param name The image name
         * @returns the image with that name
         */
        static getImage(name) {
            for (const categoryName in ImageService.categories.values()) {
                const images = ImageService.categories.get(categoryName);
                for (const image of images) {
                    if (image.name === name)
                        return image;
                }
            }
        }
        /**
         * Get the images belonging to a project and a category
         * @param project The project name
         * @param category The category name
         * @returns the images belonging to the project and category
         */
        static getImagesByProjectAndCategory(project, category) {
            const foundImages = new Set();
            ImageService.categories.get(category)?.forEach(image => {
                if (-1 != image.projects.indexOf(project)) {
                    foundImages.add(image);
                }
            });
            return foundImages;
        }
        /**
         * Get all the categories
         * @returns The categories
         */
        static getCategories() {
            return new Set(ImageService.categories.keys());
        }
        /**
         * Get the project of a category
         * @returns The projects of a category
         */
        static getProjectsOfCategory(category) {
            const found = new Set();
            for (const images of ImageService.categories.get(category)) {
                for (const project of images.projects) {
                    found.add(project);
                }
            }
            return found;
        }
    }
    ImageService.categories = new Map();

    /**
     * This enum represents the Bubble UI css framework
     */
    var BubbleUI;
    (function (BubbleUI) {
        BubbleUI["BoxColumn"] = "box-column";
        BubbleUI["BoxRow"] = "box-row";
        BubbleUI["boxWrap"] = "box-warp";
        BubbleUI["BoxCenter"] = "box-center";
        BubbleUI["BoxXCenter"] = "box-x-center";
        BubbleUI["BoxYCenter"] = "box-y-center";
        BubbleUI["BoxXStart"] = "box-x-start";
        BubbleUI["BoxXEnd"] = "box-x-end";
        BubbleUI["BoxYStart"] = "box-y-start";
        BubbleUI["BoxXBetween"] = "box-x-between";
        BubbleUI["TextCenter"] = "text-center";
    })(BubbleUI || (BubbleUI = {}));

    /**
     * This enum contains the most common HTML tags
     */
    var Html;
    (function (Html) {
        Html["View"] = "view";
        Html["Div"] = "div";
        Html["Span"] = "span";
        Html["Input"] = "input";
        Html["Button"] = "button";
        Html["Textarea"] = "textarea";
        Html["Select"] = "select";
        Html["Option"] = "option";
        Html["Form"] = "form";
        Html["Label"] = "label";
        Html["Img"] = "img";
        Html["A"] = "a";
        Html["B"] = "b";
        Html["Table"] = "table";
        Html["Thead"] = "thead";
        Html["Tbody"] = "tbody";
        Html["Tr"] = "tr";
        Html["Th"] = "th";
        Html["Td"] = "td";
        Html["I"] = "i";
        Html["Ul"] = "ul";
        Html["Li"] = "li";
        Html["Nav"] = "nav";
        Html["Header"] = "header";
        Html["Footer"] = "footer";
        Html["Section"] = "section";
        Html["Article"] = "article";
        Html["Aside"] = "aside";
        Html["H1"] = "h1";
        Html["H2"] = "h2";
        Html["H3"] = "h3";
        Html["H4"] = "h4";
        Html["H5"] = "h5";
        Html["H6"] = "h6";
        Html["P"] = "p";
        Html["Hr"] = "hr";
        Html["Br"] = "br";
        Html["Canvas"] = "canvas";
        Html["Svg"] = "svg";
        Html["Path"] = "path";
        Html["Polygon"] = "polygon";
        Html["Polyline"] = "polyline";
        Html["Circle"] = "circle";
        Html["Ellipse"] = "ellipse";
        Html["Rect"] = "rect";
        Html["Line"] = "line";
        Html["Text"] = "text";
        Html["Tspan"] = "tspan";
        Html["G"] = "g";
        Html["Mask"] = "mask";
        Html["Pattern"] = "pattern";
        Html["Defs"] = "defs";
        Html["Symbol"] = "symbol";
        Html["Use"] = "use";
        Html["Clippath"] = "clipPath";
        Html["Stop"] = "stop";
        Html["LinearGradient"] = "linearGradient";
        Html["RadialGradient"] = "radialGradient";
        Html["Filter"] = "filter";
    })(Html || (Html = {}));

    function uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16));
    }

    const buffer = new Map();
    /**
     * Set a new signal
     */
    function setSignal() {
        const id = uuidv4();
        buffer.set(id, []);
        return id;
    }
    /**
     * Connect a function to a signal
     * @param id The signal id
     * @param handler The signal handler function
     */
    function connectToSignal(id, handler) {
        if (false == buffer.has(id)) {
            console.error(`Error connecting: The signal ${id} does not exist.`);
            return;
        }
        buffer.get(id).push(handler);
    }
    function disconnectSignal(id) {
        if (false == buffer.has(id)) {
            console.error(`Error connecting: The signal ${id} does not exist.`);
            return;
        }
        buffer.set(id, []);
    }
    /**
     * Emit a signal with the given dat
     */
    async function emitSignal(id, data) {
        if (false == buffer.has(id))
            return;
        const targets = buffer.get(id);
        for (const target of targets) {
            target(data);
        }
    }

    /**
     * This class represents the header of the application
     * it is static because only one is needed across th app.
     */
    class Header {
        /**
         * Render the header
         * @param options The header options
         * @returns The composed HTML element
         */
        static render(options) {
            if (isMobile() || isSmallDevice() || isMediumDevice()) {
                this.toggleEnabled = true;
            }
            disconnectSignal(this.OPTION_SELECTED_SIGNAL);
            let header = uiComponent({
                type: Html.Div,
                id: Header.HEADER_ID,
                classes: [BubbleUI.BoxColumn, BubbleUI.BoxXStart, BubbleUI.BoxYCenter],
            });
            const profilePicture = uiComponent({
                type: Html.Img,
                id: "logo",
                attributes: {
                    src: `${getConfiguration("path")["images"]}/logo.jpg`,
                },
            });
            setDomEvents(profilePicture, {
                click: () => window.open("/#/bio", "_self")
            });
            const title = uiComponent({
                type: Html.H1,
                text: "Skylerie",
                id: "title",
                classes: [BubbleUI.TextCenter],
            });
            const selected = options.values().next().value;
            const tagMenu = this.drawOptions(options, selected);
            header.appendChild(profilePicture);
            header.appendChild(title);
            header.appendChild(tagMenu);
            return header;
        }
        /**
         * Draw the options of the menu
         * @param options The options to show
         * @param selected The selected option
         * @returns The composed HTML element
         */
        static drawOptions(options, selected) {
            const menu = uiComponent({
                type: Html.Div,
                id: Header.TAG_MENU_ID,
                classes: [BubbleUI.BoxColumn, BubbleUI.BoxXStart, BubbleUI.BoxYStart],
            });
            options.forEach(option => {
                const button = uiComponent({
                    type: Html.Button,
                    text: option,
                    classes: selected == option ? [Header.TAG_BUTTON_CLASS, "selected"] : [Header.TAG_BUTTON_CLASS],
                });
                setDomEvents(button, {
                    click: (e) => {
                        if (!this.toggleEnabled && e.target.classList.contains("selected"))
                            return;
                        const buttons = document.querySelectorAll(`#${Header.HEADER_ID} .${Header.TAG_BUTTON_CLASS}`);
                        buttons.forEach(b => b.classList.remove("selected"));
                        button.classList.add("selected");
                        Header.toggle();
                        emitSignal(Header.OPTION_SELECTED_SIGNAL, option);
                    }
                });
                menu.appendChild(button);
            });
            return menu;
        }
        static toggle() {
            if (!this.toggleEnabled)
                return;
            document.getElementById(this.HEADER_ID).classList.toggle("hide");
        }
    }
    Header.HEADER_ID = "header";
    Header.TAG_MENU_ID = "tag-menu";
    Header.TAG_BUTTON_CLASS = "tag-button";
    Header.toggleEnabled = false;
    Header.OPTION_SELECTED_SIGNAL = setSignal();

    class BioView {
        static async show(parameters, container) {
            container.innerHTML = "";
            const options = new Set();
            options.add(BioView.ABOUT_ME_TAG);
            options.add(BioView.SOCIAL_MEDIA_TAG);
            options.add(BioView.PROJECT_TAG);
            const header = Header.render(options);
            container.appendChild(header);
            const content = uiComponent({});
            connectToSignal(Header.OPTION_SELECTED_SIGNAL, async (option) => {
                switch (option) {
                    case BioView.PROJECT_TAG:
                        window.open("/#/", "_self");
                        break;
                    case BioView.ABOUT_ME_TAG:
                        BioView.renderAboutMe(content);
                        break;
                    case BioView.SOCIAL_MEDIA_TAG:
                        BioView.renderSocialMedia(content);
                        break;
                }
            });
            container.appendChild(content);
        }
        static renderAboutMe(container) {
            container.innerHTML = "About me";
        }
        static renderSocialMedia(container) {
            container.innerHTML = "Social media";
        }
    }
    BioView.ABOUT_ME_TAG = "About me";
    BioView.SOCIAL_MEDIA_TAG = "Social media";
    BioView.PROJECT_TAG = "Projects";

    const errors = {
        200: {
            code: 200,
            message: "Success",
            friendly: "Success",
            description: "The operation succeded.",
        },
        400: {
            code: 400,
            message: "Bad request",
            friendly: "The request is not valid",
            description: "The parameters may be wrong or missing.",
        },
        401: {
            code: 401,
            message: "Unauthorized",
            friendly: "You have no permissions to access this content 🔐",
            description: "The content is protected, contact the administrator to get access.",
        },
        404: {
            code: 404,
            message: "Not found",
            friendly: "We can't find the page you are looking for 😓",
            description: "The page you're searching for is no longer available.",
        },
        500: {
            code: 500,
            message: "Internal server error",
            friendly: "Ups, something went wrong 😓",
            description: "The server is experimenting an unexpected error, contact the administrator for more information.",
        },
    };
    function getErrorByCode(code) {
        return errors[code];
    }

    const DEFAULT_ERROR_CODE = 404;
    const ID = "error";
    const IMAGE_ID$1 = "error-img";
    const TITLE_ID = "error-title";
    async function showErrorView(params, container) {
        const view = uiComponent({
            type: "view",
            id: ID,
            classes: ["box-column", "box-center"],
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
            id: IMAGE_ID$1,
            attributes: {
                src: `${getConfiguration("path")["icons"]}/error.svg`,
            },
        });
        view.appendChild(image);
        // Error title
        const title = uiComponent({
            type: Html.H1,
            id: TITLE_ID,
            text: error.friendly,
        });
        view.appendChild(title);
        // Error description
        const description = uiComponent({
            type: Html.P,
            text: error.description,
        });
        view.appendChild(description);
        container.appendChild(view);
    }

    /**
     * Renderer class for the image galleries.
     */
    class ImageGallery {
        /**
         * Render a gallery
         * @param images The images to show
         * @returns The composed HTML element
         */
        static render(images) {
            // if nothing to show, return
            if (undefined == images) {
                console.error("No images to show in gallery.");
                return;
            }
            let gallery = uiComponent({
                type: Html.Div,
                classes: [
                    ImageGallery.CLASS,
                    BubbleUI.BoxColumn,
                    BubbleUI.BoxXStart,
                    BubbleUI.BoxYStart,
                ],
            });
            // turn on mobile class if needed
            if (isSmallDevice()) {
                gallery.classList.add(ImageGallery.MOBILE_CLASS);
            }
            // Add a list of images to show
            // in the gallery
            const list = this.createImageList(images);
            gallery.appendChild(list);
            return gallery;
        }
        static update(container, images) {
            container.innerHTML = "";
            container.appendChild(this.createImageList(images));
            return container;
        }
        static createImageList(images) {
            // Add a list of images to show
            // in the gallery
            const list = uiComponent({
                type: Html.Ul,
                id: ImageGallery.LIST_ID,
            });
            images?.forEach((image) => this.register(list, image, images));
            return list;
        }
        /**
         * Register an image in the gallery
         * @param container The HTML container to attach the images to
         * @param image The image to attach
         * @param album The album the image is belonging to
         */
        static register(container, image, album) {
            const item = uiComponent({ type: Html.Li });
            const canvas = this.renderImageCanvas(image, album);
            setTimeout(() => canvas.style.opacity = "1", 1);
            item.appendChild(canvas);
            container.appendChild(item);
        }
        /**
         * Render the canvas for the image
         * @param image The image to attach to the canvas
         * @param album The album the image belongs to
         * @returns The composed HTML element
         */
        static renderImageCanvas(image, album) {
            const canvas = uiComponent({
                type: Html.Div,
                classes: ["canvas"],
            });
            setDomEvents(canvas, {
                click: () => {
                    emitSignal(ImageGallery.IMAGE_SELECTED_SIGNAL, {
                        images: Array.from(album.values()),
                        selected: image,
                    });
                },
            });
            const imageComponent = uiComponent({
                type: Html.Img,
                attributes: {
                    src: image.minPath,
                    alt: image.name,
                    loading: "lazy",
                    background: "#fff",
                },
            });
            setDomEvents(imageComponent, {
                load: () => (imageComponent.style.opacity = "1"),
            });
            canvas.appendChild(imageComponent);
            return canvas;
        }
    }
    ImageGallery.CLASS = "gallery";
    ImageGallery.LIST_ID = "image-list";
    ImageGallery.MOBILE_CLASS = "mobile";
    ImageGallery.IMAGE_SELECTED_SIGNAL = setSignal();

    const VISUALIZER_ID = "visualizer";
    const VISUALIZER_CANVAS_ID = "canvas";
    const BUTTON_BACK_ID = "visualizer-back";
    const BUTTON_NEXT_ID = "visualizer-next";
    const IMAGE_ID = "visualizer-image";
    const NAME_ID = "visualizer-name";
    const INFO_TEXT_ID = "visualizer-info-text";
    /**
     * This class is responsible of processing
     * the image gallery and current image to
     * display.
     */
    class VisualizerProcessor {
        constructor() {
            this.images = new Array();
            this.index = 0;
        }
        load(images) {
            this.images = images;
        }
        isFirstImage() {
            if (0 == this.images.length)
                return false;
            return 0 == this.index;
        }
        isLastImage() {
            if (0 == this.images.length)
                return false;
            return this.images.length - 1 == this.index;
        }
        set(currentImage) {
            this.index = this.getIndexOf(currentImage);
            if (this.index < 1)
                this.index = 0;
        }
        getIndexOf(currentImage) {
            for (let i = 0; i < this.images.length; i++) {
                const image = this.images[i];
                if (image.name == currentImage.name) {
                    return i;
                }
            }
            return -1;
        }
        getCurrentImage() {
            if (0 == this.images.length)
                return null;
            return this.images[this.index];
        }
        next() {
            if (0 == this.images.length)
                return;
            this.index++;
            if (this.images.length <= this.index)
                this.index = 0;
        }
        previous() {
            if (0 == this.images.length)
                return;
            this.index--;
            if (0 > this.index)
                this.index = this.images.length - 1;
        }
    }
    /**
     * This is a ui component responsible of showing
     * a gallery of images.
     */
    class Visualizer {
        /**
         * Render a visualizer
         */
        static render(processor) {
            let visualizer = document.getElementById(VISUALIZER_ID);
            return null == visualizer ? Visualizer.create(processor) : Visualizer.update(visualizer, processor);
        }
        /**
         * Create a new visualizer given an state
         */
        static create(processor) {
            const visualizer = uiComponent({
                type: Html.Div,
                id: VISUALIZER_ID,
                classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter],
            });
            const buttonBack = getIcon("material", "back", "48px", "var(--text-color)");
            buttonBack.id = BUTTON_BACK_ID;
            setDomEvents(buttonBack, {
                click: () => {
                    processor.previous();
                    this.render(processor);
                }
            });
            const buttonNext = getIcon("material", "back", "48px", "var(--text-color)");
            buttonNext.id = BUTTON_NEXT_ID;
            setDomEvents(buttonNext, {
                click: () => {
                    processor.next();
                    this.render(processor);
                }
            });
            const imageCanvas = uiComponent({
                type: Html.Div,
                id: VISUALIZER_CANVAS_ID,
                classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter, BubbleUI.BoxXCenter]
            });
            const image = uiComponent({
                type: Html.Img,
                id: IMAGE_ID,
                attributes: { src: processor.getCurrentImage()?.path || "" },
            });
            imageCanvas.appendChild(image);
            const name = uiComponent({
                type: Html.H1,
                id: NAME_ID,
                text: processor.getCurrentImage()?.name,
                selectable: false
            });
            imageCanvas.appendChild(name);
            const infoText = uiComponent({
                type: Html.P,
                id: INFO_TEXT_ID,
                text: "Touch outside the image to close the visualizer.",
                classes: ["info-text"],
                selectable: false
            });
            setDomEvents(visualizer, {
                click: (event) => {
                    //if the click is not on the image, close the visualizer
                    if (event.target != visualizer && event.target != imageCanvas)
                        return;
                    event.stopPropagation();
                    visualizer.style.display = "none";
                }
            });
            visualizer.appendChild(buttonBack);
            visualizer.appendChild(imageCanvas);
            visualizer.appendChild(buttonNext);
            visualizer.appendChild(infoText);
            return visualizer;
        }
        /**
         * Update the visualizer with the current processor state.
         */
        static update(visualizer, processor) {
            const image = document.getElementById(IMAGE_ID);
            image.style.display = "flex";
            image.setAttribute("src", processor.getCurrentImage()?.path || "");
            const name = document.getElementById(NAME_ID);
            name.innerText = processor.getCurrentImage().name || "";
            return visualizer;
        }
        static show() {
            const visualizer = document.getElementById(VISUALIZER_ID);
            if (null == visualizer)
                return;
            visualizer.style.display = "flex";
        }
    }

    class HomeView {
        /**
        * Show home view
        */
        static async show(parameters, container) {
            const categories = new Set(ImageService.getCategories());
            const view = uiComponent({
                type: Html.View,
                id: HomeView.VIEW_ID,
                classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYStart],
            });
            const selectedCategory = parameters[0] || categories.values().next().value;
            const visualizer = Visualizer.render(HomeView.visualizerProcessor);
            const header = Header.render(categories);
            const galleryContainer = uiComponent({
                type: Html.Div,
                id: "gallery-container",
                classes: [BubbleUI.BoxColumn, BubbleUI.BoxXStart, BubbleUI.BoxYStart],
            });
            connectToSignal(Header.OPTION_SELECTED_SIGNAL, async (category) => HomeView.showImages(galleryContainer, category, undefined));
            connectToSignal(HomeView.PROJECT_SELECTED_SIGNAL, async (data) => HomeView.showImages(galleryContainer, data?.category, data?.project));
            view.appendChild(header);
            view.appendChild(galleryContainer);
            view.appendChild(visualizer);
            container.appendChild(view);
            emitSignal(Header.OPTION_SELECTED_SIGNAL, selectedCategory);
        }
        /**
         * Show the projects of the selected tag
         * @param container The container of the gallery
         * @param currentCategoryName The selected tag
         * @param currentProject The selected project
         */
        static async showImages(container, currentCategoryName, currentProjectName) {
            // If container is not present, return
            if (undefined == container) {
                console.error(`Undefined container.`);
                return;
            }
            // If tag is not selected, return
            if (undefined == currentCategoryName) {
                console.error(`Tag ${currentCategoryName} not found.`);
                return;
            }
            // If the project is not found, return
            const projects = ImageService.getProjectsOfCategory(currentCategoryName);
            if (undefined == projects || 0 == projects.size) {
                console.error(`No projects present.`);
                return;
            }
            // Get current project
            if (currentProjectName == undefined)
                currentProjectName = projects.values().next().value;
            const projectChanged = container.dataset.project != currentProjectName;
            const categoryChanged = container.dataset.category != currentCategoryName;
            if (categoryChanged) {
                if (!Display.isMobile()) {
                    // Disappear animation
                    container.style.opacity = "0";
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                container.innerHTML = "";
                const viewHeader = uiComponent({
                    id: HomeView.VIEW_HEADER_ID
                });
                const titleBar = uiComponent({
                    classes: [BubbleUI.BoxRow, BubbleUI.BoxXBetween, BubbleUI.BoxYCenter],
                    id: HomeView.TITLE_BAR_ID,
                    styles: {
                        width: "100%"
                    }
                });
                const title = uiComponent({
                    type: Html.H1,
                    text: currentCategoryName,
                    id: "title"
                });
                titleBar.appendChild(title);
                if (Display.isMobile()) {
                    const icon = uiComponent({
                        type: Html.Img,
                        attributes: {
                            src: getConfiguration("path")["icons"] + "/menu-icon.svg"
                        }
                    });
                    titleBar.appendChild(icon);
                    setDomEvents(icon, {
                        click: () => { Header.toggle(); }
                    });
                }
                viewHeader.appendChild(titleBar);
                const bar = HomeView.renderProjectBar(projects, currentProjectName, currentCategoryName);
                viewHeader.appendChild(bar);
                container.appendChild(viewHeader);
                this.render(container, currentProjectName, currentCategoryName);
                // appear animation
                container.style.opacity = "1";
                await new Promise(resolve => setTimeout(resolve, 260));
            }
            else if (projectChanged) {
                let title = container.querySelector("#title");
                title.innerHTML = currentCategoryName;
                this.render(container, currentProjectName, currentCategoryName);
            }
            setDomDataset(container, {
                project: currentProjectName,
                category: currentCategoryName
            });
        }
        static async render(container, currentProjectName, currentCategoryName) {
            // Create the project gallery
            const images = ImageService.getImagesByProjectAndCategory(currentProjectName, currentCategoryName);
            let gallery = document.querySelector(`.${ImageGallery.CLASS}`);
            if (null == gallery) {
                gallery = ImageGallery.render(images);
                connectToSignal(ImageGallery.IMAGE_SELECTED_SIGNAL, async (data) => {
                    HomeView.visualizerProcessor.load(data.images);
                    HomeView.visualizerProcessor.set(data.selected);
                    Visualizer.render(HomeView.visualizerProcessor);
                    Visualizer.show();
                });
                container.appendChild(gallery);
            }
            else {
                this.selectProject(container, currentProjectName);
                ImageGallery.update(gallery, images);
            }
        }
        /**
         * Render the project bar
         * @param projects The projects to add to the bar
         * @param currentProjectName The current selected project name
         * @param categoryName The current category name
         * @returns The composed HTML element
         */
        static renderProjectBar(projects, currentProjectName, categoryName) {
            const bar = uiComponent({
                type: Html.Div,
                id: "project-bar",
                classes: [BubbleUI.BoxRow, BubbleUI.BoxXCenter, BubbleUI.BoxYStart],
            });
            projects.forEach(project => {
                const button = uiComponent({
                    type: Html.Button,
                    text: project,
                    classes: project == currentProjectName ? ["selected"] : [],
                });
                button.onclick = () => emitSignal(HomeView.PROJECT_SELECTED_SIGNAL, {
                    category: categoryName,
                    project: project,
                });
                bar.appendChild(button);
            });
            return bar;
        }
        static selectProject(container, currentProject) {
            const buttons = container.querySelectorAll(`#project-bar button`);
            console.log(buttons);
            for (const button of buttons) {
                const htmlButton = button;
                if (htmlButton.textContent == currentProject) {
                    htmlButton.classList.add("selected");
                }
                else {
                    htmlButton.classList.remove("selected");
                }
            }
        }
    }
    // HTML ids and classes
    HomeView.VIEW_ID = "home";
    HomeView.VIEW_HEADER_ID = "view-header";
    HomeView.TITLE_BAR_ID = "title-bar";
    HomeView.TITLE_ID = "title";
    // Signals
    HomeView.PROJECT_SELECTED_SIGNAL = setSignal();
    // Data
    HomeView.visualizerProcessor = new VisualizerProcessor();

    /**
     * When the dynamic URL changes loads
     * the correspoding view from the URL
     */
    window.addEventListener("hashchange", start);
    /**
     * When the window is loaded load
     * the app state to show
     */
    window.onload = async function () {
        await loadConfiguration("gtdf.config.json");
        Display.checkType();
        await loadIcons("material", `${getConfiguration("path")["icons"]}/materialicons.json`);
        await loadIcons("social", `${getConfiguration("path")["icons"]}/socialicons.json`);
        await ImageService.load();
        await start();
    };
    window.onresize = async function () {
        Display.checkType();
    };
    /** Start the web app     */
    async function start() {
        setRoute("", HomeView.show);
        setRoute("bio", BioView.show);
        setNotFoundRoute(showErrorView);
        showRoute(window.location.hash.slice(1).toLowerCase(), document.body);
    }

})();
