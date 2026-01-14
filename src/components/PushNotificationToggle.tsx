import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PushNotificationToggleProps {
  variant?: 'icon' | 'full';
}

const PushNotificationToggle = ({ variant = 'icon' }: PushNotificationToggleProps) => {
  const { isSupported, isSubscribed, isLoading, permission, toggle } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              disabled={isLoading || permission === 'denied'}
              className="relative"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSubscribed ? (
                <>
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                </>
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {permission === 'denied'
              ? 'Notificações bloqueadas no navegador'
              : isSubscribed
              ? 'Desativar notificações'
              : 'Ativar notificações'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant={isSubscribed ? 'default' : 'outline'}
      onClick={toggle}
      disabled={isLoading || permission === 'denied'}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Carregando...
        </>
      ) : isSubscribed ? (
        <>
          <Bell className="w-4 h-4" />
          Notificações Ativas
        </>
      ) : (
        <>
          <BellOff className="w-4 h-4" />
          {permission === 'denied' ? 'Bloqueadas' : 'Ativar Notificações'}
        </>
      )}
    </Button>
  );
};

export default PushNotificationToggle;
