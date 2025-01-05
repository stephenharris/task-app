import { useState } from 'react';
import { Task, sortTasks, TaskService } from '@stephenharris/task-cli/lib/tasks';
import { sync } from '@stephenharris/task-cli/lib/sync';
import { Gist } from '@stephenharris/task-cli/lib/gist';
import { RemoteStore } from '@stephenharris/task-cli/lib/remote';
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
import moment from 'moment';
import TaskListItem from '../components/TaskListItem';
import ChipInput from '../components/ChipInput';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  
  const [tasks, settasks] = useState<Task[]>([]);
  const [showComplete, setShowComplete]= useState<boolean>(false);
  const [filter, setFilter]= useState<string>("all");
  const [categoryFilter, setCategoryFilter]= useState<string[]>([]);
  const [error, setError] = useState("");

  const store = IonicStore.getStore("TodoDB");
  const taskService = new TaskService(store);

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
    console.log('refresh');
    const remote: RemoteStore = await store.get("gist").then((gist) => new Gist(gist.id, gist.token))
    return Promise.allSettled([
      taskService.getTasks(),
      store.getCachedState(),
      remote.getRemoteState()
    ])
      .then(async (result) => {

        if (result[0].status !== "fulfilled") {
          throw Error("Failed to fetch tasks")
        }

        if (result[2].status !== "fulfilled") {
          console.log(result[2].reason)
          throw Error(`Failed to fetch remote state: ${result[2].reason}`);
        }

        let tasks = result[0].value;
        let cachedState = result[1].status === "fulfilled" ? result[1].value : null
        let remoteState = result[2].value;

        let newState = await sync(remoteState, cachedState, tasks);
        console.log(remoteState);
        console.log(newState);
        console.log(remoteState.serial);
        console.log(newState.serial);
        if (newState.serial === remoteState.serial + 1) {
          await remote.setRemoteState(newState)
        }

        return store.setCachedState(newState)
          .then(() => store.set('todo', newState.tasks))
          .then(fetchItems);      
      })
      .then(() => {
        e.detail.complete()
        console.log("complete");
      })
      .catch((error) => {
        setError(error.message);
        e.detail.complete();
        
      });

  };

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

  const showTask = (task: Task) : boolean => {

    if (!showComplete && task.status === "complete") {
      return false;
    }

    if( categoryFilter && categoryFilter.length > 0 && !categoryFilter.every(search => task.tags.includes(search))) {
      return false;
    } 

    switch (filter) {
      case "today":
        return !!task.date && moment(task.date).isSame(moment(), "day");
      case "tomorrow":
        return !!task.date && moment(task.date).isSame( moment().add(1,'days'), "day");
      case "none":
        return !task.date;
      case "overdue":
        return !!task.date && moment(task.date).isBefore(moment(), "day") && task.status !== "complete";
      default:
        return true;
    }

  }

  let visibleTasks = tasks && tasks.filter(showTask).sort(sortTasks);

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
