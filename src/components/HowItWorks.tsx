import { Search, MousePointerClick, Wallet, Trophy } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Escolha um evento",
    description: "Navegue por centenas de mercados sobre política, economia, esportes e muito mais.",
  },
  {
    icon: MousePointerClick,
    title: "Faça sua previsão",
    description: "Use seus pontos fictícios para apostar SIM ou NÃO no que você acredita que vai acontecer.",
  },
  {
    icon: Wallet,
    title: "Acompanhe em tempo real",
    description: "Veja as probabilidades mudarem conforme novas informações surgem. Jogue quando quiser.",
  },
  {
    icon: Trophy,
    title: "Suba no ranking",
    description: "Acertou? Ganhe pontos e mostre quem é o melhor previsor. Tudo por diversão!",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-32 bg-background relative overflow-hidden scroll-mt-24">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Jogar
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simples e divertido. Comece a jogar em minutos com pontos fictícios.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card group">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-sm font-bold text-secondary-foreground shadow-gold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
