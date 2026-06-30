import { io } from 'socket.io-client';

// Coordinates of major locations in Indian cities for mock routing
// Noida (Central) to Delhi (South)
const MOCK_ROUTES = {
  'ORD-9821': [
    { lat: 28.5355, lng: 77.3910, speed: 45, eta: '25 mins' }, // Noida Sec 62
    { lat: 28.5450, lng: 77.3780, speed: 40, eta: '22 mins' },
    { lat: 28.5620, lng: 77.3450, speed: 50, eta: '18 mins' }, // Noida Entry Toll
    { lat: 28.5810, lng: 77.3100, speed: 30, eta: '14 mins' },
    { lat: 28.5900, lng: 77.2800, speed: 20, eta: '10 mins' }, // DND Flyway
    { lat: 28.5700, lng: 77.2500, speed: 42, eta: '7 mins' },
    { lat: 28.5672, lng: 77.2190, speed: 15, eta: '2 mins' },  // Green Park Delhi
  ],
  'ORD-9710': [
    { lat: 28.4595, lng: 77.0266, speed: 35, eta: '35 mins' }, // Gurgaon Sec 29
    { lat: 28.4720, lng: 77.0420, speed: 55, eta: '30 mins' }, // Cyber City
    { lat: 28.5010, lng: 77.0780, speed: 60, eta: '24 mins' }, // NH48 Highway
    { lat: 28.5240, lng: 77.1020, speed: 40, eta: '18 mins' },
    { lat: 28.5420, lng: 77.1350, speed: 45, eta: '12 mins' }, // Vasant Kunj
    { lat: 28.5562, lng: 77.1700, speed: 25, eta: '5 mins' },
    { lat: 28.5685, lng: 77.2090, speed: 0, eta: 'Delivered' }, // AIIMS Area
  ],
};

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.simulators = new Map();
  }

  connect(url = 'http://localhost:5000') {
    try {
      this.socket = io(url, {
        autoConnect: false,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to LogiTrack Socket Server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from LogiTrack Socket Server');
      });

      this.socket.on('tracking_update', (data) => {
        const { orderId } = data;
        if (this.listeners.has(orderId)) {
          this.listeners.get(orderId)(data);
        }
      });

      this.socket.connect();
    } catch (err) {
      console.warn('Socket connection failed, using local simulator:', err.message);
    }
  }

  subscribe(orderId, callback) {
    this.listeners.set(orderId, callback);

    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe_tracking', { orderId });
    } else {
      // Fallback local simulator
      this.startSimulator(orderId, callback);
    }
  }

  unsubscribe(orderId) {
    this.listeners.delete(orderId);

    if (this.socket && this.socket.connected) {
      this.socket.emit('unsubscribe_tracking', { orderId });
    } else {
      this.stopSimulator(orderId);
    }
  }

  startSimulator(orderId, callback) {
    this.stopSimulator(orderId);

    const route = MOCK_ROUTES[orderId] || [
      { lat: 28.5355, lng: 77.3910, speed: 40, eta: '15 mins' },
      { lat: 28.5400, lng: 77.3700, speed: 38, eta: '12 mins' },
      { lat: 28.5480, lng: 77.3500, speed: 45, eta: '8 mins' },
      { lat: 28.5550, lng: 77.3200, speed: 30, eta: '4 mins' },
      { lat: 28.5672, lng: 77.2190, speed: 0, eta: 'Arrived' },
    ];

    let index = 0;
    
    const intervalId = setInterval(() => {
      const data = route[index];
      callback({
        orderId,
        latitude: data.lat,
        longitude: data.lng,
        speed: data.speed,
        eta: data.eta,
        status: index === route.length - 1 ? 'delivered' : 'in_transit',
        timestamp: new Date().toISOString(),
      });

      index = (index + 1) % route.length; // Loop back for demonstration purposes
    }, 4000);

    this.simulators.set(orderId, intervalId);
  }

  stopSimulator(orderId) {
    if (this.simulators.has(orderId)) {
      clearInterval(this.simulators.get(orderId));
      this.simulators.delete(orderId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    // Clean all simulators
    for (const intervalId of this.simulators.values()) {
      clearInterval(intervalId);
    }
    this.simulators.clear();
  }
}

export const socketService = new SocketService();
