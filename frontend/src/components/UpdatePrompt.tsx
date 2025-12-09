import { useEffect, useState, useCallback } from 'react';
import { IonButton } from '@ionic/react';
import './UpdatePrompt.css';

// Versión de la app - incrementar manualmente cuando hay cambios importantes
const APP_VERSION = '1.0.3';
const VERSION_KEY = 'libradesk_app_version';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const checkVersion = useCallback(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion && storedVersion !== APP_VERSION) {
      // Hay una nueva versión
      return true;
    }
    // Guardar versión actual
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    return false;
  }, []);

  useEffect(() => {
    // Verificar si hay nueva versión al cargar
    if (checkVersion()) {
      setShowUpdate(true);
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Solo mostrar update si hay un worker esperando Y es una versión nueva
        if (reg.waiting && checkVersion()) {
          setShowUpdate(true);
        }

        // Check for updates - solo si hay nueva versión
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Solo mostrar si la versión cambió
                if (checkVersion()) {
                  setShowUpdate(true);
                }
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
          // Actualizar versión almacenada antes de recargar
          localStorage.setItem(VERSION_KEY, APP_VERSION);
          window.location.reload();
        }
      });
    }
  }, [checkVersion]);

  const handleUpdate = () => {
    // Actualizar versión almacenada
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Si no hay worker esperando, solo recargar
      window.location.reload();
    }
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    // Guardar versión para no mostrar de nuevo
    localStorage.setItem(VERSION_KEY, APP_VERSION);
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
        <IonButton expand="block" fill="clear" onClick={handleDismiss} style={{ marginTop: '8px' }}>
          Más tarde
        </IonButton>
      </div>
    </div>
  );
}
