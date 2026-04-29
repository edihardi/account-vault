import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SetupForm from "./SetupForm";

export default async function SetupPage() {
  const config = await prisma.appConfig.findFirst();
  if (config) redirect("/login");

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Account Vault</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Setup awal — buat master password dan PIN 6 digit
          </p>
        </div>
        <SetupForm />
      </div>
    </main>
  );
}
