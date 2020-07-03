import { IPCRequest, IPCResponse } from "./shared";

export default function createReceiver(
  target: Object,
  origin: string | ((origin: string) => boolean) = window.location.origin) {

  function handler(event: MessageEvent) {
    if (typeof(origin) === "function" ? !origin(event.origin) : origin !== event.origin) {
      throw new Error("Rejected message sent from unknown origin: " + event.origin);
    }

    const req = event.data as IPCRequest;
    executeRequest(target, event.source as (WindowProxy | Window), event.origin, req);
  }
  return handler;
}

async function executeRequest(target: Object, source: WindowProxy | Window, origin: string, req: IPCRequest) {
  let resp: IPCResponse;
  try {
    const method = target[req.method];
    if (typeof(method) !== "function") {
      throw new Error(`Method '${req.method}' not found or isn't a function`);
    }
    const result = await (method as Function).apply(target, req.args);
    resp = {tag: req.tag, value: result};
  } catch(err) {
    resp = {tag: req.tag, error: [err.message, {}]};
  }
  source.postMessage(resp, origin);
}
