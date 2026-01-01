import Link from "next/link";
import { loginAction, logoutAction } from "@/app/actions";
import { getUsernameFromCookie } from "@/lib/auth";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const username = await getUsernameFromCookie();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center justify-center py-32 px-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-semibold">Countries Agent Demo</h1>
          {username ? (
            <div className="flex flex-col gap-4 w-full items-center">
              <div>
                <p className="text-lg">
                  Logged in as <span className="font-semibold">{username}</span>
                </p>
                <form action={logoutAction} className="">
                  <button
                    type="submit"
                    className="text-sm opacity-80 hover:text-destructive underline"
                  >
                    Logout
                  </button>
                </form>
              </div>
              <Link
                href="/agent"
                className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary/80 w-full"
              >
                Go to Agent
              </Link>
            </div>
          ) : (
            <>
              {error === "username_required" && (
                <p className="text-destructive text-sm">
                  Username is required.
                </p>
              )}
              {error === "user_not_found" && (
                <p className="text-destructive text-sm">
                  User not found. Please check your username.
                </p>
              )}
              {error === "not_logged_in" && (
                <p className="text-destructive text-sm">Please log in first.</p>
              )}
              <form action={loginAction} className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="username"
                    className="text-lg font-medium opacity-80"
                  >
                    Enter username to get started
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="border border-current/25 p-2 rounded accent-primary bg-muted"
                    placeholder="Your username"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary/80"
                >
                  Get Started
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
