import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const getWsUrl = () => {
  return import.meta.env.VITE_WS_URL || 'http://localhost:8084/ws';
};

class SocketService {
  constructor() {
    this.stompClient = null;
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.subscriptions = new Map();
    this.reconnectTimeout = null;
  }

  connect() {
    if (this.stompClient && this.connected) {
      return;
    }
    
    try {
      const wsUrl = getWsUrl();
      this.socket = new SockJS(wsUrl);
      this.stompClient = Stomp.over(this.socket);
      
      // Disable STOMP debug console logs unless needed
      this.stompClient.debug = null;

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      this.stompClient.connect(
        headers,
        (frame) => {
          this.connected = true;
          console.log('Connected to LogiTrack STOMP WebSocket broker');
          
          // Re-subscribe all active listeners upon reconnection
          this.listeners.forEach((callback, destination) => {
            this._subscribeToDestination(destination, callback);
          });
        },
        (error) => {
          console.warn('STOMP connection error or disconnect:', error);
          this.connected = false;
          this.scheduleReconnect();
        }
      );
    } catch (err) {
      console.error('Failed to initialize SockJS/STOMP connection:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting STOMP reconnect...');
      this.connect();
    }, 5000);
  }

  subscribe(destination, callback) {
    const topic = destination.startsWith('/') ? destination : `/topic/tracking/${destination}`;
    this.listeners.set(topic, callback);

    if (this.connected && this.stompClient) {
      this._subscribeToDestination(topic, callback);
    }
  }

  _subscribeToDestination(destination, callback) {
    // Unsubscribe existing if any to avoid duplication
    this.unsubscribe(destination);

    try {
      const sub = this.stompClient.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          
          // Map backend location fields to format expected by telemetry hooks
          const mappedData = {
            orderId: data.orderId,
            status: data.status,
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed,
            eta: data.eta || 'Awaiting updates...',
            timestamp: new Date().toISOString()
          };
          callback(mappedData);
        } catch (e) {
          console.error('Failed to parse STOMP message body:', e);
        }
      });
      this.subscriptions.set(destination, sub);
    } catch (err) {
      console.error(`Failed to subscribe to STOMP destination: ${destination}`, err);
    }
  }

  unsubscribe(destination) {
    const topic = destination.startsWith('/') ? destination : `/topic/tracking/${destination}`;
    this.listeners.delete(topic);

    if (this.subscriptions.has(topic)) {
      try {
        this.subscriptions.get(topic).unsubscribe();
      } catch (err) {
        console.warn(`Error unsubscribing from STOMP destination: ${topic}`, err);
      }
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.stompClient) {
      try {
        this.stompClient.disconnect(() => {
          console.log('STOMP client disconnected');
        });
      } catch (e) {
        console.warn('Error during STOMP client disconnect:', e);
      }
    }
    
    this.connected = false;
    this.subscriptions.clear();
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
