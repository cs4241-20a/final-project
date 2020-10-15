import { createContext, useContext } from "react";

const ws = new WebSocket(`ws://${location.host}`);
export const WebSocketContext = createContext(ws);
export const useWebsocket = () => useContext(WebSocketContext);