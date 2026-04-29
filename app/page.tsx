import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function RootPage() {
  const config = await prisma.appConfig.findFirst();
  redirect(config ? "/login" : "/setup");
}
