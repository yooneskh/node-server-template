import { IncomingMessage } from "http";

declare module 'http' {
  export interface IncomingMessage {
    body: any;
    user?: any;
  }
}
