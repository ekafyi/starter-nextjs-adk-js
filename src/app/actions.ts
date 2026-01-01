"use server";

import { redirect } from "next/navigation";
import {
	deleteUsernameCookie,
	getUser,
	setUsernameCookie,
	validateUsername,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
	const usernameInput = formData.get("username")?.toString() || "";
	let username = "";

	try {
		username = validateUsername(usernameInput);
	} catch (error) {
		redirect("/?error=username_required");
	}

	// Check if user exists in database
	const user = await getUser(username);
	if (!user) {
		redirect("/?error=user_not_found");
	}

	await setUsernameCookie(username);
	redirect("/agent");
}

export async function logoutAction() {
	await deleteUsernameCookie();
	redirect("/");
}
