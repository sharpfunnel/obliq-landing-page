import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdminSessionCookie, verifyAdminSessionToken } from "./session";

/** Single guard, called by every admin page/action/route that requires auth. */
export const verifyAdminSession = cache(async (): Promise<void> => {
  const token = await getAdminSessionCookie();
  const valid = await verifyAdminSessionToken(token);
  if (!valid) redirect("/admin/login");
});

/** Same check without redirecting — for routes that need a boolean, not a throw. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminSessionCookie();
  return verifyAdminSessionToken(token);
}
