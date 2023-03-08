export interface Params {
  urls: string | string[];
  interval?: number;
  open?: (ws: WebSocket, url: string) => void;
  message?: (res: unknown, ws: WebSocket, url: string) => void;
  disconnect?: () => void;
}

export interface WS {
  url: string;
  ws: WebSocket | null;
  message?: any;
  open?: any;
  disconnect?: any;
  timeout?: number;
  connected?: boolean;
}
