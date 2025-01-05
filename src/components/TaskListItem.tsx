import {
  IonBadge,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonNote,
  useIonActionSheet
  } from '@ionic/react';
import { Task } from '@stephenharris/task-cli/lib/tasks';
import './TaskListItem.css';
import { close, pause, play, checkmark, create, trash} from 'ionicons/icons';
import moment from 'moment';
import { useRef } from 'react';
import {useHistory} from 'react-router';

moment.relativeTimeThreshold('m', 45);
moment.relativeTimeThreshold('h', 48);
moment.relativeTimeThreshold('d', 14);
moment.relativeTimeThreshold('w', 4)

interface TaskListItemProps {
  task: Task;
  onStart:  (m: Task) => void;
  onPause:  (m: Task) => void;
  onComplete:  (m: Task) => void;
  onDelete:  (m: Task) => void;
}


const TaskListItem: React.FC<TaskListItemProps> = ({ task, onStart, onPause, onComplete, onDelete }) => {

  const [present] = useIonActionSheet();
  const timerRef = useRef();
  const isLongPress = useRef();
  const history = useHistory();

  const openOptions = () => {
    present({
      header: task.description,//'Example header',
      //subHeader: 'Example subheader',
      buttons: [
        {
          icon: trash,
          text: 'Delete',
          role: 'destructive',
          cssClass: 'danger',
          data: {
            action: 'delete',
          },
        },
        {
          icon: create,
          text: 'Edit',
          data: {
            action: 'edit',
          },
        },
        {
          icon: close,
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
      onDidDismiss: ({ detail }) => {
       
        if (detail.role === "destructive") {
          onDelete(task);
        } else if (detail.data && detail.data.action === "edit") {
          history.push(`/edit/${task.id}`);
        }
        
      }
    })
  }

  function clearLongpressTimeout() {
    clearTimeout(timerRef.current);
  }

  function startPressTimer() {
    (isLongPress.current as any) = false;
    clearTimeout(timerRef.current);
    (timerRef.current as any) = setTimeout(() => {
      (isLongPress.current as any) = true;
      openOptions()
    }, 500)
  }

  return (
    <IonItemSliding onIonDrag={clearLongpressTimeout}>
      <IonItemOptions side="start">
        <IonItemOption color={task.status === "in-progress" ? "warning" : "primary"} onClick={() => {
              console.log("toggle");
              if (task.status === "in-progress") {
                onPause(task)
              } else {
                onStart(task)
              }
            }}>
            {task.status !== "in-progress" ? 
              <IonIcon slot="icon-only" icon={play}></IonIcon> : 
              <IonIcon slot="icon-only" icon={pause}></IonIcon>
            }
        </IonItemOption>
      </IonItemOptions>

      <IonItem className={"status-"+task.status} 
        onMouseDown={startPressTimer}
        onTouchStart={startPressTimer}
        onMouseUp={clearLongpressTimeout}
        onTouchEnd={clearLongpressTimeout}
        onTouchMove={clearLongpressTimeout}
        onDragStart={clearLongpressTimeout}
        >
     
        <div slot="start" className={ "dot dot-" + task.status}></div>

        <IonLabel className="ion-text-wrap">
          <h2>
            {task.description}
          </h2>

          {task.tags && task.tags.map((tag) => {
            return (<IonBadge key={task.id + "/" + tag} slot="start">{tag}</IonBadge>)
          })}

          
        </IonLabel>


        {task.date && <IonNote slot="end" className="ion-text-wrap">
            Due {moment(task.date).fromNow()}
        </IonNote>}
 
      </IonItem>
      
      <IonItemOptions side="end">
        <IonItemOption onClick={() => onComplete(task)} color="success">
          <IonIcon slot="icon-only" icon={checkmark}></IonIcon>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default TaskListItem;
