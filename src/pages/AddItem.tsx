import { useRef, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonToolbar,
  InputCustomEvent,
  DatetimeCustomEvent
} from '@ionic/react';
import './ViewTask.css';
import { v4 as uuid } from 'uuid';
import {useHistory} from 'react-router';
import { IonicStore } from '../data/appstorage';
import ChipInput from '../components/ChipInput';
import { TaskService } from '@stephenharris/task-cli/lib/tasks';

function AddItem() {
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

  const datetime = useRef<HTMLIonDatetimeElement>(null);
  const history = useHistory();

  const taskService = new TaskService(IonicStore.getStore("TodoDB"))

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
      
      <IonItem>
        <IonLabel position="floating">Description</IonLabel>
        <IonInput onIonChange={(evt: InputCustomEvent) => setDescription(evt.detail.value || "")} placeholder='...'></IonInput>
      </IonItem>

      <IonItem className="item-label-stacked">
        <IonLabel position="floating">Tags</IonLabel>
        <ChipInput value={tags} onChange={(value) => setTags(value)}></ChipInput>      
      </IonItem>

      <IonItem>
        <IonLabel>Date</IonLabel>
        <IonDatetimeButton datetime='datetime-new'></IonDatetimeButton>  
        <IonModal keepContentsMounted={true}>
          <IonDatetime ref={datetime} presentation="date" id="datetime-new" onIonChange={(evt: DatetimeCustomEvent) => {
            console.log("arg!");
            console.log(datetime.current);
            console.log(evt.detail.value)
            setDate(evt.detail.value as string || "")
            return datetime.current?.confirm(true)
          }}>
            <IonButtons slot="title">
              <IonButton color="primary">Today</IonButton>
              <IonButton color="primary">Tomorrow</IonButton>
              <IonButton color="primary" onClick={() => datetime.current?.confirm(true)}>Next week</IonButton>
            </IonButtons>    
          </IonDatetime>
        </IonModal>
      </IonItem>

      <IonButton onClick={async () => {
          const id = uuid();
          taskService.updateTask({
            id: id,
            description: description,
            date: date,
            tags: tags,
            status: "todo"
          })
          history.push('/home');
        }}>Add</IonButton>
        
      </IonContent>
    </IonPage>
  );
}

export default AddItem;
