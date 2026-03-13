"use client";

import { useState, useEffect } from "react";
import { User, LogOut, ShieldCheck, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function NavUser() {
  const router = useRouter();
  const [user, setUser] = useState<{ phone_number: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from storage", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="rounded-full px-5 border-primary/30 text-primary hover:bg-primary/10">
        <a href="/login">Login</a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 pl-2 pr-3 py-1 hover:bg-muted/50">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium hidden sm:inline-block">
            {user.phone_number.slice(0, 3)}...{user.phone_number.slice(-4)}
          </span>
          <ChevronDown className="h-3 w-3 text-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1 border-border/70 backdrop-blur-xl bg-card/90">
        <div className="flex flex-col space-y-1 p-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Identified as</p>
          <p className="text-sm font-bold truncate">{user.phone_number}</p>
        </div>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem className="cursor-pointer gap-2 py-2.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Intelligence Level: Pro</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive py-2.5">
          <LogOut className="h-4 w-4" />
          <span>Secure Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
