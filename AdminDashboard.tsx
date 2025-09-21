import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Package, Shield, TrendingUp, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === "admin",
  });

  const verifyArtistMutation = useMutation({
    mutationFn: async ({ artistId, approved }: { artistId: string; approved: boolean }) => {
      return apiRequest("POST", "/api/admin/verifyArtist", { artistId, approved });
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: `Artist ${approved ? "approved" : "rejected"}`,
        description: `The artist has been ${approved ? "approved" : "rejected"} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update artist verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyProductMutation = useMutation({
    mutationFn: async ({ productId, approved }: { productId: string; approved: boolean }) => {
      return apiRequest("POST", "/api/admin/verifyProduct", { productId, approved });
    },
    onSuccess: (_, { approved }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: `Product ${approved ? "verified" : "rejected"}`,
        description: `The product has been ${approved ? "verified" : "rejected"} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product verification. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You need admin privileges to view this page.</p>
            <Button asChild data-testid="button-go-home">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingArtists = adminStats?.pendingVerifications?.users || [];
  const pendingProducts = adminStats?.pendingVerifications?.products || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-admin-title">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage users, products, and platform security</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-1" data-testid="text-total-users">
                  {adminStats?.totalUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-pending-verifications">
                  {(adminStats?.pendingArtistVerifications || 0) + (adminStats?.pendingProductVerifications || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Pending Verifications</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent mb-1" data-testid="text-total-products">
                  {adminStats?.totalProducts || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-chart-4 mb-1" data-testid="text-monthly-revenue">
                  ${(adminStats?.totalRevenue || 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Alert for pending verifications */}
          {(pendingArtists.length > 0 || pendingProducts.length > 0) && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have {pendingArtists.length} artist(s) and {pendingProducts.length} product(s) pending verification.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verifications" className="flex items-center space-x-2" data-testid="tab-verifications">
              <Shield className="w-4 h-4" />
              <span>Verifications</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2" data-testid="tab-users">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2" data-testid="tab-products">
              <Package className="w-4 h-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2" data-testid="tab-analytics">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Artist Verifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Artist Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingArtists.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No pending verifications</p>
                      <p className="text-muted-foreground">All artists are verified</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingArtists.map((artist: any) => (
                        <div
                          key={artist.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                          data-testid={`pending-artist-${artist.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={artist.artistPortfolio?.avatar} />
                              <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium" data-testid={`text-artist-name-${artist.id}`}>
                                {artist.name}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-artist-specialty-${artist.id}`}>
                                {artist.artistPortfolio?.specialty || "Artist"}
                              </p>
                              <p className="text-sm text-muted-foreground">{artist.email}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => verifyArtistMutation.mutate({ artistId: artist.id, approved: true })}
                              disabled={verifyArtistMutation.isPending}
                              data-testid={`button-approve-artist-${artist.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => verifyArtistMutation.mutate({ artistId: artist.id, approved: false })}
                              disabled={verifyArtistMutation.isPending}
                              data-testid={`button-reject-artist-${artist.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Product Verifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Product Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">No pending verifications</p>
                      <p className="text-muted-foreground">All products are verified</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingProducts.map((product: any) => (
                        <div
                          key={product.id}
                          className="flex items-start justify-between p-4 bg-muted rounded-lg"
                          data-testid={`pending-product-${product.id}`}
                        >
                          <div className="flex space-x-3">
                            <img
                              src={product.images?.[0] || "https://images.unsplash.com/photo-1541961017774-22349e4a1262"}
                              alt={product.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium" data-testid={`text-product-title-${product.id}`}>
                                {product.title}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-product-price-${product.id}`}>
                                ${product.price}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.medium} • {product.year}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              onClick={() => verifyProductMutation.mutate({ productId: product.id, approved: true })}
                              disabled={verifyProductMutation.isPending}
                              data-testid={`button-approve-product-${product.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => verifyProductMutation.mutate({ productId: product.id, approved: false })}
                              disabled={verifyProductMutation.isPending}
                              data-testid={`button-reject-product-${product.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">User Management Coming Soon</p>
                  <p className="text-muted-foreground">Advanced user management tools will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Product Management Coming Soon</p>
                  <p className="text-muted-foreground">Comprehensive product management tools will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Total Orders:</span>
                      <span className="font-semibold">{adminStats?.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Total Revenue:</span>
                      <span className="font-semibold">${(adminStats?.totalRevenue || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Active Artists:</span>
                      <span className="font-semibold">
                        {adminStats?.totalUsers ? 
                          Math.floor(adminStats.totalUsers * 0.3) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Verified Products:</span>
                      <span className="font-semibold">
                        {adminStats?.totalProducts ? 
                          adminStats.totalProducts - (adminStats.pendingProductVerifications || 0) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Security Dashboard Coming Soon</p>
                    <p className="text-muted-foreground">Fraud detection and security alerts will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
