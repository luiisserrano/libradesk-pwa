import api from './api';

const VAPID_PUBLIC_KEY = 'BN3ccBTdkoEnk8K0T98dLAoeg7AojUXSmbgp__mC4oXsH9xeplguM4GLqvUw8WNO4APLZ_iUEWpksQXR-1mh1xU'; // Replace with your generated public key

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

export const notificationService = {
    subscribeToPush: async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push messaging is not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            }

            // Send subscription to backend
            await api.post('/push/subscribe', subscription);
            console.log('Push subscription successful');

        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    },

    unsubscribeFromPush: async () => {
        if (!('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
                console.log('Unsubscribed from push notifications');
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    }
};
