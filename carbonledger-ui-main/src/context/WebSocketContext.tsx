import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import { useAuth } from '../auth/AuthContext';
import { config } from '../config';

interface WebSocketContextType {
    isConnected: boolean;
    lastMessage: any | null;
    subscribe: (topic: string, callback: (message: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, token } = useAuth(); // Assuming auth context provides a token
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        // The Notification Service endpoint via API Gateway
        // Gateway routes /ws/** to notification-service
        // SockJS endpoint is http://localhost:8080/ws
        const socketFactory = () => new SockJS('http://localhost:8080/ws');

        const stompClient = new Client({
            webSocketFactory: socketFactory,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, [isAuthenticated]);

    const subscribe = useCallback((topic: string, callback: (message: any) => void) => {
        if (client && isConnected) {
            console.log(`Subscribing to ${topic}`);
            client.subscribe(topic, (message: Message) => {
                const body = JSON.parse(message.body);
                setLastMessage(body);
                callback(body);
            });
        } else {
            console.warn("Cannot subscribe: WebSocket not connected");
        }
    }, [client, isConnected]);

    return (
        <WebSocketContext.Provider value={{ isConnected, lastMessage, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
