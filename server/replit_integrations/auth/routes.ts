import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./localAuth";
import { sendMagicLinkEmail, sendWelcomeEmail } from "../../email";
import { getAppUrl } from "../../app-url";

export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/magic-link/check", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      const existingUser = await authStorage.getUserByEmail(email);
      res.json({ exists: !!existingUser });
    } catch (error) {
      console.error("Email check error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.post("/api/auth/magic-link", async (req, res) => {
    try {
      const { email, firstName } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      let existingUser = await authStorage.getUserByEmail(email);
      const isNewUser = !existingUser;

      if (isNewUser) {
        if (!firstName || firstName.trim().length < 1) {
          return res.status(400).json({ message: "First name is required for new accounts" });
        }
        existingUser = await authStorage.createUserWithMagicLink(email, firstName.trim());
      }

      const token = await authStorage.createMagicLinkToken(email);
      const appUrl = getAppUrl();
      const magicLinkUrl = `${appUrl}/auth/verify?token=${token}`;

      const sent = await sendMagicLinkEmail({
        to: email,
        magicLinkUrl,
        isNewUser,
        firstName: existingUser!.firstName || firstName,
      });

      if (!sent) {
        return res.status(500).json({ message: "Failed to send magic link email. Please try again." });
      }

      if (isNewUser) {
        await sendWelcomeEmail({
          to: email,
          username: existingUser!.firstName || email,
          appUrl,
        });
      }

      res.json({ message: "Magic link sent! Check your email." });
    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.get("/api/auth/magic-link/verify", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid or missing token" });
      }

      const tokenRecord = await authStorage.verifyMagicLinkToken(token);
      if (!tokenRecord) {
        return res.status(400).json({ message: "This link has expired or has already been used. Please request a new one." });
      }

      const user = await authStorage.getUserByEmail(tokenRecord.email);
      if (!user) {
        return res.status(400).json({ message: "No account found for this email" });
      }

      req.login({ id: user.id, email: user.email! }, async (err) => {
        if (err) {
          console.error("Login error after magic link verification:", err);
          return res.status(500).json({ message: "Verification succeeded but login failed. Please try the link again." });
        }

        await authStorage.markTokenUsed(tokenRecord.id);

        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          reminderEnabled: user.reminderEnabled,
        });
      });
    } catch (error) {
      console.error("Magic link verify error:", error);
      res.status(500).json({ message: "Verification failed. Please try again." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Session destroy error:", sessionErr);
      }
      res.clearCookie("connect.sid", { path: "/" });
      (req as any).user = null;
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        reminderEnabled: user.reminderEnabled,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
