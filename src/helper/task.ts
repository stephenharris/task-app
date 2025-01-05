import { RemoteStore } from "@stephenharris/task-cli/lib/remote";
import { Task, TaskService } from "@stephenharris/task-cli/lib/tasks";
import moment from "moment";
import { IonicStore } from "../data/appstorage";
import { Gist } from "@stephenharris/task-cli/lib/gist";
  
export const taskFilter = (showComplete: boolean, categoryFilter: Array<string>, dateFilter: string) => {
    return (task: Task) : boolean => {

    if (!showComplete && task.status === "complete") {
      return false;
    }

    if( categoryFilter && categoryFilter.length > 0 && !categoryFilter.every(search => task.tags.includes(search))) {
      return false;
    } 

    switch (dateFilter) {
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

}

export const refreshState = async (store: IonicStore, taskService: TaskService) => {
    
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
            throw Error(`Failed to fetch remote state: ${result[2].reason}`);
        }

        let tasks = result[0].value;
        let cachedState = result[1].status === "fulfilled" ? result[1].value : null
        let remoteState = result[2].value;

        let newState = await sync(remoteState, cachedState, tasks);
        if (newState.serial === remoteState.serial + 1) {
          await remote.setRemoteState(newState)
        }

        return store.setCachedState(newState)
            .then(() => store.set('todo', newState.tasks))   
    })
    

  };
