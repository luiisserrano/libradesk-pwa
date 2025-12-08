import { useEffect, useState } from 'react';
import { IonButton, IonToast } from '@ionic/react';
import './UpdatePrompt.css';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setShowUpdate(true);
              }
            });
          }
        });
      });

      // Listen for controller change and reload
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="update-overlay">
      <div className="update-modal">
        <div className="update-icon">🔄</div>
        <h2>Nueva versión disponible</h2>
        <p>Hay una nueva versión de LibraDesk disponible. Actualiza ahora para obtener las últimas mejoras.</p>
        <IonButton expand="block" onClick={handleUpdate}>
          Actualizar ahora
        </IonButton>
      </div>
    </div>
  );
}
