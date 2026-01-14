// Service Worker for Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event without data');
    return;
  }

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Você tem uma nova notificação',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: 'Ver',
        },
        {
          action: 'close',
          title: 'Fechar',
        },
      ],
      tag: data.tag || 'notification',
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Preveja.br', options)
    );
  } catch (error) {
    console.error('Error parsing push data:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  // The subscription has expired or been invalidated
  // You might want to re-subscribe here
});
