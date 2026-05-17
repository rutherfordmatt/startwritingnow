import { users, magicLinkTokens, type User, type InsertUser, type MagicLinkToken } from "@shared/models/auth";
import { db } from "../db";
import { eq, sql, and, isNull, gt } from "drizzle-orm";
import crypto from "crypto";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithMagicLink(email: string, firstName: string): Promise<User>;
  createMagicLinkToken(email: string): Promise<string>;
  verifyMagicLinkToken(token: string): Promise<MagicLinkToken | undefined>;
  markTokenUsed(tokenId: string): Promise<void>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${email})`);
    return user;
  }

  async createUserWithMagicLink(email: string, firstName: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: email,
        email,
        firstName,
        isEmailVerified: true,
      })
      .returning();
    return user;
  }

  async createMagicLinkToken(email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(magicLinkTokens).values({
      email,
      token,
      expiresAt,
    });

    return token;
  }

  async verifyMagicLinkToken(token: string): Promise<MagicLinkToken | undefined> {
    const [record] = await db
      .select()
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.token, token),
          isNull(magicLinkTokens.usedAt),
          gt(magicLinkTokens.expiresAt, new Date())
        )
      );
    return record;
  }

  async markTokenUsed(tokenId: string): Promise<void> {
    await db
      .update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.id, tokenId));
  }
}

export const authStorage = new AuthStorage();
