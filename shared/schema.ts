import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  totalVisits: integer("total_visits").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  todayVisits: integer("today_visits").notNull().default(0),
  lastReset: timestamp("last_reset").notNull().defaultNow(),
});

export const visitLogs = pgTable("visit_logs", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  page: text("page").notNull().default("/"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVisitLogSchema = createInsertSchema(visitLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVisitLog = z.infer<typeof insertVisitLogSchema>;
export type VisitLog = typeof visitLogs.$inferSelect;
export type Visitor = typeof visitors.$inferSelect;

export interface ApiEndpoint {
  name: string;
  desc: string;
  method: string;
  path: string;
  example?: string;
  status: "active" | "inactive" | "maintenance";
}

export interface ApiCategory {
  name: string;
  icon: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export interface EndpointStatus {
  path: string;
  isOnline: boolean;
  responseTime: number | null;
  lastChecked: string;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
}
