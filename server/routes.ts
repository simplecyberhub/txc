import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import {
  insertUserSchema,
  insertKycSchema,
  insertTransactionSchema,
  insertWatchlistSchema,
  insertPortfolioSchema,
  insertContentSchema,
  insertSettingSchema,
} from "@shared/schema";

// Extend express-session types to include 'user'
declare module "express-session" {
  interface SessionData {
    user?: any;
  }
}
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import fs from "fs";
import crypto from "crypto";
import { sendVerificationEmail } from "./services/email";
import { generateToken, generateExpiry, isExpired } from "./services/tokens";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + crypto.randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG and PDF files are allowed.",
        ),
      );
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Error handling middleware
  const handleZodErrors = (err: any, req: Request, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({
        success: false,
        message: validationError.message,
        errors: err.errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  };

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({
      success: false,
      message: "Unauthorized - Please login to access this resource",
    });
  };

  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any)?.isAdmin) {
      return next();
    }
    res.status(403).json({
      success: false,
      message: "Forbidden - Admin access required",
    });
  };

  // API Routes

  // Authentication routes
 app.post("/api/auth/register", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);

    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const verificationToken = generateToken();
    const user = await storage.createUser({
      ...userData,
      verificationToken
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ success: true, message: "Registration successful. Please verify your email." });
  } catch (error) {
    console.error('Registration error:', error); // <-- KEY LINE
    res.status(400).json({ 
      success: false, 
      message: error?.message || "Registration failed.",
      // error, // Optionally: include error object for debugging
    });
  }
});

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Incorrect username or password",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect username or password",
        });
      }

      if (!user.isEmailVerified) {
        return res.status(401).json({
          success: false,
          message: "Please verify your email before logging in",
        });
      }

      const userResponse = { ...user } as any;
      delete userResponse.password;
      delete userResponse.verificationToken;

      req.session.user = userResponse;

      return res.json({
        success: true,
        message: "Login successful",
        user: userResponse,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to login",
      });
    }
  });

  app.get("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Logout failed",
        });
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const userResponse = { ...(req.user as any) };
    delete userResponse.password;
    delete userResponse.verificationToken;

    res.json({
      success: true,
      user: userResponse,
    });
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      const user = await storage.verifyUserEmail(token);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      // Set both flags
      await storage.updateUser(user.id, { isEmailVerified: true, isVerified: true, verificationToken: null });

      res.json({
        success: true,
        message: "Email verified successfully. You can now login.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to verify email",
      });
    }
  });

  // KYC routes
  app.post(
    "/api/kyc",
    isAuthenticated,
    upload.single("document"),
    async (req, res) => {
      try {
        const userId = (req.user as any).id;

        // Check if user already submitted KYC
        const existingKYC = await storage.getKYCByUserId(userId);
        if (existingKYC) {
          return res.status(400).json({
            success: false,
            message: "KYC already submitted",
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Document file is required",
          });
        }

        const kycData = {
          userId,
          documentType: req.body.documentType,
          documentId: req.body.documentId,
          documentPath: req.file.path,
        };

        const kyc = await storage.createKYC(kycData);

        res.status(201).json({
          success: true,
          message: "KYC submitted successfully",
          kyc,
        });
      } catch (error) {
        handleZodErrors(error, req, res);
      }
    },
  );

  app.get("/api/kyc/status", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const kyc = await storage.getKYCByUserId(userId);

      if (!kyc) {
        return res.status(404).json({
          success: false,
          message: "KYC not found",
        });
      }

      res.json({
        success: true,
        kyc,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get KYC status",
      });
    }
  });

  // Admin KYC routes
  app.get("/api/admin/kyc/pending", isAdmin, async (req, res) => {
    try {
      const pendingKYCs = await storage.getAllPendingKYCs();

      res.json({
        success: true,
        kycs: pendingKYCs,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get pending KYCs",
      });
    }
  });

  app.put("/api/admin/kyc/:id", isAdmin, async (req, res) => {
    try {
      const kycId = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;

      const kyc = await storage.getKYC(kycId);

      if (!kyc) {
        return res.status(404).json({
          success: false,
          message: "KYC not found",
        });
      }

      const updatedKYC = await storage.updateKYC(kycId, {
        status,
        rejectionReason,
      });

      res.json({
        success: true,
        message: `KYC ${status === "approved" ? "approved" : "rejected"} successfully`,
        kyc: updatedKYC,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update KYC status",
      });
    }
  });

  // Wallet routes
  app.get("/api/wallet", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const wallet = await storage.getWalletByUserId(userId);

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
      }

      res.json({
        success: true,
        wallet,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get wallet",
      });
    }
  });

  // Transaction routes
  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });

      // Check if user is verified for withdrawals
      if (transactionData.type === "withdrawal") {
        const user = await storage.getUser(userId);
        if (!user?.isVerified) {
          return res.status(403).json({
            success: false,
            message: "KYC verification required for withdrawals",
          });
        }

        // Check if user has enough balance
        const wallet = await storage.getWalletByUserId(userId);
        if (!wallet || wallet.balance < transactionData.amount) {
          return res.status(400).json({
            success: false,
            message: "Insufficient balance",
          });
        }
      }

      const transaction = await storage.createTransaction(transactionData);

      // Auto-approve deposits for demo purposes
      if (transactionData.type === "deposit") {
        await storage.updateTransaction(transaction.id, {
          status: "completed",
        });

        // Update wallet balance
        const wallet = await storage.getWalletByUserId(userId);
        if (wallet) {
          await storage.updateWallet(wallet.id, {
            balance: wallet.balance + transactionData.amount,
          });
        }
      }

      res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        transaction,
      });
    } catch (error) {
      handleZodErrors(error, req, res);
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const transactions = await storage.getTransactionsByUserId(userId);

      res.json({
        success: true,
        transactions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get transactions",
      });
    }
  });

  // Admin transaction routes
  app.get("/api/admin/transactions/pending", isAdmin, async (req, res) => {
    try {
      const pendingTransactions = await storage.getAllPendingTransactions();

      res.json({
        success: true,
        transactions: pendingTransactions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get pending transactions",
      });
    }
  });

  app.put("/api/admin/transactions/:id", isAdmin, async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const { status } = req.body;

      const transaction = await storage.getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      const updatedTransaction = await storage.updateTransaction(
        transactionId,
        { status },
      );

      res.json({
        success: true,
        message: `Transaction ${status === "completed" ? "approved" : "rejected"} successfully`,
        transaction: updatedTransaction,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update transaction status",
      });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const portfolioItems = await storage.getPortfolioByUserId(userId);

      res.json({
        success: true,
        portfolio: portfolioItems,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get portfolio",
      });
    }
  });

  app.post("/api/portfolio", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const portfolioData = insertPortfolioSchema.parse({
        ...req.body,
        userId,
      });

      // Check if user is verified
      const user = await storage.getUser(userId);
      if (!user?.isVerified) {
        return res.status(403).json({
          success: false,
          message: "KYC verification required for trading",
        });
      }

      // Check if user has enough balance
      const wallet = await storage.getWalletByUserId(userId);
      const totalCost = portfolioData.quantity * portfolioData.averagePrice;

      if (!wallet || wallet.balance < totalCost) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance",
        });
      }

      // Create portfolio entry
      const portfolioItem = await storage.createPortfolio(portfolioData);

      // Create a buy transaction
      await storage.createTransaction({
        userId,
        type: "buy",
        amount: totalCost,
        currency: "USD",
        assetSymbol: portfolioData.assetSymbol,
        assetType: portfolioData.assetType,
      });

      // Update wallet balance
      await storage.updateWallet(wallet.id, {
        balance: wallet.balance - totalCost,
      });

      res.status(201).json({
        success: true,
        message: "Asset purchased successfully",
        portfolio: portfolioItem,
      });
    } catch (error) {
      handleZodErrors(error, req, res);
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const watchlistItems = await storage.getWatchlistByUserId(userId);

      res.json({
        success: true,
        watchlist: watchlistItems,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get watchlist",
      });
    }
  });

  app.post("/api/watchlist", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;

      const watchlistData = insertWatchlistSchema.parse({
        ...req.body,
        userId,
      });

      const watchlistItem = await storage.createWatchlist(watchlistData);

      res.status(201).json({
        success: true,
        message: "Asset added to watchlist",
        watchlist: watchlistItem,
      });
    } catch (error) {
      handleZodErrors(error, req, res);
    }
  });

  app.delete("/api/watchlist/:id", isAuthenticated, async (req, res) => {
    try {
      const watchlistId = parseInt(req.params.id);

      await storage.deleteWatchlist(watchlistId);

      res.json({
        success: true,
        message: "Asset removed from watchlist",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to remove asset from watchlist",
      });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();

      // Remove sensitive fields
      const safeUsers = users.map((user) => {
        const safeUser = { ...user } as any;
        delete safeUser.password;
        delete safeUser.verificationToken;
        return safeUser;
      });

      res.json({
        success: true,
        users: safeUsers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get users",
      });
    }
  });

  // Content management routes
  app.post("/api/admin/content", isAdmin, async (req, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);

      // Check if slug already exists
      const existingContent = await storage.getContentBySlug(contentData.slug);
      if (existingContent) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists",
        });
      }

      const content = await storage.createContent(contentData);

      res.status(201).json({
        success: true,
        message: "Content created successfully",
        content,
      });
    } catch (error) {
      handleZodErrors(error, req, res);
    }
  });

  app.put("/api/admin/content/:id", isAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);

      const content = await storage.getContent(contentId);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      const updatedContent = await storage.updateContent(contentId, req.body);

      res.json({
        success: true,
        message: "Content updated successfully",
        content: updatedContent,
      });
    } catch (error) {
      handleZodErrors(error, req, res);
    }
  });

  app.get("/api/admin/content", isAdmin, async (req, res) => {
    try {
      const contents = await storage.getAllContents();

      res.json({
        success: true,
        contents,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get contents",
      });
    }
  });

  app.get("/api/content/:slug", async (req, res) => {
    try {
      const { slug } = req.params;

      const content = await storage.getContentBySlug(slug);
      if (!content || !content.isPublished) {
        return res.status(404).json({
          success: false,
          message: "Content not found",
        });
      }

      res.json({
        success: true,
        content,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get content",
      });
    }
  });

  // Settings routes
  app.post("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settingData = insertSettingSchema.parse(req.body);

      const setting = await storage.createOrUpdateSetting(settingData);

      res.status(201).json({
        success: true,
        message: "Setting created/updated successfully",
        setting,
      });
    } catch (error) {
      handleZodErrors(error, req, res);
    }
  });

  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();

      res.json({
        success: true,
        settings,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get settings",
      });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;

      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({
          success: false,
          message: "Setting not found",
        });
      }

      res.json({
        success: true,
        setting,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get setting",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
