import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function CartPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"cart" | "checkout" | "payment">("cart");
  const [shippingForm, setShippingForm] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });
  const [paymentForm, setPaymentForm] = useState({
    method: "credit_card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const { data: cart, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest("DELETE", `/api/cart/remove/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (quantity <= 0) {
        return apiRequest("DELETE", `/api/cart/remove/${productId}`);
      }
      return apiRequest("POST", "/api/cart/add", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart/checkout", {
        shippingAddress: shippingForm,
        paymentDetails: paymentForm,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
      });
      setLocation("/dashboard/customer");
    },
    onError: () => {
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to view your cart.</p>
            <Button asChild data-testid="button-sign-in">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const isShippingFormValid = () => {
    return shippingForm.street && shippingForm.city && shippingForm.state && 
           shippingForm.zipCode && shippingForm.country;
  };

  const isPaymentFormValid = () => {
    if (paymentForm.method === "credit_card") {
      return paymentForm.cardNumber && paymentForm.expiryDate && 
             paymentForm.cvv && paymentForm.cardholderName;
    }
    return true;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Discover amazing handcrafted artworks from verified artists.</p>
            <Button asChild data-testid="button-browse-products">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === "cart" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "cart" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>1</div>
              <span className="font-medium">Cart</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className={`flex items-center space-x-2 ${step === "checkout" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "checkout" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>2</div>
              <span className="font-medium">Checkout</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className={`flex items-center space-x-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>3</div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        {step === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Shopping Cart
                    <span className="text-sm text-muted-foreground" data-testid="text-item-count">
                      {cartItems.length} items
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {cartItems.map((item: any) => (
                      <div key={item.productId} className="flex space-x-4 pb-6 border-b border-border last:border-b-0" data-testid={`cart-item-${item.productId}`}>
                        <img
                          src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262"}
                          alt={item.product?.title}
                          className="w-24 h-24 rounded-lg object-cover"
                          data-testid={`img-cart-item-${item.productId}`}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1" data-testid={`text-item-title-${item.productId}`}>
                            {item.product?.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2" data-testid={`text-item-artist-${item.productId}`}>
                            by {item.product?.artist?.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold" data-testid={`text-item-price-${item.productId}`}>
                              ${item.price}
                            </span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantityMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 })}
                                  className="w-8 h-8 p-0"
                                  data-testid={`button-decrease-${item.productId}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.productId}`}>
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantityMutation.mutate({ productId: item.productId, quantity: 1 })}
                                  className="w-8 h-8 p-0"
                                  data-testid={`button-increase-${item.productId}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemMutation.mutate(item.productId)}
                                className="text-muted-foreground hover:text-destructive"
                                data-testid={`button-remove-${item.productId}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className={shipping === 0 ? "text-primary" : ""} data-testid="text-shipping">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span data-testid="text-tax">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span data-testid="text-total">${total.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full mt-6" 
                    onClick={() => setStep("checkout")}
                    data-testid="button-proceed-checkout"
                  >
                    Proceed to Checkout
                  </Button>
                  <Button asChild variant="outline" className="w-full" data-testid="button-continue-shopping">
                    <Link href="/products">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Continue Shopping
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === "checkout" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={shippingForm.street}
                          onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                          placeholder="123 Main Street"
                          data-testid="input-street"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          placeholder="New York"
                          data-testid="input-city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          placeholder="NY"
                          data-testid="input-state"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={shippingForm.zipCode}
                          onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                          placeholder="10001"
                          data-testid="input-zip"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select 
                          value={shippingForm.country} 
                          onValueChange={(value) => setShippingForm({ ...shippingForm, country: value })}
                        >
                          <SelectTrigger data-testid="select-country">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item: any) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="truncate mr-2">{item.product?.title}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className={shipping === 0 ? "text-primary" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2 mt-6">
                    <Button 
                      className="w-full" 
                      onClick={() => setStep("payment")}
                      disabled={!isShippingFormValid()}
                      data-testid="button-continue-payment"
                    >
                      Continue to Payment
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setStep("cart")}
                      data-testid="button-back-cart"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Payment Method</Label>
                      <Select 
                        value={paymentForm.method} 
                        onValueChange={(value) => setPaymentForm({ ...paymentForm, method: value })}
                      >
                        <SelectTrigger className="mt-2" data-testid="select-payment-method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="apple_pay">Apple Pay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentForm.method === "credit_card" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardholderName">Cardholder Name</Label>
                          <Input
                            id="cardholderName"
                            value={paymentForm.cardholderName}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                            placeholder="John Doe"
                            data-testid="input-cardholder-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            value={paymentForm.cardNumber}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                            placeholder="1234 5678 9012 3456"
                            data-testid="input-card-number"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              value={paymentForm.expiryDate}
                              onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                              placeholder="MM/YY"
                              data-testid="input-expiry-date"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              value={paymentForm.cvv}
                              onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                              placeholder="123"
                              data-testid="input-cvv"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentForm.method === "paypal" && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">You will be redirected to PayPal to complete your payment.</p>
                      </div>
                    )}

                    {paymentForm.method === "apple_pay" && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Use Touch ID or Face ID to pay with Apple Pay.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Final Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Final Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item: any) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="truncate mr-2">{item.product?.title}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span className={shipping === 0 ? "text-primary" : ""}>
                        {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2 mt-6">
                    <Button 
                      className="w-full" 
                      onClick={() => checkoutMutation.mutate()}
                      disabled={!isPaymentFormValid() || checkoutMutation.isPending}
                      data-testid="button-place-order"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {checkoutMutation.isPending ? "Processing..." : "Place Order"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setStep("checkout")}
                      data-testid="button-back-checkout"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Checkout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
