import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  real,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import "dotenv/config";

// User model
export type UserDetails = {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  isVerified: boolean;
  isEmailVerified: boolean;
  isAdmin?: boolean; // Added isAdmin as an optional property
  verificationToken: string | null;
  verificationTokenExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // Use serial for auto-incrementing primary keys
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// The insertUserSchema excludes fields like isVerified, isEmailVerified, etc.,
// because these fields are either auto-generated or managed internally by the system.
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
}).extend({
  verificationToken: z.string().optional(),
});

// KYC model
export const kyc = pgTable("kyc", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  documentType: text("document_type").notNull(),
  documentId: text("document_id").notNull(),
  documentPath: text("document_path"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}); // Added missing closing brace for the kyc table definition

// The `insertKycSchema` excludes fields like `status` and `rejectionReason`
// because these fields are managed internally by the system and should not
// be provided by the user during insertion.
export const insertKycSchema = createInsertSchema(kyc).pick({
  userId: true,
  documentType: true,
  documentId: true,
});

// Wallet model
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  currency: true,
});

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, buy, sell
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending, completed, rejected
  assetSymbol: text("asset_symbol"),
  assetType: text("asset_type"), // stock, crypto, etc.
  // The duration of the transaction in days, defaulting to 1 if not specified
  duration: integer("duration").notNull().default(1),
  takeProfit: real("take_profit"),
  stopLoss: real("stop_loss"),
  margin: real("margin"),
  orderType: text("order_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  currency: true,
  assetSymbol: true,
  assetType: true,
  duration: true,
  takeProfit: true,
  stopLoss: true,
  margin: true,
  orderType: true,
});

// Portfolio model
export const portfolio = pgTable("portfolio", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  assetSymbol: text("asset_symbol").notNull(),
  assetType: text("asset_type").notNull(), // stock, crypto, etc.
  quantity: real("quantity").notNull(),
  averagePrice: real("average_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPortfolioSchema = createInsertSchema(portfolio).pick({
  userId: true,
  assetSymbol: true,
  assetType: true,
  quantity: true,
  averagePrice: true,
});

// Watchlist model
export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  assetSymbol: text("asset_symbol").notNull(),
  assetName: text("asset_name").notNull(),
  assetType: text("asset_type").notNull(), // stock, crypto, etc.
  // The exchange where the asset is listed; can be null if not applicable
  exchange: text("exchange"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWatchlistSchema = createInsertSchema(watchlist).pick({
  userId: true,
  assetSymbol: true,
  assetName: true,
  assetType: true,
  exchange: true,
});

// Content management model
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  isPublished: boolean("is_published").default(false).notNull(), // Default is false and cannot be null
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  slug: true,
  content: true,
  isPublished: true,
});

// Settings model
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull(), // system, user, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
  type: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  verificationToken?: string;
  isAdmin?: boolean; // Added isAdmin property
};

export type KYC = {
  id: number;
  userId: number;
  documentType: string;
  documentId: string;
  documentPath: string | null;
  status: string;
  rejectionReason: string | null;
  adminNotes: string | null; // Added adminNotes property
  createdAt: Date;
  updatedAt: Date;
  
};

export type InsertKYC = {
  userId: number;
  documentType: string;
  documentId: string;
  documentPath?: string | null; // Added optional documentPath property
};

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Portfolio = typeof portfolio.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Setting = typeof settings.$inferSelect;