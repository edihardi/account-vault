import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const config = await prisma.appConfig.findFirst();
  if (!config) redirect("/setup");

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Account Vault</h1>
          <p className="mt-2 text-sm text-zinc-400">Masukkan master password untuk lanjut</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
