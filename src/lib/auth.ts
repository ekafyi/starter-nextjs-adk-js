import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";

export const COOKIE_NAME = "username";
export const COOKIE_MAX_AGE = 60 * 60; // 1 hour in seconds

export const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	maxAge: COOKIE_MAX_AGE,
	path: "/",
} as const;

/**
 * Sets the username cookie with secure options
 */
export async function setUsernameCookie(username: string) {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, username, COOKIE_OPTIONS);
}

/**
 * Gets the username from the cookie, returns null if not found or expired
 */
export async function getUsernameFromCookie(): Promise<string | null> {
	const cookieStore = await cookies();
	const cookie = cookieStore.get(COOKIE_NAME);
	const username = cookie?.value;

	if (!username) return null;

	try {
		const user = await db.query.users.findFirst({
			where: eq(users.id, username),
		});

		return user ? user.id : null;
	} catch (error) {
		console.error("Error verifying user:", error);
		return null;
	}
}

/**
 * Deletes the username cookie
 */
export async function deleteUsernameCookie() {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_NAME);
}

/**
 * Gets a user from the database by username
 */
export async function getUser(username: string) {
	try {
		return await db.query.users.findFirst({
			where: eq(users.id, username),
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		return null;
	}
}

/**
 * Validates and sanitizes username input
 */
export function validateUsername(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) {
		throw new Error("Username is required");
	}
	return trimmed;
}
