import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const config = await prisma.appConfig.findFirst();
  if (!config) redirect("/setup");

  return (
    <main className="flex-1 flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold syntax-function">
            HardiAcc<span className="animate-cursor ml-0.5 text-primary">_</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Masukkan master password untuk lanjut</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
