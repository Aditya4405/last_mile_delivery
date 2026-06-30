import { ORDER_STATUS, ROLES } from '../constants';

const SEED_ZONES = [
  { id: 'zone-1', name: 'North Zone', code: 'NZ-01', description: 'Covers northern city districts' },
  { id: 'zone-2', name: 'South Zone', code: 'SZ-02', description: 'Covers southern tech parks' },
  { id: 'zone-3', name: 'East Zone', code: 'EZ-03', description: 'Covers eastern suburbs' },
  { id: 'zone-4', name: 'West Zone', code: 'WZ-04', description: 'Covers western business plazas' },
  { id: 'zone-5', name: 'Central Zone', code: 'CZ-05', description: 'Covers central business district' },
];

const SEED_AREAS = [
  { id: 'area-1', name: 'Downtown Center', zip: '110001', zoneId: 'zone-5' },
  { id: 'area-2', name: 'Green Park Estate', zip: '110016', zoneId: 'zone-1' },
  { id: 'area-3', name: 'Cyber City Hub', zip: '122002', zoneId: 'zone-2' },
  { id: 'area-4', name: 'Industrial Complex', zip: '110020', zoneId: 'zone-3' },
  { id: 'area-5', name: 'Metro Retail Plaza', zip: '110045', zoneId: 'zone-4' },
];

const SEED_RATE_CARDS = [
  { id: 'rate-1', type: 'B2C', scope: 'Intra Zone', baseWeight: 1, basePrice: 5.0, extraWeightPrice: 2.0, codCharge: 1.5 },
  { id: 'rate-2', type: 'B2C', scope: 'Inter Zone', baseWeight: 1, basePrice: 8.5, extraWeightPrice: 3.5, codCharge: 2.0 },
  { id: 'rate-3', type: 'B2B', scope: 'Intra Zone', baseWeight: 5, basePrice: 15.0, extraWeightPrice: 1.5, codCharge: 0.0 },
  { id: 'rate-4', type: 'B2B', scope: 'Inter Zone', baseWeight: 5, basePrice: 28.0, extraWeightPrice: 2.5, codCharge: 2.0 },
];

const SEED_AGENTS = [
  {
    id: 'user-agent-1',
    name: 'John Delivery Agent',
    email: 'agent@swiftroute.com',
    phone: '+1 (555) 012-3456',
    role: ROLES.AGENT,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'active',
    workload: 2,
    vehicle: 'Electric Bike',
    license: 'DL-98214-A',
    rating: 4.8,
    zoneId: 'zone-5',
  },
  {
    id: 'user-agent-2',
    name: 'Sarah Smith',
    email: 'sarah.agent@swiftroute.com',
    phone: '+1 (555) 019-9021',
    role: ROLES.AGENT,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'active',
    workload: 1,
    vehicle: 'Mini Van',
    license: 'DL-55241-B',
    rating: 4.9,
    zoneId: 'zone-1',
  },
  {
    id: 'user-agent-3',
    name: 'Mike Tyson',
    email: 'mike.agent@swiftroute.com',
    phone: '+1 (555) 018-8822',
    role: ROLES.AGENT,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'inactive',
    workload: 0,
    vehicle: 'Motorcycle',
    license: 'DL-66512-C',
    rating: 4.5,
    zoneId: 'zone-3',
  },
];

const SEED_ORDERS = [
  {
    id: 'ORD-9821',
    trackingNumber: 'TRK-9821-456',
    pickupAddress: 'Green Park Plaza, Block C, Room 102',
    pickupZone: 'zone-1',
    dropAddress: 'Downtown Office Towers, Floor 14',
    dropZone: 'zone-5',
    length: 30,
    breadth: 20,
    height: 15,
    actualWeight: 2.5,
    volumetricWeight: 1.8,
    billableWeight: 2.5,
    orderType: 'B2C',
    paymentType: 'Prepaid',
    price: 15.5,
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    status: ORDER_STATUS.PENDING,
    customerId: 'user-customer-1',
    customerName: 'Customer Aditya',
    assignedAgentId: null,
    assignedAgentName: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
    timeline: [
      {
        status: ORDER_STATUS.PENDING,
        title: 'Order Created',
        description: 'Order registered successfully by Customer Aditya.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isCompleted: true,
        isActive: true,
      },
    ],
  },
  {
    id: 'ORD-9710',
    trackingNumber: 'TRK-9710-112',
    pickupAddress: 'Cyber City Hub, Tower A',
    pickupZone: 'zone-2',
    dropAddress: 'Metro Retail Plaza, Shop 5',
    dropZone: 'zone-4',
    length: 15,
    breadth: 15,
    height: 10,
    actualWeight: 0.8,
    volumetricWeight: 0.45,
    billableWeight: 0.8,
    orderType: 'B2B',
    paymentType: 'COD',
    price: 32.0,
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // in 4 hours
    status: ORDER_STATUS.ASSIGNED,
    customerId: 'user-customer-1',
    customerName: 'Customer Aditya',
    assignedAgentId: 'user-agent-1',
    assignedAgentName: 'John Delivery Agent',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    timeline: [
      {
        status: ORDER_STATUS.PENDING,
        title: 'Order Created',
        description: 'Order registered successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        isCompleted: true,
        isActive: false,
      },
      {
        status: ORDER_STATUS.ASSIGNED,
        title: 'Agent Assigned',
        description: 'Delivery Agent John Delivery Agent is scheduled for pickup.',
        timestamp: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
        isCompleted: true,
        isActive: true,
      },
    ],
  },
  {
    id: 'ORD-9605',
    trackingNumber: 'TRK-9605-779',
    pickupAddress: 'Downtown Center, Main Warehouse',
    pickupZone: 'zone-5',
    dropAddress: 'Industrial Complex, Facility B',
    dropZone: 'zone-3',
    length: 60,
    breadth: 40,
    height: 30,
    actualWeight: 14.5,
    volumetricWeight: 14.4,
    billableWeight: 14.5,
    orderType: 'B2B',
    paymentType: 'Prepaid',
    price: 45.0,
    estimatedDelivery: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    status: ORDER_STATUS.DELIVERED,
    customerId: 'user-customer-1',
    customerName: 'Customer Aditya',
    assignedAgentId: 'user-agent-2',
    assignedAgentName: 'Sarah Smith',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    timeline: [
      {
        status: ORDER_STATUS.PENDING,
        title: 'Order Created',
        description: 'Order registered successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        isCompleted: true,
        isActive: false,
      },
      {
        status: ORDER_STATUS.ASSIGNED,
        title: 'Agent Assigned',
        description: 'Scheduled with Agent Sarah Smith.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
        isCompleted: true,
        isActive: false,
      },
      {
        status: ORDER_STATUS.PICKED_UP,
        title: 'Picked Up',
        description: 'Package received by agent.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        isCompleted: true,
        isActive: false,
      },
      {
        status: ORDER_STATUS.IN_TRANSIT,
        title: 'In Transit',
        description: 'Shipment has departed warehouse.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        isCompleted: true,
        isActive: false,
      },
      {
        status: ORDER_STATUS.OUT_FOR_DELIVERY,
        title: 'Out for Delivery',
        description: 'Agent is in your area.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        isCompleted: true,
        isActive: false,
      },
      {
        status: ORDER_STATUS.DELIVERED,
        title: 'Delivered',
        description: 'Successfully received by client. OTP Verification passed.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        isCompleted: true,
        isActive: true,
      },
    ],
  },
];

const SEED_TICKETS = [
  { id: 'TCK-101', subject: 'Delayed Delivery ORD-9710', orderId: 'ORD-9710', status: 'Open', message: 'Why is the agent taking long for pickup?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'TCK-102', subject: 'Invoice Billing Query', orderId: 'ORD-9605', status: 'Closed', message: 'Can you please resend the final billing invoice?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
];

// Helper to initialize and retrieve database collections
export const getCollection = (key) => {
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  // Seed default collections if none exists
  let initial = [];
  if (key === 'orders') initial = SEED_ORDERS;
  else if (key === 'zones') initial = SEED_ZONES;
  else if (key === 'areas') initial = SEED_AREAS;
  else if (key === 'rate_cards') initial = SEED_RATE_CARDS;
  else if (key === 'agents') initial = SEED_AGENTS;
  else if (key === 'tickets') initial = SEED_TICKETS;

  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

export const setCollection = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
