import { useEffect, useState } from 'react';
import { Task, sortTasks, TaskService } from '@stephenharris/task-cli/lib/tasks';
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import './Home.css';

import { IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { add, settingsOutline } from 'ionicons/icons';
import { IonicStore } from '../data/appstorage';
import TaskListItem from '../components/TaskListItem';
import ChipInput from '../components/ChipInput';
import Footer from '../components/Footer';
import { refreshState, taskFilter } from '../helper/task';
import { useLocation } from 'react-router';

const Home: React.FC = () => {
  
  const [tasks, settasks] = useState<Task[]>([]);
  
  const [showComplete, setShowComplete]= useState<boolean>(false);
  const [filter, setFilter]= useState<string>("all");
  const [categoryFilter, setCategoryFilter]= useState<string[]>([]);
  
  const [error, setError] = useState("");

  const store = IonicStore.getStore("TodoDB");
  const taskService = new TaskService(store);


  const location = useLocation();
  
    useEffect(() => {
      console.log(location);
      fetchItems()
    }, [location]);


  const fetchItems = () => {  
    return taskService.getTasks()
      .then((msgs) => {
        settasks(msgs.sort(sortTasks));
      })

  }

  useIonViewWillEnter(async () => {
    return fetchItems();
  });

  const refresh = async (e: CustomEvent) => {
    refreshState(store, taskService)
      .then(() => {
        e.detail.complete()
      })
      .then(fetchItems)
      .catch((error) => {
        setError(error.message);
        e.detail.complete();
      });
  }

  const startTask = async (task: Task) => {
    task.status = "in-progress"
    taskService.updateTask(task)
      .then(fetchItems)
  }
  const pauseTask = async (task: Task) => {
    task.status = "todo"
    taskService.updateTask(task)
      .then(fetchItems)
  }
  const completeTask = async (task: Task) => {
    task.status = "complete"
    taskService.updateTask(task)
      .then(fetchItems)
  }

  const deleteTask = async (task: Task) => {
    taskService.deleteTask(task.id)
      .then(fetchItems)
  }

  let visibleTasks = tasks && tasks.filter(taskFilter(showComplete, categoryFilter, filter)).sort(sortTasks);

  return (
    <>
      <IonMenu contentId="home-page">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Filters</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">

        <IonAlert
          isOpen={error !== ""}
          onDidDismiss={() => setError("")}
          header="Alert"
          subHeader="Error"
          message={error}
          buttons={['OK']}
        />

        <IonList>
          <IonListHeader>
            <IonLabel>Due date</IonLabel>
          </IonListHeader>
          <IonRadioGroup value={filter} onIonChange={(event) => setFilter(event.detail.value)}>
            <IonItem>
              <IonLabel>Any</IonLabel>
              <IonRadio slot="end" value="all"></IonRadio>
            </IonItem>
      
            <IonItem>
              <IonLabel>Overdue</IonLabel>
              <IonRadio slot="end" value="overdue"></IonRadio>
            </IonItem>
      
            <IonItem>
              <IonLabel>Due today</IonLabel>
              <IonRadio slot="end" value="today"></IonRadio>
            </IonItem>
      
            <IonItem>
              <IonLabel>Due tomorrow</IonLabel>
              <IonRadio slot="end" value="tomorrow"></IonRadio>
            </IonItem>

            <IonItem>
              <IonLabel>No due date</IonLabel>
              <IonRadio slot="end" value="none" ></IonRadio>
            </IonItem>
          </IonRadioGroup>
        </IonList>

        <IonList>
          <IonItem className="item-label-stacked">
            <IonLabel position="floating">Tags</IonLabel>
            <ChipInput value={categoryFilter} onChange={setCategoryFilter}></ChipInput>
          </IonItem>
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>Complete tasks</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel>Show complete</IonLabel>
            <IonToggle slot="end" checked={showComplete} onIonChange={(event) => setShowComplete(event.detail.checked)}></IonToggle>
            </IonItem>
          </IonList>

        </IonContent>
      </IonMenu>
    
      <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>

          <IonTitle>Todo</IonTitle>

          <IonButtons  slot="end">
            <IonButton routerLink={`/settings`}>
              <IonIcon  slot="icon-only" icon={settingsOutline}></IonIcon>
            </IonButton>
          </IonButtons>

        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">
              Inbox
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>
          {visibleTasks && visibleTasks
            .map(m => <TaskListItem key={m.id} onStart={startTask}  onPause={pauseTask} onComplete={completeTask} onDelete={deleteTask} task={m} />)}
        </IonList>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton routerLink={`/new`}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

       <Footer/>

      </IonContent>
    </IonPage>
    </>
  );
};

export default Home;
