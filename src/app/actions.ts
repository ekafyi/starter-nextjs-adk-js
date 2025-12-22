"use server";

import { redirect } from "next/navigation";
import { setUsernameCookie, validateUsername, deleteUsernameCookie } from "@/lib/auth";

export async function loginAction(formData: FormData) {
	try {
		const usernameInput = formData.get("username")?.toString() || "";
		const username = validateUsername(usernameInput);

		await setUsernameCookie(username);
	} catch (error) {
		redirect("/?error=username_required");
	}
	redirect("/agent");
}

export async function logoutAction() {
	await deleteUsernameCookie();
	redirect("/");
}
