import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gamepad2, Shield, AlertTriangle, Info } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Gamepad2 className="w-4 h-4" />
              Plataforma de Entretenimento
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Termos de Uso
            </h1>
            <p className="text-muted-foreground text-lg">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-6 sm:p-8 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  Aviso Importante
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Preveja.br é uma plataforma de <strong className="text-foreground">entretenimento e simulação</strong>. 
                  Não utilizamos dinheiro real. Todos os "pontos" são fictícios e não possuem valor monetário. 
                  Esta plataforma <strong className="text-foreground">não é um site de apostas</strong> e não oferece 
                  ganhos financeiros reais.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Natureza da Plataforma
                </h2>
              </div>
              <div className="pl-11 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  O Preveja.br é um jogo de previsões desenvolvido exclusivamente para fins de 
                  <strong className="text-foreground"> entretenimento</strong>. Nossa plataforma permite que 
                  usuários façam previsões sobre eventos futuros utilizando pontos virtuais fictícios.
                </p>
                <p>
                  <strong className="text-foreground">Os pontos utilizados na plataforma:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>São completamente fictícios e não têm valor monetário</li>
                  <li>Não podem ser trocados por dinheiro real em nenhuma circunstância</li>
                  <li>Não podem ser transferidos para outras contas ou pessoas</li>
                  <li>São fornecidos gratuitamente como bônus de boas-vindas (100 pontos)</li>
                  <li>Servem apenas para medir a performance nas previsões</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Não é Aposta Real
                </h2>
              </div>
              <div className="pl-11 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Deixamos claro que o Preveja.br <strong className="text-foreground">não é um site de apostas</strong>:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Não aceitamos depósitos em dinheiro real</li>
                  <li>Não oferecemos saques ou pagamentos de qualquer tipo</li>
                  <li>Não há transações financeiras envolvidas</li>
                  <li>O objetivo é puramente recreativo e educacional</li>
                  <li>Não há risco financeiro para os usuários</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Objetivo do Jogo
                </h2>
              </div>
              <div className="pl-11 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  O Preveja.br foi criado para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Proporcionar entretenimento através de previsões sobre eventos</li>
                  <li>Criar uma competição saudável entre usuários via ranking</li>
                  <li>Estimular o pensamento crítico e análise de cenários</li>
                  <li>Permitir que usuários testem suas habilidades de previsão sem riscos</li>
                  <li>Promover discussões sobre temas de interesse público</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">4</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Elegibilidade
                </h2>
              </div>
              <div className="pl-11 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Para usar o Preveja.br, você deve:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ter pelo menos 18 anos de idade</li>
                  <li>Concordar com estes Termos de Uso</li>
                  <li>Usar a plataforma apenas para fins de entretenimento</li>
                  <li>Não tentar burlar ou explorar o sistema de pontos</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">5</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Conduta do Usuário
                </h2>
              </div>
              <div className="pl-11 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Ao usar nossa plataforma, você concorda em:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Não criar múltiplas contas para obter vantagens indevidas</li>
                  <li>Não usar bots ou automação para fazer previsões</li>
                  <li>Manter um comportamento respeitoso nos comentários</li>
                  <li>Não compartilhar informações falsas ou enganosas</li>
                  <li>Reportar qualquer comportamento suspeito ou abusivo</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">6</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Isenção de Responsabilidade
                </h2>
              </div>
              <div className="pl-11 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  O Preveja.br:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Não garante a precisão das previsões ou resultados</li>
                  <li>Não se responsabiliza por decisões tomadas com base nas previsões da plataforma</li>
                  <li>Reserva-se o direito de modificar, suspender ou encerrar mercados</li>
                  <li>Pode ajustar o saldo de pontos em caso de erros ou abusos</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">7</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Alterações nos Termos
                </h2>
              </div>
              <div className="pl-11 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Podemos atualizar estes Termos de Uso periodicamente. Quando fizermos alterações 
                  significativas, notificaremos você através da plataforma. O uso continuado do 
                  Preveja.br após as alterações constitui aceitação dos novos termos.
                </p>
              </div>
            </section>
          </div>

          {/* Final Notice */}
          <div className="mt-12 bg-muted/50 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  Resumo
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Preveja.br é um <strong className="text-foreground">jogo gratuito de previsões</strong> que 
                  usa pontos fictícios sem valor real. Nosso objetivo é proporcionar entretenimento e uma 
                  competição saudável entre usuários. Divirta-se testando suas previsões!
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-10 text-center text-muted-foreground">
            <p>
              Dúvidas sobre os Termos de Uso? Entre em contato conosco através do email{" "}
              <a href="mailto:contato@preveja.br" className="text-secondary hover:underline">
                contato@preveja.br
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
