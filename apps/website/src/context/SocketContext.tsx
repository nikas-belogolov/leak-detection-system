import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";



export const SocketContext = createContext<Socket | null>(null);


export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
    return ctx;
};