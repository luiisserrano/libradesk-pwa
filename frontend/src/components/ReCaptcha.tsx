import React, { useEffect, useState, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
    onVerify: (token: string | null) => void;
    onExpire?: () => void;
    recaptchaRef?: React.RefObject<ReCAPTCHA | null>;
}

// Tu Site Key de reCAPTCHA v2 - Reemplaza con tu propia key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

const ReCaptchaComponent: React.FC<ReCaptchaProps> = ({ onVerify, onExpire, recaptchaRef }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleChange = useCallback((token: string | null) => {
        onVerify(token);
    }, [onVerify]);

    const handleExpired = useCallback(() => {
        onVerify(null);
        onExpire?.();
    }, [onVerify, onExpire]);

    // No mostrar reCAPTCHA si está offline
    if (!isOnline) {
        return null;
    }

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            margin: '16px 0',
            transform: 'scale(0.9)',
            transformOrigin: 'center'
        }}>
            <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleChange}
                onExpired={handleExpired}
                onErrored={() => onVerify(null)}
                theme="light"
                size="normal"
            />
        </div>
    );
};

export default ReCaptchaComponent;
