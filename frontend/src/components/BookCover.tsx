import React, { useEffect, useState } from 'react';
import { IonSkeletonText } from '@ionic/react';
import { getBookCover } from '../services/bookService';

interface BookCoverProps {
    bookId: number;
    title: string;
    className?: string;
}

const BookCover: React.FC<BookCoverProps> = ({ bookId, title, className }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchCover = async () => {
            try {
                setLoading(true);
                console.log(`Fetching cover for book ${bookId}...`);
                const blob = await getBookCover(bookId);
                console.log(`Cover received for book ${bookId}, size: ${blob.size} bytes, type: ${blob.type}`);

                if (isMounted) {
                    const url = URL.createObjectURL(blob);
                    console.log(`Created object URL for book ${bookId}: ${url}`);
                    setImageUrl(url);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error(`Error loading cover for book ${bookId}`, err);
                console.error('Error details:', {
                    message: err.message,
                    response: err.response?.status,
                    data: err.response?.data
                });
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        fetchCover();

        return () => {
            isMounted = false;
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [bookId]);

    const containerStyle = {
        width: '100%',
        height: '300px', // Altura fija considerable
        backgroundColor: '#e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        display: 'block'
    };

    if (loading) {
        return (
            <div style={containerStyle} className={className}>
                <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div style={containerStyle} className={className}>
                <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>
                    <span style={{ fontSize: '2rem' }}>📖</span>
                    <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>{title}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle} className={className}>
            <img src={imageUrl} alt={`Portada de ${title}`} style={imageStyle} />
        </div>
    );
};

export default BookCover;
