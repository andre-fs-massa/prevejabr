import { TrendingUp, Gamepad2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleComoFuncionaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (location.pathname === '/') {
      document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: 'como-funciona' } });
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-10 sm:py-16">
        {/* Entertainment Disclaimer */}
        <div className="bg-background/5 border border-background/10 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-secondary flex-shrink-0" />
          <p className="text-xs sm:text-sm text-background/70">
            <strong className="text-background/90">Plataforma de entretenimento.</strong> Utilizamos apenas pontos fictícios sem valor real. Não é site de apostas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-gold flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold">
                Preveja<span className="text-secondary">.br</span>
              </span>
            </Link>
            <p className="text-sm sm:text-base text-background/60 mb-4 sm:mb-6 max-w-sm">
              Jogo de previsões para entretenimento. Teste suas habilidades com pontos fictícios e divirta-se!
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Navegação</h4>
            <ul className="space-y-2 sm:space-y-3 text-background/60 text-sm">
              <li>
                <Link to="/markets" className="hover:text-secondary transition-colors">
                  Mercados
                </Link>
              </li>
              <li>
                <a 
                  href="#como-funciona" 
                  onClick={handleComoFuncionaClick}
                  className="hover:text-secondary transition-colors cursor-pointer"
                >
                  Como Funciona
                </a>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-secondary transition-colors">
                  Ranking
                </Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-secondary transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col items-center gap-3 sm:gap-4 text-xs sm:text-sm text-background/40">
          <p>AFSM Ltda • CNPJ: 57.591.790/0001-44</p>
          <p>Suporte: <a href="mailto:afsmassa@gmail.com" className="hover:text-secondary transition-colors">afsmassa@gmail.com</a></p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p>© 2024 Preveja.br. Todos os direitos reservados.</p>
            <p>Feito com 💚💛 no Brasil</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
