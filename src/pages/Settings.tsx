import { useState } from 'react';
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
