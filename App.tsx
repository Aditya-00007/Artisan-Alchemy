import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ArtistVerificationPage from "./pages/ArtistVerificationPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/signup" component={SignupPage} />
      <Route path="/auth/verify-email" component={EmailVerificationPage} />
      <Route path="/products" component={ProductListPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/category/:slug" component={ProductListPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/dashboard/customer" component={CustomerDashboard} />
      <Route path="/dashboard/artist" component={ArtistDashboard} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/artist/verify" component={ArtistVerificationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
