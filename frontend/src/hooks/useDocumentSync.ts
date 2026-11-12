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

export interface ActivePeer {
  email: string;
  name: string;
  lastSeen: number;
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
  const [activePeers, setActivePeers] = useState<ActivePeer[]>([]);

  // Store mutable references to avoid re-triggering STOMP client recreation
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

        // Announce presence (JOIN)
        if (userEmailRef.current) {
          client.publish({
            destination: `/app/document/${documentId}/edit`,
            body: JSON.stringify({
              documentId: Number(documentId),
              senderEmail: userEmailRef.current,
              senderName: userNameRef.current || 'Collaborator',
              title: '',
              content: '',
              type: 'JOIN',
            }),
          });
        }

        // Subscribe to live broadcast topic for this document
        client.subscribe(`/topic/document/${documentId}`, (message) => {
          try {
            const data: SyncMessage = JSON.parse(message.body);
            const myEmail = userEmailRef.current?.trim().toLowerCase();
            const senderEmail = data.senderEmail?.trim().toLowerCase();

            // Track active peer if message is from another user
            if (senderEmail && (!myEmail || senderEmail !== myEmail)) {
              if (data.type === 'LEAVE') {
                setActivePeers((prev) => prev.filter((p) => p.email.toLowerCase() !== senderEmail));
              } else {
                setActivePeers((prev) => {
                  const filtered = prev.filter((p) => p.email.toLowerCase() !== senderEmail);
                  return [
                    ...filtered,
                    {
                      email: senderEmail,
                      name: data.senderName || 'Collaborator',
                      lastSeen: Date.now(),
                    },
                  ];
                });
              }

              // If it's a join message, respond with presence so newcomer sees current viewers
              if (data.type === 'JOIN' && myEmail) {
                client.publish({
                  destination: `/app/document/${documentId}/edit`,
                  body: JSON.stringify({
                    documentId: Number(documentId),
                    senderEmail: userEmailRef.current,
                    senderName: userNameRef.current || 'Collaborator',
                    title: '',
                    content: '',
                    type: 'PING',
                  }),
                });
              }
            }

            // Remote document content update
            if (data.type === 'EDIT' && (!myEmail || senderEmail !== myEmail)) {
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

    // Heartbeat cleanup for inactive peers (> 60s)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setActivePeers((prev) => prev.filter((p) => now - p.lastSeen < 60000));
    }, 15000);

    return () => {
      clearInterval(cleanupInterval);
      if (client.connected && userEmailRef.current) {
        try {
          client.publish({
            destination: `/app/document/${documentId}/edit`,
            body: JSON.stringify({
              documentId: Number(documentId),
              senderEmail: userEmailRef.current,
              senderName: userNameRef.current || 'Collaborator',
              title: '',
              content: '',
              type: 'LEAVE',
            }),
          });
        } catch {
          // ignore disconnect send errors
        }
      }
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

  return { isConnected, lastEditor, activePeers, sendEdit };
}
