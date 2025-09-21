import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: string;
    images: string[];
    authenticityStatus: string;
    artist?: {
      id: string;
      name: string;
      verifiedStatus: boolean;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart/add", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleWishlist = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to wishlist.",
      });
      return;
    }
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300" data-testid={`card-product-${product.id}`}>
      <Link href={`/products/${product.id}`}>
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-product-${product.id}`}
          />
          {product.authenticityStatus === "verified" && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
              <Tag className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist();
            }}
            className={`absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors ${
              isWishlisted ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            }`}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h4 className="font-serif font-semibold text-lg text-card-foreground mb-2 line-clamp-2" data-testid={`text-title-${product.id}`}>
            {product.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-2" data-testid={`text-artist-${product.id}`}>
            by {product.artist?.name || "Unknown Artist"}
            {product.artist?.verifiedStatus && (
              <Tag className="inline w-3 h-3 ml-1 text-accent" />
            )}
          </p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-foreground" data-testid={`text-price-${product.id}`}>
              ${product.price}
            </span>
            <div className="flex items-center space-x-1">
              <div className="flex text-accent">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">(28)</span>
            </div>
          </div>
        </Link>
        <Button
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          data-testid={`button-add-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
