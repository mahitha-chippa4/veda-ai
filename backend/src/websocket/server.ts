import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';

interface WSClient {
  ws: WebSocket;
  assignmentId?: string;
}

let wss: WebSocketServer | null = null;
const clients = new Map<string, Set<WebSocket>>();

export function initWebSocketServer(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket client connected');

    ws.on('message', (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'subscribe' && msg.assignmentId) {
          const id = msg.assignmentId;
          if (!clients.has(id)) clients.set(id, new Set());
          clients.get(id)!.add(ws);
          ws.send(JSON.stringify({ type: 'subscribed', assignmentId: id }));
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      // Remove from all subscription sets
      clients.forEach((subs) => subs.delete(ws));
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  });

  return wss;
}

export function broadcastToAssignment(
  assignmentId: string,
  event: string,
  data: Record<string, unknown>
): void {
  const subs = clients.get(assignmentId);
  if (!subs || subs.size === 0) return;

  const payload = JSON.stringify({ type: event, assignmentId, data, timestamp: new Date().toISOString() });

  subs.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

export function getWss(): WebSocketServer | null {
  return wss;
}
