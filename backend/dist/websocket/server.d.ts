import { WebSocketServer } from 'ws';
import { Server } from 'http';
export declare function initWebSocketServer(server: Server): WebSocketServer;
export declare function broadcastToAssignment(assignmentId: string, event: string, data: Record<string, unknown>): void;
export declare function getWss(): WebSocketServer | null;
//# sourceMappingURL=server.d.ts.map