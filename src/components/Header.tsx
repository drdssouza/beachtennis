import { Sparkles } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-beach-blue to-beach-teal text-white py-4 px-6 shadow-lg sticky top-0 z-50 glass-effect">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 animate-slide">
          <div className="bg-white rounded-full p-1.5">
            <Sparkles className="h-6 w-6 text-beach-blue" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Beach Tennis Score</h1>
        </div>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/20">
                Torneios
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[200px]">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium">Super 8</div>
                        <p className="text-xs leading-snug text-muted-foreground">
                          Formato de torneio Super 8
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link to="/" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium">Super 12</div>
                        <p className="text-xs leading-snug text-muted-foreground">
                          Formato de torneio Super 12
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="text-sm bg-white/20 py-1 px-3 rounded-full backdrop-blur-sm">
          Super 8 & Super 12
        </div>
      </div>
    </header>
  );
}