import { DropletIcon } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <DropletIcon className="size-12 fill-primary text-primary" aria-hidden />
      <h1 className="text-4xl font-bold tracking-tight">BloodBridge</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Connecting blood donors with patients in need, fast.
      </p>
      <Button size="lg">Get started</Button>
    </main>
  );
}
