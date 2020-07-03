define("dump", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function default_1() {
        console.time("initializeAsync");
        await tableau.extensions.initializeAsync({ configure: configure });
        console.timeEnd("initializeAsync");
        const dashboard = tableau.extensions.dashboardContent.dashboard;
        console.log(`Dashboard name: ${dashboard.name}`);
        for (const worksheet of dashboard.worksheets) {
            console.log(`Worksheet: ${worksheet.name}`);
            for (const ds of await worksheet.getDataSourcesAsync()) {
                console.log(`Data source: ${ds.name}`);
            }
            for (const table of await worksheet.getUnderlyingTablesAsync()) {
                console.log(`Underlying table: ${table.caption} (${table.id})`);
            }
        }
    }
    exports.default = default_1;
    function configure() {
        return {};
    }
    function timeout(ms, message = "The operation timed out") {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error(message));
            }, ms);
        });
    }
});
define("ifc/shared", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ifc/client", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createClient = void 0;
    // A medium-large, random-ish number. Crypto-quality randomness is not necessary here.
    let nextInstance = new Date().getTime() % Math.pow(2, 16);
    function createClient(postMessage, targetOrigin, addEventListener = window.addEventListener) {
        const proxy = new Proxy({}, {
            get(target, p, receiver) {
                if (typeof (p) !== "string") {
                    return undefined;
                }
                const method = p;
                return async function () {
                    // Create an entry in the requests table for this request, identified by `tag`.
                    const [tag, respPromise] = registerRequest();
                    // Create the request object, and send it.
                    const req = { tag, method, args: [...arguments] };
                    console.log(`postMessage(${JSON.stringify(req)}, "${targetOrigin}")`);
                    postMessage(req, targetOrigin);
                    // Wait until the response is received.
                    const resp = await respPromise;
                    // Unpack the response; throw on error, return on success.
                    if (typeof (resp.error) !== "undefined") {
                        const [message, props] = resp.error;
                        const err = new Error(message);
                        Object.assign(err, props);
                        throw err;
                    }
                    else {
                        return resp.value;
                    }
                };
            }
        });
        // Table of outstanding requests for which we are expecting responses
        const requests = {};
        const tagPrefix = (nextInstance++) + "_";
        let nextTag = 0;
        function registerRequest() {
            const tag = tagPrefix + (nextTag++);
            const p = new Promise((resolve, reject) => {
                requests[tag] = resolve;
            });
            return [tag, p];
        }
        addEventListener("message", ev => {
            if (typeof (ev.data) === "object" && ev.data.hasOwnProperty("tag")) {
                const resp = ev.data;
                if (requests[resp.tag]) {
                    requests[resp.tag](resp);
                }
            }
        });
        return proxy;
    }
    exports.createClient = createClient;
});
define("ifc/server", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createReceiver(target, origin = window.location.origin) {
        function handler(event) {
            if (typeof (origin) === "function" ? !origin(event.origin) : origin !== event.origin) {
                throw new Error("Rejected message sent from unknown origin: " + event.origin);
            }
            const req = event.data;
            executeRequest(target, event.source, event.origin, req);
        }
        return handler;
    }
    exports.default = createReceiver;
    async function executeRequest(target, source, origin, req) {
        let resp;
        try {
            const method = target[req.method];
            if (typeof (method) !== "function") {
                throw new Error(`Method '${req.method}' not found or isn't a function`);
            }
            const result = await method.apply(target, req.args);
            resp = { tag: req.tag, value: result };
        }
        catch (err) {
            resp = { tag: req.tag, error: [err.message, {}] };
        }
        source.postMessage(resp, origin);
    }
});
//# sourceMappingURL=app.js.map