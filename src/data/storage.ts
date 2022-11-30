import { Storage, Drivers } from "@ionic/storage";

var storage: Storage;

export const createStore = (name = "__mydb") => {

    storage = new Storage({
        
        name,
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    });

    storage.create();
    
}


export const set = (key: string, val: any) => {

    storage.set(key, val);
}

export const get = async (key: string) => {

    const val = await storage.get(key);
    return val;
}

export const remove = async (key: string) => {

    await storage.remove(key);
}

export const clear = async () => {

    await storage.clear();
}

export const setObject = async (key: string, id: string, val: any) => {

    let all = await storage.get(key);
    all = all ? all : [];
    const objIndex = await all.findIndex((a: any) => a.id === id);

    if (objIndex === -1) {
        all.push(val)
    } else {
        all[objIndex] = val;
    }
    set(key, all);
}

export const removeObject = async (key: string, id: string) => {

    let all = await storage.get(key);
    all = all ? all : [];
    const objIndex = await all.findIndex((a: any) => a.id === id);

    all.splice(objIndex, 1);
    set(key, all);
}

export const getObject = async (key: string, id: string) => {

    let all = await storage.get(key);
    all = all ? all : [];

    const obj = await all.filter((a: any) => a.id === id)[0];
    return obj;
}