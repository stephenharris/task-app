import { useState } from 'react';
import { Task, getTasks } from '../data/tasks';
import { categories } from '../data/categories';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
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
import { add } from 'ionicons/icons';
import { removeObject, setObject } from '../data/storage';
import moment from 'moment';
import TaskListItem from '../components/TaskListItem';


const Home: React.FC = () => {

  const [tasks, settasks] = useState<Task[]>([]);
  
  const [showComplete, setShowComplete]= useState<boolean>(false);
  const [filter, setFilter]= useState<string>("all");
  const [categoryFilter, setCategoryFilter]= useState<string[]>(categories.map(cat => cat.id));
  
  
  const fetchItems = () => {
    return getTasks()
      .then((msgs) => {
        console.log(msgs);
        settasks(msgs.sort((a: Task, b: Task) => a.date > b.date ? 1 : -1));
      })

  }

  useIonViewWillEnter(async () => {
    return fetchItems();
  });

  const refresh = (e: CustomEvent) => {
    fetchItems().then(e.detail.complete());
  };

  const startTask = async (task: Task) => {
    task.status = "in-progress"
    setObject("todo", task.id, task)
      .then(fetchItems)
  }
  const pauseTask = async (task: Task) => {
    task.status = "todo"
    setObject("todo", task.id, task)
      .then(fetchItems)
  }
  const completeTask = async (task: Task) => {
    task.status = "complete"
    setObject("todo", task.id, task)
      .then(fetchItems)
  }

  const deleteTask = async (task: Task) => {
    removeObject("todo", task.id)
      .then(fetchItems)
  }

  const showTask = (task: Task) : boolean => {

    if (!showComplete && task.status === "complete") {
      return false;
    }

    if( !categoryFilter.includes(task.category)) {
      return false;
    }

    switch (filter) {
      case "today":
        return !!task.date && moment(task.date).isSame(moment(), "day");
      case "tomorrow":
        return !!task.date && moment(task.date).isSame(moment("tomorrow"), "day");
      case "none":
        return !task.date;
      case "overdue":
        return !!task.date && moment(task.date).isBefore(moment(), "day") && task.status !== "complete";
      default:
        return true;
    }

  }

  const sortTasks = (a: Task, b: Task) : number => {
    const statuses = ["complete", "todo", "in-progress" ];
    const aStatus = statuses.indexOf(a.status);
    const bStatus = statuses.indexOf(b.status);

    // If status is the same, sort by date due, earliest first.
    if (aStatus === bStatus) {
      return moment(a.date).isBefore(moment(b.date)) ? -1 : 1;
    }

    // A higher status index should be shown first
    return aStatus > bStatus ? -1 : 1;
  }

  let visibleTasks = tasks && tasks.filter(showTask).sort(sortTasks);

  return (
    <>
      <IonMenu contentId="home-page">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">

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
          <IonListHeader>
            <IonLabel>Categories</IonLabel>
            <IonButton onClick={() => setCategoryFilter(categories.map(cat => cat.id))}>Show All</IonButton>
          </IonListHeader>

          {categories.map((category) => {
            return (
              <IonItem key={category.id}>
                <IonLabel>{category.label}</IonLabel>
                <IonCheckbox
                  slot="end" 
                  value={category.id} 
                  checked={categoryFilter.includes(category.id)}
                  onIonChange={(event) => {
                    let newCategoryFilter = Array.from(categoryFilter);
                    if (event.detail.checked) {
                      newCategoryFilter.push(category.id);
                    } else {
                      newCategoryFilter = categoryFilter.filter(item => item !== category.id)
                    }
                    console.log(newCategoryFilter);
                    setCategoryFilter(newCategoryFilter);
                  }}
                  >  
                </IonCheckbox>
              </IonItem>
            )
          })}
          
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

      </IonContent>
    </IonPage>
    </>
  );
};

export default Home;
