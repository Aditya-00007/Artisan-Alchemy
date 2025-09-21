import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Filter, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Header from "../components/Header";
import CategoryNavigation from "../components/CategoryNavigation";
import ProductCard from "../components/ProductCard";

export default function ProductListPage() {
  const [location] = useLocation();
  const searchQuery = useSearch();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [authenticityFilter, setAuthenticityFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Parse URL parameters
  const urlParams = new URLSearchParams(searchQuery);
  const categorySlug = location.includes("/category/") ? location.split("/category/")[1] : null;
  const searchParam = urlParams.get("search");

  useEffect(() => {
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParam]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  // Get current category if viewing by category
  const currentCategory = categorySlug 
    ? (categories as any[]).find((cat: any) => cat.slug === categorySlug)
    : null;

  // Filter products based on current filters
  const filteredProducts = (allProducts as any[]).filter((product: any) => {
    // Category filter
    if (currentCategory && product.categoryId !== currentCategory.id) {
      return false;
    }
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoryId)) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = product.title.toLowerCase().includes(searchLower);
      const matchesDescription = product.description.toLowerCase().includes(searchLower);
      const matchesArtist = product.artist?.name.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription && !matchesArtist) {
        return false;
      }
    }

    // Price range filter
    const price = parseFloat(product.price);
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }

    // Authenticity filter
    if (authenticityFilter.length > 0 && !authenticityFilter.includes(product.authenticityStatus)) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name":
        return a.title.localeCompare(b.title);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };

  const handleAuthenticityToggle = (status: string, checked: boolean) => {
    if (checked) {
      setAuthenticityFilter([...authenticityFilter, status]);
    } else {
      setAuthenticityFilter(authenticityFilter.filter(s => s !== status));
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {(categories as any[]).map((category: any) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                data-testid={`checkbox-category-${category.slug}`}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-20"
              data-testid="input-price-min"
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000])}
              className="w-20"
              data-testid="input-price-max"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-3">Authenticity</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={authenticityFilter.includes("verified")}
              onCheckedChange={(checked) => handleAuthenticityToggle("verified", checked as boolean)}
              data-testid="checkbox-authenticity-verified"
            />
            <Label htmlFor="verified" className="text-sm">AI Verified</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pending"
              checked={authenticityFilter.includes("pending")}
              onCheckedChange={(checked) => handleAuthenticityToggle("pending", checked as boolean)}
              data-testid="checkbox-authenticity-pending"
            />
            <Label htmlFor="pending" className="text-sm">Pending Verification</Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryNavigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2" data-testid="text-page-title">
            {currentCategory ? currentCategory.name : searchParam ? `Search Results for "${searchParam}"` : "All Products"}
          </h1>
          <p className="text-muted-foreground" data-testid="text-product-count">
            {sortedProducts.length} products found
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card p-6 rounded-lg border border-border sticky top-24">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-4 w-4" />
                <h2 className="font-semibold">Filters</h2>
              </div>
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden" data-testid="button-mobile-filters">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search-products"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                    data-testid="button-view-grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none border-l"
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading products...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {sortedProducts.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" data-testid="button-load-more">
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
