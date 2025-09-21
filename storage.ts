import { type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct, type Cart, type InsertCart, type Order, type InsertOrder, type Review, type InsertReview } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: { categoryId?: string; artistId?: string; limit?: number; offset?: number }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductsByArtist(artistId: string): Promise<Product[]>;
  
  // Cart operations
  getCart(userId: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  updateCart(userId: string, updates: Partial<Cart>): Promise<Cart | undefined>;
  
  // Order operations
  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  
  // Review operations
  getReviews(productId: string): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Admin operations
  getUsers(role?: string): Promise<User[]>;
  getPendingVerifications(): Promise<{ users: User[], products: Product[] }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private carts: Map<string, Cart>;
  private orders: Map<string, Order>;
  private reviews: Map<string, Review>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.carts = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    
    // Seed initial data
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categories = [
      { id: randomUUID(), name: "Paintings", description: "Original oil, acrylic, and watercolor paintings", slug: "paintings" },
      { id: randomUUID(), name: "Sculptures", description: "Handcrafted sculptures in various materials", slug: "sculptures" },
      { id: randomUUID(), name: "Crafts", description: "Unique handmade crafts and decorative items", slug: "crafts" },
      { id: randomUUID(), name: "Photography", description: "Fine art photography prints", slug: "photography" },
      { id: randomUUID(), name: "Digital Art", description: "Digital artwork and NFTs", slug: "digital-art" },
      { id: randomUUID(), name: "Jewelry", description: "Handcrafted jewelry and accessories", slug: "jewelry" },
    ];
    
    categories.forEach(cat => this.categories.set(cat.id, cat));
    
    // Seed admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      name: "Admin User",
      email: "admin@artisanalley.com",
      password: "$2b$10$hashedpassword", // In real app, this would be properly hashed
      role: "admin",
      verifiedStatus: true,
      artistPortfolio: null,
      createdAt: new Date(),
    });

    // Seed verified Indian artists
    const artist1Id = randomUUID();
    const artist2Id = randomUUID();
    const artist3Id = randomUUID();
    const artist4Id = randomUUID();
    const artist5Id = randomUUID();
    
    this.users.set(artist1Id, {
      id: artist1Id,
      name: "Sarthak Jadhav",
      email: "sarthak@artisanalley.com",
      password: "$2b$10$hashedpassword",
      role: "artist",
      verifiedStatus: true,
      emailVerified: true,
      emailVerificationOTP: null,
      emailOTPExpiry: null,
      artistPortfolio: {
        bio: "Traditional Warli art specialist from Maharashtra creating modern interpretations of ancient tribal art forms",
        specialty: "Warli Paintings & Contemporary Art",
        location: "Pune, Maharashtra",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
      },
      createdAt: new Date(),
    });

    this.users.set(artist2Id, {
      id: artist2Id,
      name: "Aditya Thete",
      email: "aditya@artisanalley.com",
      password: "$2b$10$hashedpassword",
      role: "artist",
      verifiedStatus: true,
      emailVerified: true,
      emailVerificationOTP: null,
      emailOTPExpiry: null,
      artistPortfolio: {
        bio: "Contemporary sculptor working with traditional Indian materials like sandalwood and marble",
        specialty: "Traditional Indian Sculptures",
        location: "Mumbai, Maharashtra",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
      },
      createdAt: new Date(),
    });

    this.users.set(artist3Id, {
      id: artist3Id,
      name: "Abhishek Patade",
      email: "abhishek@artisanalley.com",
      password: "$2b$10$hashedpassword",
      role: "artist",
      verifiedStatus: true,
      emailVerified: true,
      emailVerificationOTP: null,
      emailOTPExpiry: null,
      artistPortfolio: {
        bio: "Digital artist blending traditional Madhubani art with modern digital techniques",
        specialty: "Digital Madhubani Art",
        location: "Nagpur, Maharashtra",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
      },
      createdAt: new Date(),
    });

    this.users.set(artist4Id, {
      id: artist4Id,
      name: "Shubham Pagar",
      email: "shubham@artisanalley.com",
      password: "$2b$10$hashedpassword",
      role: "artist",
      verifiedStatus: true,
      emailVerified: true,
      emailVerificationOTP: null,
      emailOTPExpiry: null,
      artistPortfolio: {
        bio: "Master craftsman specializing in traditional Kolhapuri leather goods and contemporary accessories",
        specialty: "Leather Crafts & Accessories",
        location: "Kolhapur, Maharashtra",
        avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
      },
      createdAt: new Date(),
    });

    this.users.set(artist5Id, {
      id: artist5Id,
      name: "Sakshi Peharkar",
      email: "sakshi@artisanalley.com",
      password: "$2b$10$hashedpassword",
      role: "artist",
      verifiedStatus: true,
      emailVerified: true,
      emailVerificationOTP: null,
      emailOTPExpiry: null,
      artistPortfolio: {
        bio: "Jewelry designer creating exquisite pieces inspired by traditional Maharashtrian designs",
        specialty: "Traditional Indian Jewelry",
        location: "Aurangabad, Maharashtra",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"
      },
      createdAt: new Date(),
    });

    // Seed sample products
    const paintingCat = Array.from(this.categories.values()).find(c => c.slug === "paintings")!;
    const sculptureCat = Array.from(this.categories.values()).find(c => c.slug === "sculptures")!;
    const jewelryCat = Array.from(this.categories.values()).find(c => c.slug === "jewelry")!;
    const craftsCat = Array.from(this.categories.values()).find(c => c.slug === "crafts")!;

    const products = [
      {
        id: randomUUID(),
        title: "Traditional Warli Village Life",
        description: "Authentic Warli painting depicting the harmonious village life with traditional tribal motifs. Hand-painted using natural pigments on handmade paper, celebrating the rich cultural heritage of Maharashtra.",
        categoryId: paintingCat.id,
        price: "15999.00", // ₹15,999
        stock: 1,
        artistId: artist1Id,
        images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"],
        story: "Inspired by the ancestral wisdom of Warli tribes, this piece tells the story of community, harvest, and celebration in rural Maharashtra.",
        authenticityStatus: "verified",
        authenticityScore: "99.50",
        dimensions: "18\" × 24\"",
        medium: "Natural Pigments on Handmade Paper",
        year: 2024,
        style: "Traditional Warli",
        verificationId: "ART-2024-SJ01",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Ganesha Marble Sculpture",
        description: "Exquisite Lord Ganesha sculpture carved from premium Makrana marble with intricate traditional motifs. Each detail is hand-carved with devotion and artistic mastery.",
        categoryId: sculptureCat.id,
        price: "45999.00", // ₹45,999
        stock: 1,
        artistId: artist2Id,
        images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"],
        story: "Carved during the auspicious month of Bhadrapada, this sculpture embodies the divine energy and blessings of Lord Ganesha for prosperity and wisdom.",
        authenticityStatus: "verified",
        authenticityScore: "98.80",
        dimensions: "12\" × 8\" × 6\"",
        medium: "Makrana Marble",
        year: 2024,
        style: "Traditional Indian",
        verificationId: "ART-2024-AT02",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Digital Madhubani Fish",
        description: "Contemporary digital interpretation of traditional Madhubani fish motifs, symbolizing fertility and prosperity. Printed on premium canvas with archival inks.",
        categoryId: paintingCat.id,
        price: "8999.00", // ₹8,999
        stock: 3,
        artistId: artist3Id,
        images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"],
        story: "Blending ancient Mithila art traditions with modern digital techniques, this piece bridges generations of artistic expression.",
        authenticityStatus: "verified",
        authenticityScore: "97.20",
        dimensions: "16\" × 20\"",
        medium: "Digital Art on Canvas",
        year: 2024,
        style: "Digital Madhubani",
        verificationId: "ART-2024-AP03",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Kolhapuri Leather Handbag",
        description: "Handcrafted premium leather handbag using traditional Kolhapuri techniques. Features intricate embossed patterns and durable brass fittings.",
        categoryId: craftsCat.id,
        price: "12999.00", // ₹12,999
        stock: 2,
        artistId: artist4Id,
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"],
        story: "Crafted using age-old Kolhapuri leather techniques passed down through generations, each bag tells a story of craftsmanship and heritage.",
        authenticityStatus: "verified",
        authenticityScore: "99.10",
        dimensions: "14\" × 10\" × 4\"",
        medium: "Premium Leather, Brass",
        year: 2024,
        style: "Traditional Kolhapuri",
        verificationId: "ART-2024-SP04",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Maharashtrian Nath Jewelry",
        description: "Exquisite traditional nose ring (Nath) inspired by Maharashtrian bridal jewelry. Handcrafted in sterling silver with intricate filigree work and kundan stones.",
        categoryId: jewelryCat.id,
        price: "25999.00", // ₹25,999
        stock: 1,
        artistId: artist5Id,
        images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"],
        story: "This piece embodies the grandeur of Maharashtrian bridal tradition, where the Nath symbolizes married bliss and cultural pride.",
        authenticityStatus: "verified",
        authenticityScore: "99.80",
        dimensions: "3\" diameter (adjustable)",
        medium: "Sterling Silver, Kundan, Pearls",
        year: 2024,
        style: "Traditional Maharashtrian",
        verificationId: "ART-2024-SK05",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Contemporary Warli on Canvas",
        description: "Modern interpretation of Warli art on large canvas, depicting urban-rural harmony through traditional motifs and contemporary colors.",
        categoryId: paintingCat.id,
        price: "28999.00", // ₹28,999
        stock: 1,
        artistId: artist1Id,
        images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"],
        story: "This artwork bridges traditional Warli storytelling with contemporary urban experiences, showing how ancient wisdom adapts to modern life.",
        authenticityStatus: "verified",
        authenticityScore: "98.90",
        dimensions: "24\" × 36\"",
        medium: "Acrylic on Canvas",
        year: 2024,
        style: "Contemporary Warli",
        verificationId: "ART-2024-SJ06",
        createdAt: new Date(),
      },
    ];

    products.forEach(product => this.products.set(product.id, product));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "customer",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null
    };
    this.categories.set(id, category);
    return category;
  }

  // Product operations
  async getProducts(filters?: { categoryId?: string; artistId?: string; limit?: number; offset?: number }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    
    if (filters?.artistId) {
      products = products.filter(p => p.artistId === filters.artistId);
    }

    if (filters?.offset) {
      products = products.slice(filters.offset);
    }
    
    if (filters?.limit) {
      products = products.slice(0, filters.limit);
    }
    
    return products.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct,
      id,
      style: insertProduct.style || null,
      medium: insertProduct.medium || null, 
      dimensions: insertProduct.dimensions || null,
      year: insertProduct.year || null,
      authenticityScore: insertProduct.authenticityScore || null,
      createdAt: new Date(),
      verificationId: `ART-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.getProducts({ categoryId });
  }

  async getProductsByArtist(artistId: string): Promise<Product[]> {
    return this.getProducts({ artistId });
  }

  // Cart operations
  async getCart(userId: string): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = randomUUID();
    const cart: Cart = { 
      ...insertCart, 
      id,
      items: insertCart.items || []
    };
    this.carts.set(id, cart);
    return cart;
  }

  async updateCart(userId: string, updates: Partial<Cart>): Promise<Cart | undefined> {
    const cart = await this.getCart(userId);
    if (!cart) return undefined;
    
    const updatedCart = { ...cart, ...updates };
    this.carts.set(cart.id, updatedCart);
    return updatedCart;
  }

  // Order operations
  async getOrders(userId?: string): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    
    return orders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id,
      status: insertOrder.status || "pending",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Review operations
  async getReviews(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview, 
      id,
      media: insertReview.media || [],
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  // Admin operations
  async getUsers(role?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    return users;
  }

  async getPendingVerifications(): Promise<{ users: User[], products: Product[] }> {
    const pendingUsers = Array.from(this.users.values())
      .filter(user => user.role === 'artist' && !user.verifiedStatus);
    
    const pendingProducts = Array.from(this.products.values())
      .filter(product => product.authenticityStatus === 'pending');
    
    return { users: pendingUsers, products: pendingProducts };
  }
}

export const storage = new MemStorage();
