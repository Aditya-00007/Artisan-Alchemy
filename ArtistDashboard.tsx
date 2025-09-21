import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, TrendingUp, Eye, Users, DollarSign, Edit, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ArtistDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "",
    stock: 1,
    images: [],
    dimensions: "",
    medium: "",
    year: new Date().getFullYear(),
    style: "",
  });

  const { data: artistProducts = [], isLoading } = useQuery({
    queryKey: ["/api/artists/products"],
    enabled: !!user && user.role === "artist",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowAddProductModal(false);
      setNewProduct({
        title: "",
        description: "",
        categoryId: "",
        price: "",
        stock: 1,
        images: [],
        dimensions: "",
        medium: "",
        year: new Date().getFullYear(),
        style: "",
      });
      toast({
        title: "Product added successfully",
        description: "Your new artwork has been listed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== "artist") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You need to be registered as an artist to view this page.</p>
            <Button asChild data-testid="button-register-artist">
              <Link href="/login">Register as Artist</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalSales = orders
    .filter((order: any) => 
      order.products?.some((p: any) => 
        artistProducts.some((ap: any) => ap.id === p.productId)
      )
    )
    .reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0);

  const totalViews = 12400; // Mock data - would come from analytics API
  const averageRating = 4.9; // Mock data - would be calculated from reviews

  const handleAddProduct = () => {
    if (!newProduct.title || !newProduct.description || !newProduct.categoryId || !newProduct.price) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    addProductMutation.mutate({
      ...newProduct,
      price: parseFloat(newProduct.price).toFixed(2),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.artistPortfolio?.avatar} />
                <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-3xl font-serif font-bold" data-testid="text-artist-name">
                    {user.name}
                  </h1>
                  {user.verifiedStatus && (
                    <Badge className="bg-accent text-accent-foreground">
                      Verified Artist
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {user.artistPortfolio?.specialty || "Artist"}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Dialog open={showAddProductModal} onOpenChange={setShowAddProductModal}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground" data-testid="button-add-product">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Artwork</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={newProduct.title}
                          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                          placeholder="Artwork title"
                          data-testid="input-product-title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price (USD) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="299.99"
                          data-testid="input-product-price"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={newProduct.categoryId} 
                        onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                      >
                        <SelectTrigger data-testid="select-product-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Describe your artwork, inspiration, and creation process..."
                        rows={4}
                        data-testid="textarea-product-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="medium">Medium</Label>
                        <Input
                          id="medium"
                          value={newProduct.medium}
                          onChange={(e) => setNewProduct({ ...newProduct, medium: e.target.value })}
                          placeholder="Oil on Canvas"
                          data-testid="input-product-medium"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dimensions">Dimensions</Label>
                        <Input
                          id="dimensions"
                          value={newProduct.dimensions}
                          onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                          placeholder="24&quot; x 36&quot;"
                          data-testid="input-product-dimensions"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          type="number"
                          value={newProduct.year}
                          onChange={(e) => setNewProduct({ ...newProduct, year: parseInt(e.target.value) })}
                          data-testid="input-product-year"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="style">Style</Label>
                        <Input
                          id="style"
                          value={newProduct.style}
                          onChange={(e) => setNewProduct({ ...newProduct, style: e.target.value })}
                          placeholder="Abstract, Realism, etc."
                          data-testid="input-product-style"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="1"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                          data-testid="input-product-stock"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddProductModal(false)}
                        data-testid="button-cancel-add-product"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddProduct}
                        disabled={addProductMutation.isPending}
                        data-testid="button-save-product"
                      >
                        {addProductMutation.isPending ? "Adding..." : "Add Product"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" data-testid="button-manage-portfolio">
                Manage Portfolio
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-1" data-testid="text-total-sales">
                  ${totalSales.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-active-products">
                  {artistProducts.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent mb-1" data-testid="text-total-views">
                  {totalViews.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-chart-4 mb-1" data-testid="text-average-rating">
                  {averageRating}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center space-x-2" data-testid="tab-products">
              <Package className="w-4 h-4" />
              <span>My Products</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center space-x-2" data-testid="tab-sales">
              <DollarSign className="w-4 h-4" />
              <span>Sales</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2" data-testid="tab-analytics">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center space-x-2" data-testid="tab-verification">
              <Upload className="w-4 h-4" />
              <span>Verification</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Your Artworks</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">Loading your products...</p>
                  </div>
                ) : artistProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No products yet</p>
                    <p className="text-muted-foreground mb-4">Add your first artwork to start selling</p>
                    <Button onClick={() => setShowAddProductModal(true)} data-testid="button-add-first-product">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artistProducts.map((product: any) => (
                      <Card key={product.id} className="group hover:shadow-lg transition-shadow" data-testid={`product-card-${product.id}`}>
                        <div className="relative">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262"}
                            alt={product.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                            data-testid={`img-product-${product.id}`}
                          />
                          {product.authenticityStatus === "verified" && (
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                              Verified
                            </Badge>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex space-x-1">
                              <Button variant="outline" size="sm" data-testid={`button-edit-${product.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" data-testid={`button-delete-${product.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1 truncate" data-testid={`text-product-title-${product.id}`}>
                            {product.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {product.medium} • {product.year}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold" data-testid={`text-product-price-${product.id}`}>
                              ${product.price}
                            </span>
                            <div className="text-sm text-muted-foreground">
                              Stock: {product.stock}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No recent sales</p>
                  <p className="text-muted-foreground">Sales data will appear here once you start selling</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Analytics Coming Soon</p>
                    <p className="text-muted-foreground">Detailed analytics and insights will be available here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visitor Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Visitor Data Coming Soon</p>
                    <p className="text-muted-foreground">Track who visits your profile and products</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verification & Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Artist Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {user.verifiedStatus ? "Verified" : "Pending"}
                      </p>
                    </div>
                  </div>
                  <Badge className={user.verifiedStatus ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {user.verifiedStatus ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <Button variant="outline" className="w-full" data-testid="button-update-verification">
                    Update Verification Documents
                  </Button>
                  <Button variant="outline" className="w-full" data-testid="button-view-analytics">
                    View Detailed Analytics
                  </Button>
                  <Button variant="outline" className="w-full" data-testid="button-manage-profile">
                    Manage Public Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
