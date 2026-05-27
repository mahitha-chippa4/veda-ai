"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocketServer = initWebSocketServer;
exports.broadcastToAssignment = broadcastToAssignment;
exports.getWss = getWss;
const ws_1 = __importStar(require("ws"));
let wss = null;
const clients = new Map();
function initWebSocketServer(server) {
    wss = new ws_1.WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
        console.log('🔌 WebSocket client connected');
        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'subscribe' && msg.assignmentId) {
                    const id = msg.assignmentId;
                    if (!clients.has(id))
                        clients.set(id, new Set());
                    clients.get(id).add(ws);
                    ws.send(JSON.stringify({ type: 'subscribed', assignmentId: id }));
                }
            }
            catch {
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
function broadcastToAssignment(assignmentId, event, data) {
    const subs = clients.get(assignmentId);
    if (!subs || subs.size === 0)
        return;
    const payload = JSON.stringify({ type: event, assignmentId, data, timestamp: new Date().toISOString() });
    subs.forEach((ws) => {
        if (ws.readyState === ws_1.default.OPEN) {
            ws.send(payload);
        }
    });
}
function getWss() {
    return wss;
}
//# sourceMappingURL=server.js.map