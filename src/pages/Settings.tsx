import { useState, useEffect} from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar,
  InputCustomEvent,
  useIonViewWillEnter,
  IonAlert,
  useIonToast,
  IonCheckbox,
  CheckboxCustomEvent
} from '@ionic/react';
import './ViewTask.css';
import {useHistory} from 'react-router';
import { IonicStore, set } from '../data/appstorage';
import { RemoteStore } from '@stephenharris/task-cli/lib/remote';
import { Gist } from '@stephenharris/task-cli/lib/gist';
import { sync } from '@stephenharris/task-cli/lib/sync';
import Footer from '../components/Footer';

function Settings() {

  const [id, setId] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const history = useHistory();
  const store = IonicStore.getStore("TodoDB");
  const [error, setError] = useState("");
  const [present] = useIonToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    store.get("subscription").then((data) => {
      console.log(data);
      setIsSubscribed(!!data);
      return 
    })
  }, [store]);


  const presentToast = (message: string) => {
    present({
      message: message,
      duration: 1500,
      position: 'bottom',
      cssClass: 'success-toast'
    });
  };

  useIonViewWillEnter(async () => {
    return store.get("gist").then((gist) => {
      if(gist) {
        setId(gist?.id);
        setToken(gist?.token);
      }
    })
  });

  const reset = async () => {
    console.log('reset');
    const remote: RemoteStore = await store.get("gist").then((gist) => new Gist(gist.id, gist.token))
    return remote.getRemoteState()
      .then(async (remoteState) => {

        console.log("remoteState");
        console.log(remoteState);
        let newState = await sync(remoteState, null, []);
        console.log("new state");
        console.log(remoteState);
        console.log(newState);
        return store.setCachedState(newState)
          .then(() => set('todo', newState.tasks))   
      })
      .then(() => {
        presentToast('State reset')
        console.log("complete");
      })
      .catch((error) => {
        setError(error.message);
      });

  };
  
  const API_URL = process.env.REACT_APP_API_URL;
  const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "";
  //const [enabled, setEnabled] = useState(false);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  };


  function base64urlEncode(str: string): string {
  // Convert string to a UTF-8 byte array
  const utf8Bytes = new TextEncoder().encode(str);

  // Convert byte array to standard base64
  let base64 = btoa(String.fromCharCode(...utf8Bytes));

  // Convert base64 to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/task-app/service-worker.js', {
        scope: '/task-app/',
      });
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permission not granted for notifications');
        //setEnabled(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionJSON = subscription.toJSON();

      
      console.log('Push subscription:', subscriptionJSON);
      console.log('Push Subscription JSON:', JSON.stringify(subscriptionJSON));

      await store.set("subscription", subscriptionJSON)

      // Send this subscription to your backend
      await fetch(`${API_URL}/subscription`, {
        method: 'POST',
        body: JSON.stringify(subscriptionJSON),
        headers: {
          'Content-Type': 'application/json',
        },
      });

     // setEnabled(true);
    } catch (error) {
      console.error('Error subscribing', error);
     // setEnabled(false);
    }
  };


  const unSubscribeUser = async () => {
    try {

      let subscription = await store.get("subscription");

      
      let encodedEndpoint = base64urlEncode(subscription.endpoint)
      console.log(encodedEndpoint);
      // Send this subscription to your backend
      await fetch(`${API_URL}/subscription/${encodedEndpoint}`, {
        method: 'DELETE',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      await store.set("subscription", null)
    } catch (error) {
      console.error('Error UNsubscribing', error);
    }
  };

  const handleSubscriptonChange = async (evt: CheckboxCustomEvent) => {
    if (evt.detail.checked) {
      await subscribeUser();
    } else {
      await unSubscribeUser();
    }
  };

  return (
    <IonPage id="view-task-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/home"></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen class="ion-padding">

      <IonAlert
          isOpen={error !== ""}
          onDidDismiss={() => setError("")}
          header="Alert"
          subHeader="Error"
          message={error}
          buttons={['OK']}
        />
      
      <IonItem>
        <IonLabel position="floating">Gist ID</IonLabel>
        <IonInput onIonChange={(evt: InputCustomEvent) => setId(evt.detail.value || "")} value={id} placeholder='...'></IonInput>
      </IonItem>

      
      <IonItem>
        <IonLabel position="floating">Token</IonLabel>
        <IonInput onIonChange={(evt: InputCustomEvent) => setToken(evt.detail.value || "")} value={token} placeholder='...'></IonInput>
      </IonItem>

      <hr></hr>
      
      <IonItem>
        <IonCheckbox slot="start" onIonChange={(evt: CheckboxCustomEvent) => document.body.classList.toggle('dark', evt.detail.checked)} ></IonCheckbox>
        <IonLabel>Toggle dark mode</IonLabel>
      </IonItem>

      <hr></hr>
      
      <IonItem>
        <IonCheckbox slot="start" checked={isSubscribed} onIonChange={handleSubscriptonChange} ></IonCheckbox>
        <IonLabel>Enable push notifications</IonLabel>
      </IonItem>

      <hr></hr>

      <IonToolbar>
        <IonButton slot="start" onClick={async () => {
          await store.set("gist", {id: id, token: token})
          history.push('/home');
        }}>Update</IonButton>
        
        <IonButton slot="end" color="danger" onClick={reset}>Reset</IonButton>
      </IonToolbar>

      <Footer/>
      
      </IonContent>
    </IonPage>
  );
}

export default Settings;
