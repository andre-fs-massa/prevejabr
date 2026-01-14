import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// VAPID public key - this is safe to expose in frontend
const VAPID_PUBLIC_KEY = 'BN9uhcZ9qsmgrWk2UZZjybLpRxdC7FhrOXqhpaU0tWUZK2CQoJdEQoY3Gfx9TY3PhZ7efCZalkHMGm1SLZ68BFA';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<PushPermissionState>('prompt');

  // Check browser support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported && 'Notification' in window) {
      setPermission(Notification.permission as PushPermissionState);
    } else if (!supported) {
      setPermission('unsupported');
    }
  }, []);

  // Check if already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Check if subscription exists in database
          const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint)
            .maybeSingle();
          
          setIsSubscribed(!!data);
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isSupported, user]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !user) {
      toast.error('Notificações push não são suportadas neste navegador');
      return false;
    }

    setIsLoading(true);
    
    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult as PushPermissionState);
      
      if (permissionResult !== 'granted') {
        toast.error('Permissão para notificações negada');
        setIsLoading(false);
        return false;
      }

      // Register service worker for push
      const registration = await navigator.serviceWorker.register('/sw-push.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      const subscriptionJSON = subscription.toJSON();
      
      if (!subscriptionJSON.keys?.p256dh || !subscriptionJSON.keys?.auth) {
        throw new Error('Invalid subscription keys');
      }

      // Save to database
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscriptionJSON.keys.p256dh,
        auth: subscriptionJSON.keys.auth,
      }, {
        onConflict: 'user_id,endpoint',
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Notificações ativadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Erro ao ativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Delete from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('endpoint', subscription.endpoint);

        // Unsubscribe from browser
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast.success('Notificações desativadas');
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Erro ao desativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const toggle = useCallback(async () => {
    if (isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    toggle,
  };
}
