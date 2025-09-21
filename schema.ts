import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // customer, artist, admin
  verifiedStatus: boolean("verified_status").default(false),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationOTP: text("email_verification_otp"),
  emailOTPExpiry: timestamp("email_otp_expiry"),
  artistPortfolio: json("artist_portfolio").$type<{
    bio?: string;
    specialty?: string;
    location?: string;
    avatar?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(1),
  artistId: varchar("artist_id").notNull(),
  images: json("images").$type<string[]>().default([]),
  story: text("story"),
  authenticityStatus: text("authenticity_status").default("pending"), // pending, verified, rejected
  authenticityScore: decimal("authenticity_score", { precision: 5, scale: 2 }),
  dimensions: text("dimensions"),
  medium: text("medium"),
  year: integer("year"),
  style: text("style"),
  verificationId: text("verification_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cart = pgTable("cart", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  items: json("items").$type<{
    productId: string;
    quantity: number;
    price: number;
  }[]>().default([]),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  products: json("products").$type<{
    productId: string;
    quantity: number;
    price: number;
    title: string;
  }[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  paymentDetails: json("payment_details").$type<{
    method: string;
    transactionId?: string;
  }>(),
  shippingAddress: json("shipping_address").$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  media: json("media").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCartSchema = createInsertSchema(cart).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Cart = typeof cart.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
