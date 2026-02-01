import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (session.user.role === "parent") {
    redirect("/parent/listening");
  }

  if (session.user.role === "instructor") {
    redirect("/instructor/listening");
  }

  redirect("/login");
}
