export const BASE_SHIPPING_CHARGE = 60;
export const FREE_SHIPPING_THRESHOLD = 5000;

export const calculateShippingCharge = (subtotal: number): number => {
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_CHARGE;
};
