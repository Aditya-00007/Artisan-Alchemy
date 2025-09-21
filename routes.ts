import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateProductStory, verifyAuthenticity } from "./services/aiService";
import { emailService } from "./services/emailService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertReviewSchema } from "@shared/schema";

// Extend Express Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check user role
const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: Function) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        emailVerified: false,
        otp: otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

      // Send OTP email
      try {
        await emailService.sendOTPEmail(userData.email, otp);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        // Continue without email for development
      }

      res.status(201).json({
        userId: user.id,
        message: 'Registration successful. Please check your email for verification code.',
        requiresVerification: true
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: { ...user, password: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Email verification endpoints
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { userId, otp } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      if (new Date() > new Date(user.otpExpiry || '')) {
        return res.status(400).json({ message: 'Verification code has expired' });
      }

      // Mark user as verified
      const updatedUser = await storage.updateUser(userId, {
        emailVerified: true,
        otp: null,
        otpExpiry: null
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: { ...updatedUser, password: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: 'Verification failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/auth/resend-otp', async (req, res) => {
    try {
      const { userId } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await storage.updateUser(userId, {
        otp: otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

      // Send OTP email
      try {
        await emailService.sendOTPEmail(user.email, otp);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
      }

      res.json({ message: 'Verification code sent' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to resend code', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Google OAuth signup endpoint
  app.post('/api/auth/google-signup', async (req, res) => {
    try {
      const { email, name, googleId, photoURL, role = 'customer' } = req.body;
      
      if (!email || !name || !googleId) {
        return res.status(400).json({ message: 'Missing required Google OAuth data' });
      }
      
      // Check if user already exists
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user with Google OAuth data
        user = await storage.createUser({
          name,
          email,
          password: '', // No password for OAuth users
          role: role as 'customer' | 'artist',
          emailVerified: true, // Google emails are pre-verified
          googleId,
          photoURL: photoURL || null,
          otp: null,
          otpExpiry: null,
        });
      } else if (user.googleId !== googleId) {
        // Link Google account to existing user
        user = await storage.updateUser(user.id, {
          googleId,
          photoURL: photoURL || user.photoURL,
          emailVerified: true
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: { ...user, password: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: 'Google signup failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    res.json({ message: 'Logged out successfully' });
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { categoryId, artistId, limit, offset } = req.query;
      const products = await storage.getProducts({
        categoryId: categoryId as string,
        artistId: artistId as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      
      // Enrich products with artist info
      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          const artist = await storage.getUser(product.artistId);
          return {
            ...product,
            artist: artist ? { ...artist, password: undefined } : null
          };
        })
      );
      
      res.json(enrichedProducts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const artist = await storage.getUser(product.artistId);
      const reviews = await storage.getReviews(product.id);
      
      res.json({
        ...product,
        artist: artist ? { ...artist, password: undefined } : null,
        reviews
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/products/category/:categoryId', async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.categoryId);
      
      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          const artist = await storage.getUser(product.artistId);
          return {
            ...product,
            artist: artist ? { ...artist, password: undefined } : null
          };
        })
      );
      
      res.json(enrichedProducts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch products by category', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/products', authenticateToken, requireRole(['artist']), async (req: AuthenticatedRequest, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        artistId: req.user.id
      });

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Cart routes
  app.get('/api/cart', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      let cart = await storage.getCart(req.user.id);
      
      if (!cart) {
        cart = await storage.createCart({
          userId: req.user.id,
          items: []
        });
      }

      // Enrich cart items with product details
      const enrichedItems = await Promise.all(
        (cart.items || []).map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );

      res.json({
        ...cart,
        items: enrichedItems
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cart', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/cart/add', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      let cart = await storage.getCart(req.user.id);
      
      if (!cart) {
        cart = await storage.createCart({
          userId: req.user.id,
          items: []
        });
      }

      // Check if item already exists in cart
      const items = cart.items || [];
      const existingItemIndex = items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        items[existingItemIndex].quantity += quantity;
      } else {
        items.push({
          productId,
          quantity,
          price: parseFloat(product.price)
        });
      }

      const updatedCart = await storage.updateCart(req.user.id, { items });
      res.json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: 'Failed to add to cart', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.delete('/api/cart/remove/:productId', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const cart = await storage.getCart(req.user.id);
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const updatedItems = (cart.items || []).filter(item => item.productId !== req.params.productId);
      const updatedCart = await storage.updateCart(req.user.id, { items: updatedItems });
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove from cart', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/cart/checkout', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const cart = await storage.getCart(req.user.id);
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const { shippingAddress, paymentDetails } = req.body;

      // Calculate total amount
      const totalAmount = (cart.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Get product details for order
      const orderProducts = await Promise.all(
        (cart.items || []).map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            title: product?.title || 'Unknown Product'
          };
        })
      );

      // Create order
      const order = await storage.createOrder({
        userId: req.user.id,
        products: orderProducts,
        totalAmount: totalAmount.toString(),
        status: 'pending',
        paymentDetails,
        shippingAddress
      });

      // Clear cart
      await storage.updateCart(req.user.id, { items: [] });

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Checkout failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Order routes
  app.get('/api/orders', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/orders/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user owns this order (unless admin)
      if (req.user.role !== 'admin' && order.userId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Artist routes
  app.get('/api/artists/:id', async (req, res) => {
    try {
      const artist = await storage.getUser(req.params.id);
      
      if (!artist || artist.role !== 'artist') {
        return res.status(404).json({ message: 'Artist not found' });
      }

      const products = await storage.getProductsByArtist(artist.id);
      
      res.json({
        ...artist,
        password: undefined,
        products
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch artist', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/artists/products', authenticateToken, requireRole(['artist']), async (req: AuthenticatedRequest, res) => {
    try {
      const products = await storage.getProductsByArtist(req.user.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch artist products', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/artists/verify', authenticateToken, requireRole(['artist']), async (req, res) => {
    try {
      // In a real implementation, this would handle document uploads
      const { documents } = req.body;
      
      // Update user verification status to pending review
      await storage.updateUser(req.user.id, { verifiedStatus: false });
      
      res.json({ message: 'Verification documents submitted for review' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit verification', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Admin routes
  app.post('/api/admin/verifyArtist', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { artistId, approved } = req.body;
      
      const updatedUser = await storage.updateUser(artistId, { 
        verifiedStatus: approved 
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Artist not found' });
      }

      res.json({ message: `Artist ${approved ? 'approved' : 'rejected'}`, user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify artist', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/admin/verifyProduct', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { productId, approved } = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, { 
        authenticityStatus: approved ? 'verified' : 'rejected'
      });
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: `Product ${approved ? 'verified' : 'rejected'}`, product: updatedProduct });
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get('/api/admin/stats', authenticateToken, requireRole(['admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getUsers();
      const products = await storage.getProducts();
      const orders = await storage.getOrders();
      const pendingVerifications = await storage.getPendingVerifications();
      
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      
      res.json({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingArtistVerifications: pendingVerifications.users.length,
        pendingProductVerifications: pendingVerifications.products.length,
        pendingVerifications
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch admin stats', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // AI routes
  app.post('/api/ai/story', async (req, res) => {
    try {
      const { productId } = req.body;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const artist = await storage.getUser(product.artistId);
      
      const story = await generateProductStory({
        productTitle: product.title,
        productDescription: product.description,
        artistName: artist?.name || 'Unknown Artist',
        artistBio: artist?.artistPortfolio?.bio,
        medium: product.medium || 'Mixed Media',
        style: product.style,
        location: artist?.artistPortfolio?.location || undefined
      });

      // Update product with generated story
      await storage.updateProduct(productId, { story: story.aiStory });

      res.json(story);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate story', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Enhanced AI verification with artist undertaking
  app.post('/api/artist/verify-product', async (req: AuthenticatedRequest, res) => {
    try {
      const { 
        productId, 
        experienceYears, 
        specialization, 
        toolsUsed, 
        creationTime, 
        undertakingAccepted 
      } = req.body;

      if (!undertakingAccepted) {
        return res.status(400).json({ message: 'Artist undertaking must be accepted' });
      }
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const artist = await storage.getUser(product.artistId);
      
      // Perform AI authenticity verification
      const verification = await verifyAuthenticity({
        imageUrls: product.images,
        productTitle: product.title,
        medium: product.medium || 'Mixed Media',
        artistName: artist?.name || 'Unknown Artist'
      });

      // Calculate enhanced authenticity score based on:
      // 1. AI image analysis (70%)
      // 2. Artist experience and details (30%)
      const experienceScore = experienceYears === '10+' ? 100 : 
                            experienceYears === '6-10' ? 85 :
                            experienceYears === '3-5' ? 70 : 50;
      
      const detailsScore = (toolsUsed && specialization && creationTime) ? 90 : 60;
      
      const finalScore = Math.round(
        (verification.authenticityScore * 0.7) + 
        (experienceScore * 0.15) + 
        (detailsScore * 0.15)
      );

      // Update product with comprehensive verification
      const updatedProduct = await storage.updateProduct(productId, {
        authenticityStatus: finalScore > 85 ? 'verified' : finalScore > 65 ? 'pending' : 'rejected',
        authenticityScore: finalScore.toString(),
        verificationId: verification.verificationId,
        artistUndertaking: {
          signed: true,
          timestamp: new Date().toISOString(),
          experienceYears,
          specialization,
          toolsUsed,
          creationTime,
          ipAddress: req.ip || 'unknown'
        }
      });

      res.json({
        ...verification,
        finalScore,
        status: finalScore > 85 ? 'verified' : finalScore > 65 ? 'pending' : 'rejected',
        message: finalScore > 85 ? 'Product verified as authentic handmade artwork' :
                finalScore > 65 ? 'Product under review - additional verification may be required' :
                'Product needs improvement - please ensure all details are accurate'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/ai/verify', authenticateToken, requireRole(['artist', 'admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { productId, imageUrls } = req.body;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const artist = await storage.getUser(product.artistId);
      
      const verification = await verifyAuthenticity({
        imageUrls: imageUrls || product.images,
        productTitle: product.title,
        medium: product.medium || 'Mixed Media',
        artistName: artist?.name || 'Unknown Artist'
      });

      // Update product with verification results
      await storage.updateProduct(productId, {
        authenticityStatus: verification.authenticityScore > 90 ? 'verified' : 'pending',
        authenticityScore: verification.authenticityScore.toString(),
        verificationId: verification.verificationId
      });

      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify authenticity', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Review routes
  app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create review', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
