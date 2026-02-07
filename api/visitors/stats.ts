import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, integer, timestamp, serial } from "drizzle-orm/pg-core";

const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  totalVisits: integer("total_visits").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  todayVisits: integer("today_visits").notNull().default(0),
  lastReset: timestamp("last_reset").notNull().defaultNow(),
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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = drizzle(getPool());
    const records = await db.select().from(visitors).limit(1);

    if (records.length === 0) {
      return res.status(200).json({ totalVisits: 0, uniqueVisitors: 0, todayVisits: 0 });
    }

    const record = records[0];
    const now = new Date();
    const lastReset = new Date(record.lastReset);
    const isNewDay = now.toDateString() !== lastReset.toDateString();

    return res.status(200).json({
      totalVisits: record.totalVisits,
      uniqueVisitors: record.uniqueVisitors,
      todayVisits: isNewDay ? 0 : record.todayVisits,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
