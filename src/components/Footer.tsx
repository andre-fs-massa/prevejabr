import { TrendingUp, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">
                Preveja<span className="text-secondary">.br</span>
              </span>
            </a>
            <p className="text-background/60 mb-6 max-w-sm">
              A plataforma de previsões mais confiável do Brasil. Transforme suas opiniões em oportunidades reais.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3 text-background/60">
              <li><a href="#" className="hover:text-secondary transition-colors">Mercados</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Como funciona</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3 text-background/60">
              <li><a href="#" className="hover:text-secondary transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Imprensa</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Suporte</h4>
            <ul className="space-y-3 text-background/60">
              <li><a href="#" className="hover:text-secondary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/40">
          <p>© 2024 Preveja.br. Todos os direitos reservados.</p>
          <p>Feito com 💚💛 no Brasil</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
