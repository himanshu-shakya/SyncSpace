import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export interface SyncMessage {
  documentId: number;
  senderEmail: string;
  senderName: string;
  title: string;
  content: string;
  type: string;
  timestamp: string;
}

export function useDocumentSync({
  documentId,
  userEmail,
  userName,
  onRemoteUpdate,
}: {
  documentId: string;
  userEmail?: string;
  userName?: string;
  onRemoteUpdate: (title: string, content: string, senderName: string) => void;
}) {
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEditor, setLastEditor] = useState<string | null>(null);

  // Use refs for callbacks and dynamic user info to prevent re-creating STOMP client on typing
  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  onRemoteUpdateRef.current = onRemoteUpdate;

  const userEmailRef = useRef(userEmail);
  userEmailRef.current = userEmail;

  const userNameRef = useRef(userName);
  userNameRef.current = userName;

  useEffect(() => {
    if (!documentId) return;

    // Connect to Spring Boot WebSocket STOMP endpoint
    const brokerEndpoint = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

    const client = new Client({
      brokerURL: brokerEndpoint,
      reconnectDelay: 2000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);

        // Subscribe to live broadcast topic for this document
        client.subscribe(`/topic/document/${documentId}`, (message) => {
          try {
            const data: SyncMessage = JSON.parse(message.body);
            const myEmail = userEmailRef.current?.trim().toLowerCase();
            const senderEmail = data.senderEmail?.trim().toLowerCase();

            // Only update state if changes came from another collaborator
            if (!myEmail || senderEmail !== myEmail) {
              setLastEditor(data.senderName);
              if (onRemoteUpdateRef.current) {
                onRemoteUpdateRef.current(data.title, data.content, data.senderName);
              }
            }
          } catch (e) {
            console.error('Error parsing sync message', e);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP protocol error:', frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.warn('WebSocket connection error:', event);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [documentId]);

  // Method to publish keystroke updates to all connected peers
  const sendEdit = useCallback(
    (newTitle: string, newContent: string) => {
      const client = stompClientRef.current;
      if (client && client.connected) {
        client.publish({
          destination: `/app/document/${documentId}/edit`,
          body: JSON.stringify({
            documentId: Number(documentId),
            senderEmail: userEmailRef.current || '',
            senderName: userNameRef.current || 'Collaborator',
            title: newTitle,
            content: newContent,
            type: 'EDIT',
          }),
        });
      }
    },
    [documentId]
  );

  return { isConnected, lastEditor, sendEdit };
}
