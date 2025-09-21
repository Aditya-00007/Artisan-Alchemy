import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Package, Heart, User, Clock, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: cart } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to view your dashboard.</p>
            <Button asChild data-testid="button-sign-in">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0);
  const wishlistCount = 3; // Mock data - would come from API
  const savedStories = 15; // Mock data - would come from API

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.artistPortfolio?.avatar} />
              <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-serif font-bold" data-testid="text-user-name">
                Welcome back, {user.name}
              </h1>
              <p className="text-muted-foreground">Manage your orders, wishlist, and preferences</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-1" data-testid="text-total-orders">
                  {orders.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-secondary mb-1" data-testid="text-wishlist-count">
                  {wishlistCount}
                </div>
                <div className="text-sm text-muted-foreground">Wishlist Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-accent mb-1" data-testid="text-saved-stories">
                  {savedStories}
                </div>
                <div className="text-sm text-muted-foreground">Saved Stories</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-chart-4 mb-1" data-testid="text-total-spent">
                  ${totalSpent.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center space-x-2" data-testid="tab-orders">
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2" data-testid="tab-wishlist">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="recently-viewed" className="flex items-center space-x-2" data-testid="tab-recently-viewed">
              <Eye className="w-4 h-4" />
              <span>Recently Viewed</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2" data-testid="tab-profile">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No orders yet</p>
                    <p className="text-muted-foreground mb-4">Start exploring amazing handcrafted artworks</p>
                    <Button asChild data-testid="button-browse-products">
                      <Link href="/products">Browse Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                        data-testid={`order-${order.id}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusBadgeColor(order.status)} data-testid={`badge-status-${order.id}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="text-lg font-bold mt-1" data-testid={`text-order-total-${order.id}`}>
                              ${parseFloat(order.totalAmount).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {order.products?.slice(0, 3).map((product: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm truncate" data-testid={`text-product-title-${order.id}-${index}`}>
                                  {product.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {product.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                          <Button variant="outline" size="sm" asChild data-testid={`button-view-order-${order.id}`}>
                            <Link href={`/orders/${order.id}`}>View Details</Link>
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-track-order-${order.id}`}>
                            Track Package
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>Your Wishlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Your wishlist is empty</p>
                  <p className="text-muted-foreground mb-4">Save items you love for later</p>
                  <Button asChild data-testid="button-browse-products-wishlist">
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recently Viewed Tab */}
          <TabsContent value="recently-viewed">
            <Card>
              <CardHeader>
                <CardTitle>Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No recently viewed items</p>
                  <p className="text-muted-foreground mb-4">Items you view will appear here</p>
                  <Button asChild data-testid="button-browse-products-recently-viewed">
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="font-medium" data-testid="text-profile-name">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium" data-testid="text-profile-email">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                    <p className="font-medium capitalize" data-testid="text-profile-role">{user.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="font-medium">January 2024</p>
                  </div>
                  <Button className="w-full mt-4" data-testid="button-edit-profile">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Order updates and promotions</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-manage-notifications">
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Shipping Addresses</p>
                      <p className="text-sm text-muted-foreground">Manage your delivery addresses</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-manage-addresses">
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Payment Methods</p>
                      <p className="text-sm text-muted-foreground">Saved cards and payment options</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-manage-payment">
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Privacy Settings</p>
                      <p className="text-sm text-muted-foreground">Control your privacy preferences</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-manage-privacy">
                      Manage
                    </Button>
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
