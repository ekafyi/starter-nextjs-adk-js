import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE_PATH = "src/lib/data"

/**
 * Retrieves the capital city for a given country from mock data.
 * @param country The name of the country.
 * @returns The capital city or null if not found.
 */
export async function getMockCapital(country: string): Promise<string | null> {
	const normalizedCountry = country.toLowerCase();
	const dataPath = join(process.cwd(), BASE_PATH, "countries.json");
	console.log(`[Lib] Reading capital data from: ${dataPath}`);

	if (!existsSync(dataPath)) {
		console.error(`[Lib] Database file not found: ${dataPath}`);
		return null;
	}

	try {
		await new Promise((resolve) => setTimeout(resolve, 100)); // Fake API delay
		const rawData = readFileSync(dataPath, "utf-8");
		const countries = JSON.parse(rawData);
		return countries[normalizedCountry] || null;
	} catch (error) {
		console.error(
			`[Lib] Failed to retrieve capital data: ${(error as Error).message}`,
		);
		return null;
	}
}

/**
 * Retrieves the flag emoji for a given country from mock data.
 * @param country The name of the country.
 * @returns The flag emoji or null if not found.
 */
export async function getMockFlag(country: string): Promise<string | null> {
	const normalizedCountry = country.toLowerCase();
	const dataPath = join(process.cwd(), BASE_PATH, "flags.json");
	console.log(`[Lib] Reading flag data from: ${dataPath}`);

	if (!existsSync(dataPath)) {
		console.error(`[Lib] Flag database file not found: ${dataPath}`);
		return null;
	}

	try {
		await new Promise((resolve) => setTimeout(resolve, 100)); // Fake API delay
		const rawData = readFileSync(dataPath, "utf-8");
		const flags = JSON.parse(rawData);
		return flags[normalizedCountry] || null;
	} catch (error) {
		console.error(
			`[Lib] Failed to retrieve flag data: ${(error as Error).message}`,
		);
		return null;
	}
}
