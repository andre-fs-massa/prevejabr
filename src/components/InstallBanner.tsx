import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem('pwa-banner-dismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isDismissed || isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS devices that don't support beforeinstallprompt
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isIOS && isMobile && !isStandalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // For iOS, redirect to install page with instructions
      window.location.href = '/instalar';
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm sm:text-base">
              Instale o PreviApp no seu celular!
            </p>
            <p className="text-xs sm:text-sm opacity-90 hidden sm:block">
              Acesso rápido, notificações e experiência completa offline.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 font-semibold"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Instalar</span>
            <span className="sm:hidden">App</span>
          </Button>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fechar banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
