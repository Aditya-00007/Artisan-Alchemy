import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: open,
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

  const cartItems = (cart as any)?.items || [];
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-80 sm:w-96" data-testid="sidebar-cart">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-cart">
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
          <p className="text-sm text-muted-foreground" data-testid="text-cart-count">
            {cartItems.length} items in cart
          </p>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Your cart is empty</p>
                <Button asChild className="mt-4" data-testid="button-browse-products">
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item.productId} className="flex space-x-3 p-3 bg-muted rounded-lg" data-testid={`cart-item-${item.productId}`}>
                    <img
                      src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                      alt={item.product?.title || "Product"}
                      className="w-16 h-16 rounded-lg object-cover"
                      data-testid={`img-cart-item-${item.productId}`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1" data-testid={`text-cart-title-${item.productId}`}>
                        {item.product?.title || "Unknown Product"}
                      </h4>
                      <p className="text-xs text-muted-foreground" data-testid={`text-cart-artist-${item.productId}`}>
                        by {item.product?.artist?.name || "Unknown Artist"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-sm" data-testid={`text-cart-price-${item.productId}`}>
                          ${item.price}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantityMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 })}
                            className="w-6 h-6 p-0"
                            data-testid={`button-decrease-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center" data-testid={`text-quantity-${item.productId}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantityMutation.mutate({ productId: item.productId, quantity: 1 })}
                            className="w-6 h-6 p-0"
                            data-testid={`button-increase-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
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
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping:</span>
                  <span className="text-primary">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span data-testid="text-total">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-checkout">
                <Link href="/cart">Proceed to Checkout</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
