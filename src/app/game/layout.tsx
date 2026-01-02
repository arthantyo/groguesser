import Link from "next/link";
import { getLoggedInUser } from "../../lib/appwrite/client";
import { redirect } from "next/navigation";
import { isDevelopment } from "../../utils/constants";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await getLoggedInUser();

  if (!authenticated) {
    redirect("/auth");
  }

  return <>{children}</>;
}
