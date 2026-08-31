/**
 * Persistent WebSocket Connection Manager for Real-time Dispatch Fan-out (< 2s)
 */

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = [];
    this.url = 'ws://localhost:5000/ws/dispatches';
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[WebSocket] Connected to Life Pulse real-time dispatch backbone');
        this.notifyListeners({ type: 'STATUS', connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (err) {
          console.warn('[WebSocket] Invalid JSON received:', event.data);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
        this.notifyListeners({ type: 'STATUS', connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.warn('[WebSocket] Connection error:', error);
      };
    } catch (e) {
      console.warn('[WebSocket] Init failed:', e);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), 3000);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => cb(data));
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const wsClient = new WebSocketClient();
