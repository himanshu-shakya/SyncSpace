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

  useEffect(() => {
    if (!documentId) return;

    // Connect to Spring Boot WebSocket STOMP endpoint
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);

        // Subscribe to live broadcast topic for this document
        client.subscribe(`/topic/document/${documentId}`, (message) => {
          try {
            const data: SyncMessage = JSON.parse(message.body);
            // Only update if changes came from another collaborator
            if (data.senderEmail !== userEmail) {
              setLastEditor(data.senderName);
              onRemoteUpdate(data.title, data.content, data.senderName);
            }
          } catch (e) {
            console.error('Error parsing sync message', e);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [documentId, userEmail, userName, onRemoteUpdate]);

  // Method to publish keystroke updates to all connected peers
  const sendEdit = useCallback(
    (newTitle: string, newContent: string) => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: `/app/document/${documentId}/edit`,
          body: JSON.stringify({
            documentId: Number(documentId),
            senderEmail: userEmail,
            senderName: userName || 'Collaborator',
            title: newTitle,
            content: newContent,
            type: 'EDIT',
          }),
        });
      }
    },
    [documentId, userEmail, userName]
  );

  return { isConnected, lastEditor, sendEdit };
}

