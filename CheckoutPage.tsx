import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, CreditCard, Truck, Calendar, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
import Header from "../components/Header";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  mobile: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    name: user?.name || "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    mobile: "",
  });

  // Get cart data
  const { data: cart } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Mock saved addresses - in real app would come from backend
  const savedAddresses: Address[] = [
    {
      id: "1",
      name: "Home",
      street: "123 MG Road, Koregaon Park",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411001",
      mobile: "+91 98765 43210",
      isDefault: true,
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    
    // Set default address
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
    }

    // Set minimum delivery date (3 days from now)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    setDeliveryDate(minDate.toISOString().split('T')[0]);
  }, [user, navigate]);

  const cartItems = (cart as any)?.items || [];
  const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const selectedAddr = selectedAddress === "new" 
        ? {
            name: newAddress.name,
            street: newAddress.street,
            city: newAddress.city,
            state: newAddress.state,
            pinCode: newAddress.pinCode,
            mobile: newAddress.mobile,
          }
        : savedAddresses.find(addr => addr.id === selectedAddress);

      return apiRequest("POST", "/api/orders/checkout", {
        shippingAddress: selectedAddr,
        paymentDetails: {
          method: paymentMethod,
          expectedDelivery: deliveryDate,
        },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${data.id} has been confirmed.`,
      });
      navigate(`/orders/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select or add a delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (selectedAddress === "new") {
      if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pinCode || !newAddress.mobile) {
        toast({
          title: "Complete Address",
          description: "Please fill in all address fields.",
          variant: "destructive",
        });
        return;
      }
    }

    placeOrderMutation.mutate();
  };

  if (!user) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some beautiful artworks to proceed with checkout.</p>
          <Button data-testid="button-continue-shopping" onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={selectedAddress} 
                  onValueChange={setSelectedAddress}
                  className="space-y-4"
                >
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedAddress(address.id)}>
                        <div className="font-medium">{address.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {address.street}<br />
                          {address.city}, {address.state} - {address.pinCode}<br />
                          Mobile: {address.mobile}
                        </div>
                        {address.isDefault && (
                          <div className="text-xs text-primary font-medium mt-1">Default Address</div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="new" id="new-address" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="new-address" className="cursor-pointer font-medium">
                        Add New Address
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {selectedAddress === "new" && (
                  <div className="mt-4 p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          data-testid="input-name"
                          id="name"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                          data-testid="input-mobile"
                          id="mobile"
                          value={newAddress.mobile}
                          onChange={(e) => setNewAddress({...newAddress, mobile: e.target.value})}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        data-testid="input-street"
                        id="street"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                        placeholder="House/Flat no, Building, Street"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          data-testid="input-city"
                          id="city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select 
                          value={newAddress.state} 
                          onValueChange={(value) => setNewAddress({...newAddress, state: value})}
                        >
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                            <SelectItem value="gujarat">Gujarat</SelectItem>
                            <SelectItem value="rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input
                          data-testid="input-pincode"
                          id="pincode"
                          value={newAddress.pinCode}
                          onChange={(e) => setNewAddress({...newAddress, pinCode: e.target.value})}
                          placeholder="PIN Code"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center cursor-pointer">
                      <span className="text-2xl mr-2">📱</span>
                      UPI (Google Pay, PhonePe, Paytm)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer">
                      <span className="text-2xl mr-2">💳</span>
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking" className="flex items-center cursor-pointer">
                      <span className="text-2xl mr-2">🏦</span>
                      Net Banking
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center cursor-pointer">
                      <span className="text-2xl mr-2">💵</span>
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Delivery Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Expected Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="delivery-date">Preferred Delivery Date</Label>
                    <Input
                      data-testid="input-delivery-date"
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum 3 days required for handcrafted items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item: any) => (
                    <div key={item.productId} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST 18%)</span>
                    <span>₹{(totalAmount * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{(totalAmount * 1.18).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button
                  data-testid="button-place-order"
                  onClick={handlePlaceOrder}
                  disabled={placeOrderMutation.isPending || !selectedAddress}
                  className="w-full mt-6"
                  size="lg"
                >
                  {placeOrderMutation.isPending ? (
                    "Placing Order..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Place Order ₹{(totalAmount * 1.18).toLocaleString('en-IN')}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center mt-2">
                  By placing this order, you agree to our Terms & Conditions
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}