export interface IPCRequest {
  tag: string;
  method: string;
  args: any[];
}

export interface IPCResponse {
  tag: string;
  value?: any;
  error?: [string, {}];
}

export interface IRemoteObject {
}
