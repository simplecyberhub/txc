import { db } from "./db"; // adjust this import to your actual db instance
import { eq } from "drizzle-orm";
import { 
  users, type User, type InsertUser,
  kyc, type KYC, type InsertKYC,
  wallets, type Wallet, type InsertWallet,
  transactions, type Transaction, type InsertTransaction,
  portfolio, type Portfolio, type InsertPortfolio,
  watchlist, type Watchlist, type InsertWatchlist,
  contents, type Content, type InsertContent,
  settings, type Setting
} from "@shared/schema";
import { generateToken } from "./services/tokens";
import bcrypt from "bcryptjs";

import "dotenv/config";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  verifyUserEmail(token: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // KYC operations
  getKYC(id: number): Promise<KYC | undefined>;
  getKYCByUserId(userId: number): Promise<KYC | undefined>;
  createKYC(kyc: InsertKYC): Promise<KYC>;
  updateKYC(id: number, kyc: Partial<KYC>): Promise<KYC | undefined>;
  getAllPendingKYCs(): Promise<KYC[]>;
  
  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, wallet: Partial<Wallet>): Promise<Wallet | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  getAllPendingTransactions(): Promise<Transaction[]>;
  
  // Portfolio operations
  getPortfolioByUserId(userId: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<Portfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: number): Promise<boolean>;
  
  // Watchlist operations
  getWatchlistByUserId(userId: number): Promise<Watchlist[]>;
  createWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  deleteWatchlist(id: number): Promise<boolean>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  getContentBySlug(slug: string): Promise<Content | undefined>;
  getAllContents(): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<Content>): Promise<Content | undefined>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  createOrUpdateSetting(setting: Partial<Setting>): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const verificationToken = userData.verificationToken || generateToken();
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry: null,
        isVerified: false,
        isEmailVerified: false,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    // Create wallet for new user
    await db.insert(wallets).values({
      userId: user.id,
      balance: 0,
      currency: "USD",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return user;
  }
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  async verifyUserEmail(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    if (!user) return undefined;
    const [updatedUser] = await db
      .update(users)
      .set({
        isEmailVerified: true,
        isVerified: true,
        verificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    return updatedUser;
  }
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }
  // KYC methods
  async getKYC(id: number): Promise<KYC | undefined> {
    const [row] = await db.select().from(kyc).where(eq(kyc.id, id));
    return row;
  }
  async getKYCByUserId(userId: number): Promise<KYC | undefined> {
    const [row] = await db.select().from(kyc).where(eq(kyc.userId, userId));
    return row;
  }
  async createKYC(kycData: InsertKYC): Promise<KYC> {
    const [row] = await db
      .insert(kyc)
      .values({
        ...kycData,
        status: "pending",
        rejectionReason: null,
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return row;
  }
  async updateKYC(id: number, kycData: Partial<KYC>): Promise<KYC | undefined> {
    const [row] = await db
      .update(kyc)
      .set({ ...kycData, updatedAt: new Date() })
      .where(eq(kyc.id, id))
      .returning();
    if (kycData.status === "approved" && row) {
      await db.update(users).set({ isVerified: true }).where(eq(users.id, row.userId));
    }
    return row;
  }
  async getAllPendingKYCs(): Promise<KYC[]> {
    return db.select().from(kyc).where(eq(kyc.status, "pending"));
  }
  // Wallet methods
  async getWallet(id: number): Promise<Wallet | undefined> {
    const [row] = await db.select().from(wallets).where(eq(wallets.id, id));
    return row;
  }
  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    const [row] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return row;
  }
  async createWallet(walletData: InsertWallet): Promise<Wallet> {
    const [row] = await db
      .insert(wallets)
      .values({
        ...walletData,
        balance: 0,
        currency: walletData.currency || "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return row;
  }
  async updateWallet(id: number, walletData: Partial<Wallet>): Promise<Wallet | undefined> {
    const [row] = await db
      .update(wallets)
      .set({ ...walletData, updatedAt: new Date() })
      .where(eq(wallets.id, id))
      .returning();
    return row;
  }
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [row] = await db.select().from(transactions).where(eq(transactions.id, id));
    return row;
  }
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    // Drizzle ORM: use .orderBy(desc(transactions.createdAt))
    // Import desc from drizzle-orm if not already
    // import { desc } from "drizzle-orm";
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt);
  }
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [row] = await db
      .insert(transactions)
      .values({
        ...transactionData,
        status: "pending",
        createdAt: new Date(),
      })
      .returning();
    return row;
  }
  async updateTransaction(id: number, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const [row] = await db
      .update(transactions)
      .set({ ...transactionData })
      .where(eq(transactions.id, id))
      .returning();
    return row;
  }
  async getAllPendingTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.status, "pending"));
  }
  // Portfolio methods
  async getPortfolioByUserId(userId: number): Promise<Portfolio[]> {
    return db.select().from(portfolio).where(eq(portfolio.userId, userId));
  }
  async createPortfolio(portfolioData: InsertPortfolio): Promise<Portfolio> {
    const [row] = await db
      .insert(portfolio)
      .values({
        ...portfolioData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return row;
  }
  async updatePortfolio(id: number, portfolioData: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const [row] = await db
      .update(portfolio)
      .set({ ...portfolioData, updatedAt: new Date() })
      .where(eq(portfolio.id, id))
      .returning();
    return row;
  }
  async deletePortfolio(id: number): Promise<boolean> {
    await db.delete(portfolio).where(eq(portfolio.id, id));
    return true;
  }
  // Watchlist methods
  async getWatchlistByUserId(userId: number): Promise<Watchlist[]> {
    return db.select().from(watchlist).where(eq(watchlist.userId, userId));
  }
  async createWatchlist(watchlistData: InsertWatchlist): Promise<Watchlist> {
    const [row] = await db
      .insert(watchlist)
      .values({
        ...watchlistData,
        createdAt: new Date(),
      })
      .returning();
    return row;
  }
  async deleteWatchlist(id: number): Promise<boolean> {
    await db.delete(watchlist).where(eq(watchlist.id, id));
    return true;
  }
  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    const [row] = await db.select().from(contents).where(eq(contents.id, id));
    return row;
  }
  async getContentBySlug(slug: string): Promise<Content | undefined> {
    const [row] = await db.select().from(contents).where(eq(contents.slug, slug));
    return row;
  }
  async getAllContents(): Promise<Content[]> {
    return db.select().from(contents);
  }
  async createContent(contentData: InsertContent): Promise<Content> {
    const [row] = await db
      .insert(contents)
      .values({
        ...contentData,
        isPublished: contentData.isPublished || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return row;
  }
  async updateContent(id: number, contentData: Partial<Content>): Promise<Content | undefined> {
    const [row] = await db
      .update(contents)
      .set({ ...contentData, updatedAt: new Date() })
      .where(eq(contents.id, id))
      .returning();
    return row;
  }
  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const [row] = await db.select().from(settings).where(eq(settings.key, key));
    return row;
  }
  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }
  async createOrUpdateSetting(settingData: Partial<Setting>): Promise<Setting> {
    const existing = await this.getSetting(settingData.key!);
    if (existing) {
      const updatedArr = await db
        .update(settings)
        .set({
          ...existing,
          value: settingData.value ?? existing.value,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existing.id))
        .returning();
      return updatedArr[0];
    }
    const createdArr = await db
      .insert(settings)
      .values({
        type: settingData.type || "default",
        key: settingData.key!,
        value: settingData.value!,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return createdArr[0];
  }
}

export const storage = new DatabaseStorage();
