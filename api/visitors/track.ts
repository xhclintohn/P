import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  totalVisits: integer("total_visits").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  todayVisits: integer("today_visits").notNull().default(0),
  lastReset: timestamp("last_reset").notNull().defaultNow(),
});

const visitLogs = pgTable("visit_logs", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  page: text("page").notNull().default("/"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

let pool: pg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    });
  }
  return pool;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { visitorId, page } = req.body;
    if (!visitorId) {
      return res.status(400).json({ error: "visitorId is required" });
    }

    const db = drizzle(getPool());

    await db.insert(visitLogs).values({ visitorId, page: page || "/" });

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
      const isNewDay = now.toDateString() !== lastReset.toDateString();

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

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
