import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { PenLine, BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";

interface NavbarProps {
  showAuthButtons?: boolean;
}

export function Navbar({ showAuthButtons = true }: NavbarProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src={logoBlack} alt="startwriting.now" className="h-10 dark:hidden" />
          <img src={logoWhite} alt="startwriting.now" className="h-10 hidden dark:block" />
        </Link>
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Link href="/">
                <Button 
                  variant={isActive("/") ? "secondary" : "ghost"} 
                  size="icon" 
                  className="rounded-full"
                  data-testid="nav-write"
                >
                  <PenLine className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/journal">
                <Button 
                  variant={isActive("/journal") ? "secondary" : "ghost"} 
                  size="icon" 
                  className="rounded-full"
                  data-testid="nav-journal"
                >
                  <BookOpen className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  variant={isActive("/dashboard") ? "secondary" : "ghost"} 
                  size="icon" 
                  className="rounded-full"
                  data-testid="nav-dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-px h-6 bg-border/50 mx-1" />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              {showAuthButtons && (
                <Link href="/auth">
                  <Button variant="default" size="sm" data-testid="nav-login">
                    Log In
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
