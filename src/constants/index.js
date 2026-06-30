export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  AGENT: 'agent',
};

export const ORDER_STATUS = {
  PENDING: 'pending', // created but not assigned
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
};

export const ORDER_TYPES = {
  B2B: 'B2B',
  B2C: 'B2C',
};

export const PAYMENT_TYPES = {
  COD: 'COD',
  PREPAID: 'Prepaid',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending Assignment',
  [ORDER_STATUS.ASSIGNED]: 'Agent Assigned',
  [ORDER_STATUS.PICKED_UP]: 'Picked Up',
  [ORDER_STATUS.IN_TRANSIT]: 'In Transit',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.FAILED]: 'Delivery Failed',
};

export const ZONES = [
  { id: 'zone-1', name: 'North Zone', code: 'NZ-01', description: 'Covers northern city districts' },
  { id: 'zone-2', name: 'South Zone', code: 'SZ-02', description: 'Covers southern tech parks and residential hubs' },
  { id: 'zone-3', name: 'East Zone', code: 'EZ-03', description: 'Covers eastern industrial suburbs' },
  { id: 'zone-4', name: 'West Zone', code: 'WZ-04', description: 'Covers western retail centers' },
  { id: 'zone-5', name: 'Central Zone', code: 'CZ-05', description: 'Covers central business district' },
];

export const AREAS = [
  { id: 'area-1', name: 'Downtown', zip: '110001', zoneId: 'zone-5' },
  { id: 'area-2', name: 'Green Park', zip: '110016', zoneId: 'zone-1' },
  { id: 'area-3', name: 'Cyber City', zip: '122002', zoneId: 'zone-2' },
  { id: 'area-4', name: 'Industrial Area Phase 1', zip: '110020', zoneId: 'zone-3' },
  { id: 'area-5', name: 'Metro Plaza', zip: '110045', zoneId: 'zone-4' },
];
