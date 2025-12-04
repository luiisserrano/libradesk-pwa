import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonButtons, IonMenuButton } from '@ionic/react';
import { peopleOutline, bookOutline, pricetagsOutline, personOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const history = useHistory();

    const modules = [
        { title: 'Usuarios', icon: peopleOutline, path: '/admin/users', desc: 'Gestionar roles y usuarios' },
        { title: 'Libros', icon: bookOutline, path: '/admin/books', desc: 'Editar y eliminar libros' },
        { title: 'Géneros', icon: pricetagsOutline, path: '/admin/genres', desc: 'Administrar géneros literarios' },
        { title: 'Autores', icon: personOutline, path: '/admin/authors', desc: 'Administrar autores' },
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Panel de Administración</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonGrid>
                    <IonRow>
                        {modules.map((mod, index) => (
                            <IonCol size="12" sizeMd="6" key={index}>
                                <IonCard button onClick={() => history.push(mod.path)}>
                                    <IonCardHeader>
                                        <IonCardTitle>
                                            <IonIcon icon={mod.icon} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                                            {mod.title}
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        {mod.desc}
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default AdminDashboard;
