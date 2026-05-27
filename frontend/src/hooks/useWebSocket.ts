'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { WSMessage, GeneratedPaper } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECTS = 5;

export function useWebSocket(assignmentId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const { setGenerationState, setPaper, updateAssignment } = useAssignmentStore();

  const connect = useCallback(() => {
    if (!assignmentId || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        reconnectCount.current = 0;
        // Subscribe to this assignment
        ws.send(JSON.stringify({ type: 'subscribe', assignmentId }));
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);

          if (!msg.assignmentId || msg.assignmentId !== assignmentId) return;

          switch (msg.type) {
            case 'generation_started':
              setGenerationState(assignmentId, {
                status: 'processing',
                progress: msg.data?.progress || 5,
                message: msg.data?.message || 'Starting generation...',
                error: null,
              });
              updateAssignment(assignmentId, { status: 'processing' });
              break;

            case 'generation_progress':
              setGenerationState(assignmentId, {
                status: 'processing',
                progress: msg.data?.progress || 50,
                message: msg.data?.message || 'Generating...',
              });
              break;

            case 'generation_completed':
              setGenerationState(assignmentId, {
                status: 'completed',
                progress: 100,
                message: 'Paper generated successfully!',
                paper: msg.data?.paper as GeneratedPaper || null,
                error: null,
              });
              if (msg.data?.paper) {
                setPaper(assignmentId, msg.data.paper as GeneratedPaper);
              }
              updateAssignment(assignmentId, { status: 'completed' });
              break;

            case 'generation_failed':
              setGenerationState(assignmentId, {
                status: 'failed',
                progress: 0,
                message: msg.data?.message || 'Generation failed',
                error: msg.data?.error || 'Unknown error',
              });
              updateAssignment(assignmentId, { status: 'failed' });
              break;
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket connection issue (retrying):', err);
      };

      ws.onclose = () => {
        if (reconnectCount.current < MAX_RECONNECTS) {
          reconnectCount.current++;
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  }, [assignmentId, setGenerationState, setPaper, updateAssignment]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
}
