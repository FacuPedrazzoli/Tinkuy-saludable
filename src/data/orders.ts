import { Product } from '@/types'

export interface MockOrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface MockOrder {
  id: string
  items: MockOrderItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  createdAt: string
}

export const mockOrders: MockOrder[] = [
  {
    id: 'ORD-001',
    items: [
      { productId: '1', productName: 'Almendras Enteras Premium', quantity: 2, price: 2500 },
      { productId: '5', productName: 'Mix de Frutos Secos Premium', quantity: 1, price: 2250 },
    ],
    total: 7250,
    status: 'delivered',
    customer: {
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Santa Fe 1234, CABA',
    },
    createdAt: '2024-02-10',
  },
  {
    id: 'ORD-002',
    items: [
      { productId: '3', productName: 'Pasas de Uva Orgánicas', quantity: 3, price: 2850 },
    ],
    total: 8550,
    status: 'shipped',
    customer: {
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+54 11 2345-6789',
      address: 'Calle Lavalle 567, CABA',
    },
    createdAt: '2024-02-12',
  },
  {
    id: 'ORD-003',
    items: [
      { productId: '2', productName: 'Nueces Peladas Premium', quantity: 1, price: 4200 },
      { productId: '8', productName: 'Semillas de Chía Orgánicas', quantity: 2, price: 1800 },
    ],
    total: 12500,
    status: 'confirmed',
    customer: {
      name: 'Carolina Martínez',
      email: 'carolina.m@email.com',
      phone: '+54 11 3456-7890',
      address: 'Av. Corrientes 890, CABA',
    },
    createdAt: '2024-02-14',
  },
  {
    id: 'ORD-004',
    items: [
      { productId: '10', productName: 'Harina de Almendra', quantity: 1, price: 4200 },
    ],
    total: 4200,
    status: 'pending',
    customer: {
      name: 'Lucas Rodríguez',
      email: 'lucas.r@email.com',
      phone: '+54 11 4567-8901',
      address: 'Calle Florida 234, CABA',
    },
    createdAt: '2024-02-15',
  },
  {
    id: 'ORD-005',
    items: [
      { productId: '1', productName: 'Almendras Enteras Premium', quantity: 2, price: 2500 },
      { productId: '6', productName: 'Cacao Puro en Polvo', quantity: 1, price: 3200 },
      { productId: '12', productName: 'Avena Instantánea', quantity: 3, price: 2450 },
    ],
    total: 18750,
    status: 'delivered',
    customer: {
      name: 'Ana García',
      email: 'ana.garcia@email.com',
      phone: '+54 11 5678-9012',
      address: 'Av. Callao 456, CABA',
    },
    createdAt: '2024-02-05',
  },
]

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  since: string
}

export const clients: Client[] = [
  {
    id: 'CLI-001',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+54 11 1234-5678',
    totalOrders: 12,
    totalSpent: 156000,
    since: '2023-06-15',
  },
  {
    id: 'CLI-002',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+54 11 2345-6789',
    totalOrders: 8,
    totalSpent: 98500,
    since: '2023-08-20',
  },
  {
    id: 'CLI-003',
    name: 'Carolina Martínez',
    email: 'carolina.m@email.com',
    phone: '+54 11 3456-7890',
    totalOrders: 15,
    totalSpent: 234000,
    since: '2023-03-10',
  },
  {
    id: 'CLI-004',
    name: 'Lucas Rodríguez',
    email: 'lucas.r@email.com',
    phone: '+54 11 4567-8901',
    totalOrders: 5,
    totalSpent: 67200,
    since: '2023-11-05',
  },
  {
    id: 'CLI-005',
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    phone: '+54 11 5678-9012',
    totalOrders: 22,
    totalSpent: 312000,
    since: '2023-01-20',
  },
  {
    id: 'CLI-006',
    name: 'Diego López',
    email: 'diego.lopez@email.com',
    phone: '+54 11 6789-0123',
    totalOrders: 7,
    totalSpent: 89100,
    since: '2023-07-30',
  },
  {
    id: 'CLI-007',
    name: 'Valentina Sánchez',
    email: 'valentina.s@email.com',
    phone: '+54 11 7890-1234',
    totalOrders: 10,
    totalSpent: 145000,
    since: '2023-04-15',
  },
  {
    id: 'CLI-008',
    name: 'Martín Torres',
    email: 'martin.torres@email.com',
    phone: '+54 11 8901-2345',
    totalOrders: 4,
    totalSpent: 45800,
    since: '2023-12-01',
  },
]

export const adminMetrics = {
  totalRevenue: 2847500,
  totalOrders: 156,
  totalClients: 89,
  topProducts: ['Almendras Enteras Premium', 'Mix de Frutos Secos Premium', 'Proteína Vegetal Isolate'],
  ordersByStatus: {
    pending: 12,
    confirmed: 23,
    shipped: 18,
    delivered: 103,
  },
  revenueByMonth: [
    { month: 'Ene', revenue: 420000 },
    { month: 'Feb', revenue: 485000 },
    { month: 'Mar', revenue: 512000 },
    { month: 'Abr', revenue: 478000 },
    { month: 'May', revenue: 535000 },
    { month: 'Jun', revenue: 417500 },
  ],
}