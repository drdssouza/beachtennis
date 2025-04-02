import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="bg-beach-orange text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          <h1 className="text-xl font-bold">Beach Tennis Score</h1>
        </div>
        <div className="text-sm">
          Super 8 & Super 12
        </div>
      </div>
    </header>
  );
}
