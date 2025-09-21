import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, Palette, ChevronDown, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import CartSidebar from "./CartSidebar";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data: cart } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const cartItemCount = (cart as any)?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="bg-card shadow-md sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-muted py-2 text-sm">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex space-x-4">
              <span className="text-muted-foreground">Free shipping on orders over $100</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Support handcrafted artists worldwide</span>
            </div>
            <div className="flex space-x-4 text-muted-foreground">
              <Link href="/help" className="hover:text-foreground transition-colors">
                Help
              </Link>
              <Link href="/track" className="hover:text-foreground transition-colors">
                Track Order
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="hover:text-foreground transition-colors p-0 h-auto"
                data-testid="button-toggle-darkmode"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="bg-card">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
                <Palette className="text-primary text-2xl" />
                <h1 className="text-2xl font-serif font-bold text-primary">Artisan Alley</h1>
              </Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search for handcrafted art, sculptures, paintings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 px-4 pr-12"
                    data-testid="input-search"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                    data-testid="button-search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-6">
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:text-primary transition-colors"
                    data-testid="button-wishlist"
                  >
                    <Heart className="h-5 w-5" />
                    <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </Button>
                )}

                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCartSidebar(true)}
                    className="relative hover:text-primary transition-colors"
                    data-testid="button-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                )}

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-3" data-testid="button-user-menu">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.artistPortfolio?.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.role === 'artist' && user.verifiedStatus ? 'Verified Artist' : user.role}
                          </p>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${user.role}`} data-testid="link-dashboard">
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" data-testid="link-profile">
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} data-testid="button-logout">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild data-testid="button-login">
                    <Link href="/login">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar open={showCartSidebar} onClose={() => setShowCartSidebar(false)} />
    </>
  );
}
