import { authClient } from "../auth-client";

export async function getCurrUser() {
  const { data: session } = await authClient.getSession();

  return session;
}
