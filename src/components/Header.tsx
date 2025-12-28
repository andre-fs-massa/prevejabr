import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X, LogOut, User, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setBalance(Number(data.balance));
        }
      };
      fetchBalance();

      // Realtime subscription for balance updates
      const channel = supabase
        .channel('wallet-balance')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setBalance(Number(payload.new.balance));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setBalance(null);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Preveja<span className="text-primary">.br</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/markets" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Mercados
            </Link>
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Como Funciona
            </a>
            <a href="#categorias" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Categorias
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {balance !== null && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">
                      R$ {balance.toFixed(2)}
                    </span>
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-32 truncate">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                      <Link to="/profile">
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/auth">Criar Conta</Link>
                </Button>
              </>
            )}
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
              <Link to="/markets" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Mercados
              </Link>
              <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Como Funciona
              </a>
              <a href="#categorias" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Categorias
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    {balance !== null && (
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 mx-4">
                        <Wallet className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-primary">
                          R$ {balance.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground truncate px-4 py-2">
                      {user.email}
                    </p>
                    <Button variant="ghost" className="w-full gap-2" asChild>
                      <Link to="/profile">
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full gap-2" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/auth">Entrar</Link>
                    </Button>
                    <Button variant="default" className="w-full" asChild>
                      <Link to="/auth">Criar Conta</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
