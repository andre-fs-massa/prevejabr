import { TrendingUp, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-gold flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-foreground" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold">
                Preveja<span className="text-secondary">.br</span>
              </span>
            </a>
            <p className="text-sm sm:text-base text-background/60 mb-4 sm:mb-6 max-w-sm">
              A plataforma de previsões mais confiável do Brasil. Transforme suas opiniões em oportunidades reais.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Produto</h4>
            <ul className="space-y-2 sm:space-y-3 text-background/60 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Mercados</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Como funciona</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Empresa</h4>
            <ul className="space-y-2 sm:space-y-3 text-background/60 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Imprensa</a></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Suporte</h4>
            <ul className="space-y-2 sm:space-y-3 text-background/60 text-sm">
              <li><a href="#" className="hover:text-secondary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-background/40">
          <p>© 2024 Preveja.br. Todos os direitos reservados.</p>
          <p>Feito com 💚💛 no Brasil</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
