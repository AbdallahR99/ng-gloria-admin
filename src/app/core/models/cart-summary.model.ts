export interface CartSummary {
  subtotal?: number; // Total price of items in the cart before discounts and delivery fees
  oldSubtotal?: number; // Total price of items in the cart before the most recent discount
  discount?: number; // Total discount applied to the cart
  discountPercentage?: number; // Percentage of the discount applied to the cart
  deliveryFee?: number; // Delivery fee for the cart
  total?: number; // Final total price of the cart
}
