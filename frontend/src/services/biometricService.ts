// Helper to convert base64url to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
    const padding = '='.repeat((4 - base64Url.length % 4) % 4);
    const base64 = (base64Url + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Helper to convert ArrayBuffer to base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export const biometricService = {
    async isAvailable() {
        if (!window.PublicKeyCredential) {
            return false;
        }
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    },

    async register(): Promise<{ success: boolean; error?: string }> {
        if (!window.isSecureContext) {
            return { success: false, error: 'La autenticación biométrica requiere HTTPS o localhost.' };
        }

        if (!window.PublicKeyCredential) {
            return { success: false, error: 'Tu navegador no soporta WebAuthn.' };
        }

        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (!available) {
                return { success: false, error: 'No se detectó ningún sensor biométrico o bloqueo de pantalla configurado en este dispositivo.' };
            }

            const publicKey: PublicKeyCredentialCreationOptions = {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                rp: {
                    name: 'Libradesk',
                    id: window.location.hostname
                },
                user: {
                    id: crypto.getRandomValues(new Uint8Array(16)),
                    name: 'user@libradesk.com',
                    displayName: 'Usuario Libradesk'
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'required'
                },
                timeout: 60000,
                attestation: 'none'
            };

            const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
            if (credential) {
                localStorage.setItem('biometric_enabled', 'true');
                localStorage.setItem('biometric_credential_id', credential.id);
                return { success: true };
            }
            return { success: false, error: 'No se pudo crear la credencial.' };
        } catch (error: any) {
            console.error('Error registering biometric:', error);
            return { success: false, error: error.message || 'Error desconocido al registrar biometría.' };
        }
    },

    async verify(): Promise<{ success: boolean; error?: string }> {
        try {
            const credentialId = localStorage.getItem('biometric_credential_id');
            if (!credentialId) return { success: false, error: 'No hay credencial biométrica guardada.' };

            const publicKey: PublicKeyCredentialRequestOptions = {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                allowCredentials: [{
                    id: base64UrlToUint8Array(credentialId) as BufferSource,
                    type: 'public-key',
                    transports: ['internal']
                }],
                userVerification: 'required',
                timeout: 60000
            };

            const assertion = await navigator.credentials.get({ publicKey });
            return { success: !!assertion };
        } catch (error: any) {
            console.error('Error verifying biometric:', error);
            return { success: false, error: error.message || 'Error al verificar biometría.' };
        }
    }
};
