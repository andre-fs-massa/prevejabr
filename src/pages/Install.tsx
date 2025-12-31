import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check, Share, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Link to="/" className="text-primary hover:underline mb-6 inline-block">
            ← Voltar para o início
          </Link>

          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Instalar Prevê Fácil</CardTitle>
              <CardDescription>
                Tenha acesso rápido ao app direto da tela inicial do seu celular
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {isInstalled ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    App já instalado!
                  </h3>
                  <p className="text-muted-foreground">
                    Você já pode acessar o Prevê Fácil pela tela inicial do seu dispositivo.
                  </p>
                </div>
              ) : isIOS ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Como instalar no iPhone/iPad:
                  </h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        1
                      </span>
                      <div>
                        <p className="text-foreground">
                          Toque no ícone de <strong>Compartilhar</strong>
                        </p>
                        <Share className="w-5 h-5 text-muted-foreground mt-1" />
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        2
                      </span>
                      <p className="text-foreground">
                        Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        3
                      </span>
                      <p className="text-foreground">
                        Toque em <strong>"Adicionar"</strong> no canto superior direito
                      </p>
                    </li>
                  </ol>
                </div>
              ) : deferredPrompt ? (
                <div className="text-center space-y-4">
                  <Button onClick={handleInstall} size="lg" className="w-full">
                    <Download className="w-5 h-5 mr-2" />
                    Instalar agora
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    O app será adicionado à sua tela inicial
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Como instalar no Android:
                  </h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        1
                      </span>
                      <p className="text-foreground">
                        Abra o menu do navegador (três pontos no canto superior)
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        2
                      </span>
                      <p className="text-foreground">
                        Toque em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
                      </p>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        3
                      </span>
                      <p className="text-foreground">
                        Confirme a instalação
                      </p>
                    </li>
                  </ol>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Vantagens do app:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Acesso rápido pela tela inicial
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Funciona offline
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Carregamento mais rápido
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Experiência em tela cheia
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Install;
