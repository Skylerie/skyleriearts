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
        const loadedConfiguration = await fetch(path).then((res) => res.json());
        if (null != localStorage[configurationId]) {
            for (const key in loadedConfiguration) {
                setConfiguration(key, loadedConfiguration[key]);
            }
        }
        else {
            localStorage[configurationId] = JSON.stringify(loadedConfiguration);
        }
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

    const DEFAULT_ERROR_CODE = 404;
    const ID = 'error';
    const IMAGE_ID = 'error-img';
    const TITLE_ID = 'error-title';
    async function showErrorView(params, container) {
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
     * This enum represents the available HTTP methods
     * @author akrck02
     */
    var HttpMethod;
    (function (HttpMethod) {
        HttpMethod["Get"] = "GET";
        HttpMethod["Post"] = "POST";
        HttpMethod["Put"] = "PUT";
        HttpMethod["Delete"] = "DELETE";
        HttpMethod["Update"] = "UPDATE";
        HttpMethod["Patch"] = "PATCH";
        HttpMethod["Head"] = "HEAD";
        HttpMethod["Options"] = "OPTIONS";
        HttpMethod["Connect"] = "CONNECT";
        HttpMethod["Trace"] = "TRACE";
        HttpMethod["All"] = "ALL";
    })(HttpMethod || (HttpMethod = {}));
    /**
     * This enum represents the available mime types
     * @author akrck02
     */
    var MimeType;
    (function (MimeType) {
        MimeType["Json"] = "application/json";
        MimeType["Xml"] = "application/xml";
        MimeType["Html"] = "text/html";
        MimeType["Text"] = "text/plain";
        MimeType["Form"] = "multipart/form-data";
        MimeType["UrlEncoded"] = "application/x-www-form-urlencoded";
        MimeType["Blob"] = "application/octet-stream";
        MimeType["Pdf"] = "application/pdf";
        MimeType["Zip"] = "application/zip";
        MimeType["Mp3"] = "audio/mpeg";
        MimeType["Mp4"] = "video/mp4";
        MimeType["Png"] = "image/png";
        MimeType["Jpeg"] = "image/jpeg";
        MimeType["Gif"] = "image/gif";
        MimeType["Svg"] = "image/svg+xml";
        MimeType["Ico"] = "image/x-icon";
        MimeType["Csv"] = "text/csv";
        MimeType["Css"] = "text/css";
        MimeType["Javascript"] = "text/javascript";
        MimeType["Typescript"] = "text/typescript";
        MimeType["Webm"] = "video/webm";
        MimeType["Ogg"] = "video/ogg";
        MimeType["Ogv"] = "video/ogv";
        MimeType["Wav"] = "audio/wav";
        MimeType["Webp"] = "image/webp";
        MimeType["Woff"] = "font/woff";
        MimeType["Woff2"] = "font/woff2";
        MimeType["Ttf"] = "font/ttf";
        MimeType["Eot"] = "application/vnd.ms-fontobject";
        MimeType["Otf"] = "font/otf";
        MimeType["Xls"] = "application/vnd.ms-excel";
        MimeType["Xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        MimeType["Doc"] = "application/msword";
        MimeType["Docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        MimeType["Ppt"] = "application/vnd.ms-powerpoint";
        MimeType["Pptx"] = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        MimeType["Msg"] = "application/vnd.ms-outlook";
        MimeType["Rtf"] = "application/rtf";
        MimeType["Psd"] = "application/photoshop";
        MimeType["Ai"] = "application/postscript";
        MimeType["Eps"] = "application/postscript";
        MimeType["Xps"] = "application/vnd.ms-xpsdocument";
        MimeType["Swf"] = "application/x-shockwave-flash";
        MimeType["Flv"] = "video/x-flv";
        MimeType["Midi"] = "audio/midi";
        MimeType["Wma"] = "audio/x-ms-wma";
        MimeType["Wax"] = "audio/x-ms-wax";
        MimeType["Mka"] = "audio/x-matroska";
        MimeType["Mkv"] = "video/x-matroska";
        MimeType["Avi"] = "video/x-msvideo";
        MimeType["Mov"] = "video/quicktime";
        MimeType["Wmv"] = "video/x-ms-wmv";
        MimeType["M4a"] = "audio/mp4";
        MimeType["M4v"] = "video/mp4";
        MimeType["F4v"] = "video/mp4";
        MimeType["F4a"] = "audio/mp4";
        MimeType["F4b"] = "audio/mp4";
        MimeType["M4b"] = "audio/mp4";
        MimeType["M4r"] = "audio/mp4";
        MimeType["Mpga"] = "audio/mpeg";
        MimeType["Mp2"] = "audio/mpeg";
        MimeType["Mp2A"] = "audio/mpeg";
        MimeType["M2a"] = "audio/mpeg";
        MimeType["M3a"] = "audio/mpeg";
        MimeType["Oga"] = "audio/ogg";
    })(MimeType || (MimeType = {}));
    /**
     * This enum represents the available text encodings
     * @author akrck02
     */
    var TextEncoding;
    (function (TextEncoding) {
        TextEncoding["Utf8"] = "UTF-8";
        TextEncoding["Utf16"] = "UTF-16";
        TextEncoding["Utf16be"] = "UTF-16BE";
        TextEncoding["Utf16le"] = "UTF-16LE";
        TextEncoding["Iso88591"] = "ISO-8859-1";
        TextEncoding["Iso88592"] = "ISO-8859-2";
        TextEncoding["Iso88593"] = "ISO-8859-3";
        TextEncoding["Iso88594"] = "ISO-8859-4";
        TextEncoding["Iso88595"] = "ISO-8859-5";
        TextEncoding["Iso88596"] = "ISO-8859-6";
        TextEncoding["Iso88597"] = "ISO-8859-7";
        TextEncoding["Iso88598"] = "ISO-8859-8";
        TextEncoding["Iso88599"] = "ISO-8859-9";
        TextEncoding["Iso885910"] = "ISO-8859-10";
        TextEncoding["Iso885913"] = "ISO-8859-13";
        TextEncoding["Iso885914"] = "ISO-8859-14";
        TextEncoding["Iso885915"] = "ISO-8859-15";
        TextEncoding["Iso885916"] = "ISO-8859-16";
        TextEncoding["Koi8R"] = "KOI8-R";
        TextEncoding["Koi8U"] = "KOI8-U";
        TextEncoding["Macintosh"] = "macintosh";
        TextEncoding["Windows1250"] = "windows-1250";
        TextEncoding["Windows1251"] = "windows-1251";
        TextEncoding["Windows1252"] = "windows-1252";
        TextEncoding["Windows1253"] = "windows-1253";
        TextEncoding["Windows1254"] = "windows-1254";
        TextEncoding["Windows1255"] = "windows-1255";
        TextEncoding["Windows1256"] = "windows-1256";
        TextEncoding["Windows1257"] = "windows-1257";
        TextEncoding["Windows1258"] = "windows-1258";
        TextEncoding["Xmaccyrillic"] = "x-mac-cyrillic";
        TextEncoding["Gb18030"] = "GB18030";
        TextEncoding["Big5"] = "Big5";
        TextEncoding["Shiftjis"] = "Shift_JIS";
        TextEncoding["Eucjp"] = "EUC-JP";
        TextEncoding["Iso2022jp"] = "ISO-2022-JP";
        TextEncoding["Euckr"] = "EUC-KR";
        TextEncoding["Iso2022kr"] = "ISO-2022-KR";
        TextEncoding["Ibm866"] = "IBM866";
        TextEncoding["Ibm775"] = "IBM775";
        TextEncoding["Iso885911"] = "ISO-8859-11";
        TextEncoding["Windows874"] = "windows-874";
        TextEncoding["Tis620"] = "TIS-620";
    })(TextEncoding || (TextEncoding = {}));
    /**
     * Make a HTTP GET request.
     * @param request The request parameters.
     * @returns The promise of a response.
     */
    async function httpGet(request) {
        request.method = HttpMethod.Get;
        return httpRequest(request);
    }
    /**
     * Make a HTTP request.
     * @param request The request parameters.
     * @returns The promise of a response.
     */
    function httpRequest(request) {
        let options = {
            method: request.method || HttpMethod.Get,
            headers: {
                'Content-type': `${request.contentType || 'application/json'};charset=${request.charset || 'UTF-8'}`,
                mode: 'cors',
                'Sec-Fetch-Site': 'cross-site'
            }
        };
        request.headers && Object.assign(options.headers, request.headers);
        if (HttpMethod.Get !== request.method) {
            if (request.parameters instanceof FormData) {
                options['body'] = request.parameters;
                options.headers['Content-type'] =
                    `multipart/form-data;charset=${request.charset || 'UTF-8'}`;
            }
            else {
                options['body'] = JSON.stringify(request.parameters);
            }
        }
        return fetch(request.url, options);
    }

    async function showSummaryView(parameters, container) {
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

    /**
     * When the dynamic URL changes loads
     * the correspoding view from the URL
     */
    window.addEventListener('hashchange', start);
    /**
     * When the window is loaded load
     * the app state to show
     */
    window.onload = async function () {
        await loadConfiguration('gtdf.config.json');
        Display.checkType();
        await loadIcons('material', `${getConfiguration('path')['icons']}/materialicons.json`);
        await loadIcons('social', `${getConfiguration('path')['icons']}/socialicons.json`);
        await start();
    };
    window.onresize = async function () {
        Display.checkType();
    };
    /** Start the web app     */
    async function start() {
        setRoute('', showSummaryView);
        // setRoute("/stickers", showStickerView);
        setNotFoundRoute(showErrorView);
        showRoute(window.location.hash.slice(1).toLowerCase(), document.body);
    }

})();
