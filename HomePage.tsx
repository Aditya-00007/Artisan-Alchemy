import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Palette, Camera, Hammer, Gem, Laptop, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/Header";
import CategoryNavigation from "../components/CategoryNavigation";
import ProductCard from "../components/ProductCard";

const categoryIcons = {
  paintings: Palette,
  sculptures: Hammer,
  crafts: Scissors,
  photography: Camera,
  "digital-art": Laptop,
  jewelry: Gem,
};

export default function HomePage() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: featuredArtists = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const trendingProducts = (products as any[])?.slice(0, 4) || [];
  const artists = (featuredArtists as any[])?.filter((user: any) => user.role === 'artist' && user.verifiedStatus)?.slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      <Header />
      <CategoryNavigation />

      <main>
        {/* Hero Section */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`,
            }}
          />
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 text-center text-white">
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4">Discover Authentic</h2>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-accent">Handcrafted Art</h2>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Connect with verified artists and explore unique stories behind every masterpiece. Each piece comes with AI-powered authenticity verification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg" data-testid="button-explore-artwork">
                  <Link href="/products">Explore Artwork</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-foreground text-lg" data-testid="button-become-artist">
                  <Link href="/login">Become an Artist</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Showcase */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Shop by Category</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover unique handcrafted pieces across various artistic disciplines
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {(categories as any[])?.map((category: any) => {
                const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Palette;
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="group cursor-pointer"
                    data-testid={`card-category-${category.slug}`}
                  >
                    <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="text-primary text-2xl" />
                      </div>
                      <h4 className="font-semibold text-card-foreground mb-1">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">1,234 items</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-serif font-bold text-foreground">Trending Artworks</h3>
              <Button asChild variant="link" className="text-primary hover:text-primary/80 font-semibold" data-testid="link-view-all-trending">
                <Link href="/products">View All →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Artist Spotlight */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Featured Artists</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet the talented creators behind our verified handcrafted pieces
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {artists.map((artist: any) => (
                <div
                  key={artist.id}
                  className="bg-card rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border text-center group"
                  data-testid={`card-artist-${artist.id}`}
                >
                  <img
                    src={artist.artistPortfolio?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"}
                    alt={`${artist.name} - Artist profile photo`}
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-primary/20 group-hover:border-primary/40 transition-colors object-cover"
                  />
                  <div className="flex items-center justify-center mb-2">
                    <h4 className="font-semibold text-lg text-card-foreground mr-2">{artist.name}</h4>
                    <Gem className="text-accent w-4 h-4" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{artist.artistPortfolio?.specialty}</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-4">
                    <span>23 Artworks</span>
                    <span>•</span>
                    <span>4.9 ⭐</span>
                  </div>
                  <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" data-testid={`button-view-artist-${artist.id}`}>
                    <Link href={`/artists/${artist.id}`}>View Profile</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <Gem className="text-accent text-2xl" />
                </div>
                <h4 className="font-semibold text-lg mb-2">AI-Powered Authenticity</h4>
                <p className="text-muted-foreground">
                  Every piece is verified using advanced AI to ensure authentic handcrafted quality.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Palette className="text-primary text-2xl" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Verified Artists</h4>
                <p className="text-muted-foreground">
                  Connect directly with verified artists and discover the stories behind their creations.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Camera className="text-secondary text-2xl" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Secure Worldwide Shipping</h4>
                <p className="text-muted-foreground">
                  Safe and insured shipping to ensure your artwork arrives in perfect condition.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="text-accent text-xl" />
                <h4 className="text-xl font-serif font-bold">Artisan Alley</h4>
              </div>
              <p className="text-sm text-secondary-foreground/80 mb-4">
                Connecting authentic artists with art lovers worldwide. Every piece tells a story, every purchase supports creativity.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">For Customers</h5>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li><Link href="/help" className="hover:text-accent transition-colors">How to Buy</Link></li>
                <li><Link href="/authenticity" className="hover:text-accent transition-colors">Authenticity Guarantee</Link></li>
                <li><Link href="/shipping" className="hover:text-accent transition-colors">Shipping & Returns</Link></li>
                <li><Link href="/support" className="hover:text-accent transition-colors">Customer Support</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">For Artists</h5>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li><Link href="/login" className="hover:text-accent transition-colors">Become an Artist</Link></li>
                <li><Link href="/verification" className="hover:text-accent transition-colors">Verification Process</Link></li>
                <li><Link href="/seller-tools" className="hover:text-accent transition-colors">Seller Tools</Link></li>
                <li><Link href="/commission" className="hover:text-accent transition-colors">Commission Structure</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><Link href="/careers" className="hover:text-accent transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-secondary-foreground/60">© 2024 Artisan Alley. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-sm">
                  <Gem className="text-accent" />
                  <span className="text-secondary-foreground/80">AI-Powered Authenticity</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Camera className="text-accent" />
                  <span className="text-secondary-foreground/80">Secure Worldwide Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
