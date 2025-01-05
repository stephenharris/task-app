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
  useIonViewWillEnter,
  InputCustomEvent,
  DatetimeCustomEvent
} from '@ionic/react';
import { useParams } from 'react-router';
import './ViewTask.css';
import {useHistory} from 'react-router';
import { IonicStore } from '../data/appstorage';
import ChipInput from '../components/ChipInput';
import { Task, TaskService } from '@stephenharris/task-cli/lib/tasks';
import Footer from '../components/Footer';


function EditItem() {
  
  const [task, setTask] = useState<Task>();
  const [dueDate, setDueDate] = useState<string>();
  const params = useParams<{ id: string }>();
  const datetime = useRef<HTMLIonDatetimeElement>(null);
  const history = useHistory();
  const store = IonicStore.getStore("TodoDB");
  const taskService = new TaskService(store)

  const setProperty = (key: keyof Task, value: any) => {
    if(task){
      task[key] = value;
    }
    return setTask(task);
  }

  useIonViewWillEnter(() => {
    taskService.getTask(params.id).then((t) => {
      setTask(t)
      setDueDate(t.date || "")
    });
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
        <IonInput onIonChange={(evt: InputCustomEvent) => setProperty(task, "description", evt.detail.value || "" )} placeholder='...' value={task?.description}></IonInput>
      </IonItem>

      <IonItem className="item-label-stacked">
        <IonLabel position="floating">Tags</IonLabel>
        <ChipInput value={task?.tags || []} onChange={(value) => setProperty("tags", value)}></ChipInput>      
      </IonItem>

      <IonItem>
        <IonLabel>Date</IonLabel>
        <IonDatetimeButton datetime='datetime'></IonDatetimeButton>  
        <IonModal keepContentsMounted={true}>
          <IonDatetime ref={datetime} presentation="date" id="datetime" value={dueDate} onIonChange={(evt: DatetimeCustomEvent) => {
            setDueDate(evt.detail.value as string || "")
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
          if (task) {
            task.date = dueDate || null
            taskService.updateTask(task)
            history.push('/home');
          }
        }}>Update</IonButton>
        
      <Footer/>

      </IonContent>
    </IonPage>
  );
}

export default EditItem;
