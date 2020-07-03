import { IPCRequest, IPCResponse, IRemoteObject } from "./shared";

// A medium-large, random-ish number. Crypto-quality randomness is not necessary here.
let nextInstance = new Date().getTime() % Math.pow(2, 16);

export function createClient<T extends IRemoteObject>(
  postMessage: (message: any, targetOrigin: string) => void,
  targetOrigin: string,
  addEventListener = window.addEventListener): T {

  const proxy = new Proxy({}, {
    get(target, p, receiver) {
      if (typeof(p) !== "string") {
        return undefined;
      }
      const method = p as string;

      return async function() {
        // Create an entry in the requests table for this request, identified by `tag`.
        const [tag, respPromise] = registerRequest();

        // Create the request object, and send it.
        const req: IPCRequest = { tag, method, args: [...arguments] };
        console.log(`postMessage(${JSON.stringify(req)}, "${targetOrigin}")`)
        postMessage(req, targetOrigin);

        // Wait until the response is received.
        const resp = await respPromise;

        // Unpack the response; throw on error, return on success.
        if (typeof(resp.error) !== "undefined") {
          const [message, props] = resp.error;
          const err = new Error(message);
          Object.assign(err, props);
          throw err;
        } else {
          return resp.value;
        }
      };
    }
  });

  // Table of outstanding requests for which we are expecting responses
  const requests: {[key: string]: (resp: IPCResponse) => void} = {};
  const tagPrefix = (nextInstance++) + "_";
  let nextTag = 0;

  function registerRequest(): [string, Promise<IPCResponse>] {
    const tag = tagPrefix + (nextTag++);
    const p = new Promise<IPCResponse>((resolve, reject) => {
      requests[tag] = resolve;
    });
    return [tag, p];
  }

  addEventListener("message", ev => {
    if (typeof(ev.data) === "object" && ev.data.hasOwnProperty("tag")) {
      const resp = ev.data as IPCResponse;
      if (requests[resp.tag]) {
        requests[resp.tag](resp);
      }
    }
  });

  return proxy as T;
}
