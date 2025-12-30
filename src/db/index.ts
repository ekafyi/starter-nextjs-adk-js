import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

dotenv.config();

const client = createClient({
	url: process.env.DB_FILE_NAME || "file:local.db",
});

export const db = drizzle(client, { schema });
