import { API_BASE_URL } from './productService';

export interface Message {
  id: number;
  sender_user: number | null;
  sender_brand: number | null;
  receiver_user: number | null;
  receiver_brand: number | null;
  product: number;
  message: string;
  timestamp: string;
  is_from_brand: boolean;
  sender_username: string | null;
  receiver_username: string | null;
}

export interface Conversation {
  product_id: number;
  product_name: string;
  product_image: string | null;
  brand_name: string;
  other_party_name: string;
  last_message: string;
  last_message_time: string;
  is_last_from_brand: boolean;
  is_last_from_me?: boolean;
  last_sender_name?: string | null;
  unread_count: number;
  chat_type?: 'brand' | 'user';
}

export async function getConversations(token: string): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/auth/messages/conversations/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
}

export async function getProductMessages(token: string, productId: number): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/auth/products/${productId}/messages/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
}

export async function sendMessage(token: string, productId: number, message: string): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/auth/messages/send/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, message }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

export async function sendMessageToUser(
  token: string,
  productId: number,
  receiverUsername: string,
  message: string
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/auth/messages/send/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId, message, receiver_username: receiverUsername }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

export async function getProductMessagesWithUser(
  token: string,
  productId: number,
  chatWith: string
): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/auth/products/${productId}/messages/?chat_with=${encodeURIComponent(chatWith)}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
}

export async function sendMessageToBrand(
  token: string,
  brandUsername: string,
  message: string,
  productId?: number
): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/auth/messages/send-to-brand/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      brand_username: brandUsername,
      message,
      product_id: productId,
    }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}
