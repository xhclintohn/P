import { type User, type InsertUser, type InsertVisitLog, type VisitorStats, visitors, visitLogs } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  trackVisit(visitorId: string, page: string): Promise<void>;
  getVisitorStats(): Promise<VisitorStats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    return { ...insertUser, id };
  }

  async trackVisit(visitorId: string, page: string): Promise<void> {
    await db.insert(visitLogs).values({ visitorId, page });

    const existing = await db.select().from(visitors).limit(1);
    if (existing.length === 0) {
      await db.insert(visitors).values({
        totalVisits: 1,
        uniqueVisitors: 1,
        todayVisits: 1,
      });
    } else {
      const record = existing[0];
      const now = new Date();
      const lastReset = new Date(record.lastReset);
      const isNewDay =
        now.toDateString() !== lastReset.toDateString();

      const isNewVisitor = await db
        .select()
        .from(visitLogs)
        .where(eq(visitLogs.visitorId, visitorId))
        .limit(2);

      const uniqueIncrement = isNewVisitor.length <= 1 ? 1 : 0;

      if (isNewDay) {
        await db
          .update(visitors)
          .set({
            totalVisits: sql`${visitors.totalVisits} + 1`,
            uniqueVisitors: sql`${visitors.uniqueVisitors} + ${uniqueIncrement}`,
            todayVisits: 1,
            lastReset: now,
          })
          .where(eq(visitors.id, record.id));
      } else {
        await db
          .update(visitors)
          .set({
            totalVisits: sql`${visitors.totalVisits} + 1`,
            uniqueVisitors: sql`${visitors.uniqueVisitors} + ${uniqueIncrement}`,
            todayVisits: sql`${visitors.todayVisits} + 1`,
          })
          .where(eq(visitors.id, record.id));
      }
    }
  }

  async getVisitorStats(): Promise<VisitorStats> {
    const records = await db.select().from(visitors).limit(1);
    if (records.length === 0) {
      return { totalVisits: 0, uniqueVisitors: 0, todayVisits: 0 };
    }

    const record = records[0];
    const now = new Date();
    const lastReset = new Date(record.lastReset);
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    return {
      totalVisits: record.totalVisits,
      uniqueVisitors: record.uniqueVisitors,
      todayVisits: isNewDay ? 0 : record.todayVisits,
    };
  }
}

export const storage = new DatabaseStorage();
