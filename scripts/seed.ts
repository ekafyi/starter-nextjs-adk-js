import { db } from "../src/db";
import { users } from "../src/db/schema";

async function main() {
	try {
		console.log("Seeding database...");
		await db.insert(users).values({ id: "user1" }).onConflictDoNothing();
		console.log("Seed complete");
	} catch (error) {
		console.error("Seed failed:", error);
		process.exit(1);
	}
}

main();
