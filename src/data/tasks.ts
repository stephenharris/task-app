import { get } from "./storage";

export interface Task {
  category: string;
  description: string;
  date: string;
  id: string;
  status: string
}

export const getTasks = () => {
  return get("todo")
};

export const getTask = (id: string) => getTasks().then((tasks) => tasks.find((m: Task) => m.id === id));
