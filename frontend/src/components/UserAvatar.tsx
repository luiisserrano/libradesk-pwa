import React, { useEffect, useState } from 'react';
import { IonSkeletonText, IonIcon } from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { getUserPhoto } from '../services/authService';

interface UserAvatarProps {
    userId: number;
    name: string;
    size?: string; // 'small' | 'medium' | 'large'
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ userId, name, size = 'medium', className }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchPhoto = async () => {
            try {
                setLoading(true);
                const blob = await getUserPhoto(userId);

                if (isMounted) {
                    const url = URL.createObjectURL(blob);
                    setImageUrl(url);
                    setLoading(false);
                }
            } catch (err) {
                // console.error(`Error loading photo for user ${userId}`, err);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        if (userId) {
            fetchPhoto();
        } else {
            setLoading(false);
            setError(true);
        }

        return () => {
            isMounted = false;
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [userId]);

    // Dimensiones según tamaño
    const dimensions = {
        small: '32px',
        medium: '48px',
        large: '120px'
    };

    const currentSize = dimensions[size as keyof typeof dimensions] || dimensions.medium;

    const containerStyle = {
        width: currentSize,
        height: currentSize,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
    };

    if (loading) {
        return (
            <div style={containerStyle} className={className}>
                <IonSkeletonText animated style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div style={containerStyle} className={className}>
                <IonIcon icon={personCircle} style={{ fontSize: currentSize, color: '#999' }} />
            </div>
        );
    }

    return (
        <div style={containerStyle} className={className}>
            <img src={imageUrl} alt={`Foto de ${name}`} style={imageStyle} />
        </div>
    );
};

export default UserAvatar;
