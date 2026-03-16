import { API_BASE_URL } from './productService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  product_price: number;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
  line_total: number;
}

export interface Order {
  id: number;
  username: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_method: 'cod' | 'card' | 'wallet';
  payment_status: string;
  shipping_full_name: string;
  shipping_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CheckoutData {
  address_id?: number;
  shipping_full_name?: string;
  shipping_phone?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  payment_method: 'cod' | 'card' | 'wallet';
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as any).detail ||
        Object.values(err as Record<string, string[]>)
          .flat()
          .join(', ') ||
        'Request failed'
    );
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer APIs
// ─────────────────────────────────────────────────────────────────────────────

/** Place an order from the customer's current cart */
export const checkout = async (token: string, data: CheckoutData): Promise<Order> => {
  const res = await fetch(`${API_BASE_URL}/auth/checkout/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<Order>(res);
};

/** List all orders for the current customer */
export const getOrders = async (token: string): Promise<Order[]> => {
  const res = await fetch(`${API_BASE_URL}/auth/orders/`, {
    headers: authHeaders(token),
  });
  return handleResponse<Order[]>(res);
};

/** Get a single order by ID */
export const getOrder = async (token: string, orderId: number): Promise<Order> => {
  const res = await fetch(`${API_BASE_URL}/auth/orders/${orderId}/`, {
    headers: authHeaders(token),
  });
  return handleResponse<Order>(res);
};

/** Cancel a pending/confirmed order */
export const cancelOrder = async (token: string, orderId: number): Promise<Order> => {
  const res = await fetch(`${API_BASE_URL}/auth/orders/${orderId}/cancel/`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return handleResponse<Order>(res);
};

// ─────────────────────────────────────────────────────────────────────────────
// Brand APIs
// ─────────────────────────────────────────────────────────────────────────────

/** List orders containing this brand's products */
export const getBrandOrders = async (token: string): Promise<Order[]> => {
  const res = await fetch(`${API_BASE_URL}/auth/brand/orders/`, {
    headers: authHeaders(token),
  });
  return handleResponse<Order[]>(res);
};

/** Get one order containing this brand's products */
export const getBrandOrder = async (token: string, orderId: number): Promise<Order> => {
  const res = await fetch(`${API_BASE_URL}/auth/brand/orders/${orderId}/`, {
    headers: authHeaders(token),
  });
  return handleResponse<Order>(res);
};

/** Update order status (brand only) */
export const updateOrderStatus = async (
  token: string,
  orderId: number,
  orderStatus: string
): Promise<Order> => {
  const res = await fetch(`${API_BASE_URL}/auth/brand/orders/${orderId}/status/`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ status: orderStatus }),
  });
  return handleResponse<Order>(res);
};
