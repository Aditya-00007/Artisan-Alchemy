import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Share2, ShoppingCart, Star, Tag, Sparkles, ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "../components/Header";
import CategoryNavigation from "../components/CategoryNavigation";
import StoryModal from "../components/StoryModal";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ProductDetailPage() {
  const [, params] = useRoute("/products/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const productId = params?.id;

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["/api/products/category", product?.categoryId],
    enabled: !!product?.categoryId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart/add", {
        productId,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product?.title} has been added to your cart.`,
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

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make a purchase.",
      });
      return;
    }
    addToCartMutation.mutate();
    // In a real app, this would redirect to checkout
  };

  const toggleWishlist = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to wishlist.",
      });
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product?.title} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product?.title,
        text: `Check out this amazing artwork: ${product?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CategoryNavigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-muted rounded-lg h-96"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-muted rounded-lg h-20"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <CategoryNavigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Product not found</h1>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
            <Button asChild data-testid="button-back-products">
              <Link href="/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"];

  const averageRating = 4.2; // This would come from actual reviews
  const reviewCount = 28;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryNavigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[selectedImageIndex]}
                alt={product.title}
                className="w-full rounded-lg aspect-square object-cover"
                data-testid="img-product-main"
              />
              {product.authenticityStatus === "verified" && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                  <Tag className="w-3 h-3 mr-1" />
                  AI Verified
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.title} view ${index + 1}`}
                    className={`w-full h-20 object-cover rounded-lg cursor-pointer border-2 transition-colors ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                    data-testid={`img-thumbnail-${index}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2" data-testid="text-product-title">
                {product.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(averageRating) ? "fill-current" : ""}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{averageRating}</span>
                  <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-foreground" data-testid="text-product-price">
                  ${product.price}
                </span>
                {product.authenticityStatus === "verified" && (
                  <Badge className="bg-accent text-accent-foreground">
                    <Tag className="w-3 h-3 mr-1" />
                    AI Verified Authentic
                  </Badge>
                )}
              </div>
            </div>

            {/* Artist Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={product.artist?.artistPortfolio?.avatar} />
                    <AvatarFallback>{product.artist?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h5 className="font-semibold" data-testid="text-artist-name">
                        {product.artist?.name || "Unknown Artist"}
                      </h5>
                      {product.artist?.verifiedStatus && (
                        <Tag className="w-4 h-4 text-accent" title="Verified Artist" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.artist?.artistPortfolio?.location || "Location not specified"}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="ml-auto" data-testid="button-view-artist">
                    <Link href={`/artists/${product.artist?.id}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Story Button */}
            <Button
              onClick={() => setShowStoryModal(true)}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 text-lg font-semibold hover:shadow-lg transition-all duration-300"
              data-testid="button-know-story"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Know the Story
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock} available
                </span>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  data-testid="button-buy-now"
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleWishlist}
                  data-testid="button-wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current text-red-500" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare} data-testid="button-share">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
            <TabsTrigger value="specifications" data-testid="tab-specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-foreground leading-relaxed" data-testid="text-product-description">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.dimensions && (
                    <div>
                      <span className="font-medium text-muted-foreground">Dimensions:</span>
                      <p className="font-medium" data-testid="text-dimensions">{product.dimensions}</p>
                    </div>
                  )}
                  {product.medium && (
                    <div>
                      <span className="font-medium text-muted-foreground">Medium:</span>
                      <p className="font-medium" data-testid="text-medium">{product.medium}</p>
                    </div>
                  )}
                  {product.year && (
                    <div>
                      <span className="font-medium text-muted-foreground">Year:</span>
                      <p className="font-medium" data-testid="text-year">{product.year}</p>
                    </div>
                  )}
                  {product.style && (
                    <div>
                      <span className="font-medium text-muted-foreground">Style:</span>
                      <p className="font-medium" data-testid="text-style">{product.style}</p>
                    </div>
                  )}
                  {product.verificationId && (
                    <div>
                      <span className="font-medium text-muted-foreground">Verification ID:</span>
                      <p className="font-mono font-medium" data-testid="text-verification-id">
                        {product.verificationId}
                      </p>
                    </div>
                  )}
                  {product.authenticityScore && (
                    <div>
                      <span className="font-medium text-muted-foreground">Authenticity Score:</span>
                      <p className="font-bold text-accent" data-testid="text-authenticity-score">
                        {product.authenticityScore}%
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Reviews feature coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h3 className="text-2xl font-serif font-bold mb-6">Related Artworks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct: any) => (
                <Card key={relatedProduct.id} className="group cursor-pointer hover:shadow-lg transition-all">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={relatedProduct.images?.[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262"}
                        alt={relatedProduct.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1 line-clamp-1">{relatedProduct.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {relatedProduct.artist?.name}
                      </p>
                      <p className="font-bold">${relatedProduct.price}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      <StoryModal
        open={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        product={product}
      />
    </div>
  );
}
