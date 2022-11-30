import { get } from "./storage";

export interface Category {
  id: string;
  label: string
}

export const categories: Category[] = [
    {
        id: "work",
        label: "Work"
    },
    {
        id: "home",
        label: "Home"
    },
    {
        id: "garden",
        label: "Garden"
    }
];
