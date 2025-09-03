import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Lightbulb, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Awareness Hub", href: "/awareness" },
  { name: "Quiz", href: "/quiz" },
  { name: "Blog", href: "/blog" },
  { name: "Report", href: "/report" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" data-testid="logo-link">
            <div className="flex items-center">
              <Lightbulb className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">AwarenessPlatform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors duration-200 font-medium ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="text-lg font-bold text-foreground">Menu</span>
                </div>
                <nav className="p-4">
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block py-3 transition-colors duration-200 font-medium border-b border-border ${
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                        onClick={() => setIsOpen(false)}
                        data-testid={`mobile-nav-${item.name.toLowerCase().replace(" ", "-")}`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
