import { Building2, TrendingUp, Trophy, Tv, Zap, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Política",
    icon: Building2,
    count: 45,
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
  },
  {
    name: "Economia",
    icon: TrendingUp,
    count: 32,
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
  },
  {
    name: "Esportes",
    icon: Trophy,
    count: 78,
    color: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-500",
  },
  {
    name: "Entretenimento",
    icon: Tv,
    count: 28,
    color: "from-pink-500/20 to-pink-600/10",
    iconColor: "text-pink-500",
  },
  {
    name: "Tecnologia",
    icon: Zap,
    count: 19,
    color: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-500",
  },
  {
    name: "Internacional",
    icon: Globe,
    count: 24,
    color: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-500",
  },
];

const Categories = () => {
  return (
    <section id="categorias" className="py-20 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore por Categoria
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Encontre mercados que combinam com seus interesses e conhecimentos.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/mercados?categoria=${encodeURIComponent(category.name)}`}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${category.iconColor}`}
                >
                  <category.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} mercados
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
