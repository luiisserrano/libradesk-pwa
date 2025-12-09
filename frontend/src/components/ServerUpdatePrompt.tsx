import React, { useEffect, useState } from 'react';
import { IonButton } from '@ionic/react';
import api from '../services/api';
import './ServerUpdatePrompt.css';

const STORAGE_KEY = 'libradesk_last_seen_update';

export default function ServerUpdatePrompt() {
  const [show, setShow] = useState(false);
  const [serverTime, setServerTime] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await api.get('/updates/latest');
        const last = res.data?.last_update;
        if (!last) return;

        const stored = localStorage.getItem(STORAGE_KEY);

        // If user hasn't seen or server time is newer, show prompt
        if (!stored || new Date(last) > new Date(stored)) {
          if (mounted) {
            setServerTime(last);
            setShow(true);
          }
        }
      } catch (e) {
        // ignore errors silently
        console.error('Error fetching updates/latest', e);
      }
    }

    check();

    return () => { mounted = false; };
  }, []);

  const handleUpdate = () => {
    if (serverTime) localStorage.setItem(STORAGE_KEY, serverTime);
    // Hard reload to ensure new service worker/files are loaded
    // `location.reload()` signature may not accept a boolean in some TS lib versions
    // so call without arguments to avoid TS error.
    window.location.reload();
  };

  const handleDismiss = () => {
    if (serverTime) localStorage.setItem(STORAGE_KEY, serverTime);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="server-update-overlay">
      <div className="server-update-modal">
        <h3>Actualizaciones disponibles</h3>
        <p>Hay nuevos cambios en la biblioteca. Actualiza la app para ver el contenido más reciente.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <IonButton onClick={handleUpdate}>Actualizar</IonButton>
          <IonButton fill="clear" onClick={handleDismiss}>Más tarde</IonButton>
        </div>
      </div>
    </div>
  );
}
