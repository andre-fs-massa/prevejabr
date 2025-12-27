import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Preveja<span className="text-primary">.br</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#mercados" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Mercados
            </a>
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Como Funciona
            </a>
            <a href="#categorias" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Categorias
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">Entrar</Button>
            <Button variant="default">Criar Conta</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="#mercados" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Mercados
              </a>
              <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Como Funciona
              </a>
              <a href="#categorias" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Categorias
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full">Entrar</Button>
                <Button variant="default" className="w-full">Criar Conta</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
