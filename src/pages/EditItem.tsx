import { useRef, useState } from 'react';
import { Task, getTask } from '../data/tasks';
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
  IonSelect,
  IonSelectOption,
  IonToolbar,
  useIonViewWillEnter,
  InputCustomEvent,
  SelectCustomEvent,
  DatetimeCustomEvent
} from '@ionic/react';
import { useParams } from 'react-router';
import './ViewTask.css';
import {useHistory} from 'react-router';
import { get, setObject, removeObject } from '../data/storage';

function EditItem() {
  
  const [id, setTaskId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const params = useParams<{ id: string }>();
  const datetime = useRef<HTMLIonDatetimeElement>(null);
  const history = useHistory();
  
  useIonViewWillEnter(() => {
    getTask(params.id).then((msg) => {
      setTaskId(msg.id)
      setDescription(msg.description);
      setDate(msg.date);
      setCategory(msg.category);
    })
  });

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
        <IonInput onIonChange={(evt: InputCustomEvent) => setDescription(evt.detail.value || "")} placeholder='...' value={description}></IonInput>
      </IonItem>

      <IonItem>
        <IonSelect  onIonChange={(evt: SelectCustomEvent) => setCategory(evt.detail.value || "")} placeholder='Category' value={category}>
          <IonSelectOption value="none">None</IonSelectOption>
          <IonSelectOption value="work">Work</IonSelectOption>
          <IonSelectOption value="home">Home</IonSelectOption>
          <IonSelectOption value="garden">Garden</IonSelectOption>
        </IonSelect>          
      </IonItem>


      <IonItem>
        <IonLabel>Date</IonLabel>
        <IonDatetimeButton datetime='datetime'></IonDatetimeButton>  
        <IonModal keepContentsMounted={true}>
          <IonDatetime ref={datetime} presentation="date" id="datetime" value={date} onIonChange={(evt: DatetimeCustomEvent) => {
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
          await setObject("todo", id, {
            id: id,
            description: description,
            date: date,
            category: category,
            status: "todo"
          })
          history.push('/home');
        }}>Update</IonButton>
        
      </IonContent>
    </IonPage>
  );
}

export default EditItem;
