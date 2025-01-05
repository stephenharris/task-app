import { Storage, Drivers } from "@ionic/storage";
import { LocalStore, State, clientVersion } from '@stephenharris/task-cli/lib/state';
import { Task } from "@stephenharris/task-cli/lib/tasks";
import { upgradeState, Version1State } from '@stephenharris/task-cli/lib/upgrade';


export class IonicStore implements LocalStore {

    private static instances: Map<string,IonicStore> = new Map([]);
    private storage: Storage;

    public constructor(storage: Storage) {
        this.storage = storage;
    }

    static getStore(name: string): IonicStore{

        if (!IonicStore.instances.has(name)) {

            storage = new Storage({
                name,
                driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
            });

            storage.create();

            const store = new IonicStore(storage);
            IonicStore.instances.set(name, store);

            store.getCachedState().then((cachedState: State) => {
                if(cachedState !== null && cachedState.version > clientVersion) {
                    throw Error(`Client version is ${clientVersion}, but state is at version ${cachedState.version}. Please update the client client.`)
                }
                
                if(cachedState !== null && cachedState.version < clientVersion) {
                    console.log("upgrade state")
                    Promise.allSettled([
                        store.getTasks(),
                        Promise.resolve(cachedState)
                    ])
                    .then(async (result) => {
                
                        if (result[0].status !== "fulfilled") {
                            throw Error("Failed to fetch tasks")
                        }
                
                        if (result[1].status !== "fulfilled") {
                            throw Error("Failed to fetch cached state")
                        }
                
                        let tasks = result[0].value;
                        let cachedState = result[1].value as unknown;
                
                        let tmp = JSON.parse(JSON.stringify(cachedState));
                        tmp.tasks = tasks;
                
                        tmp = upgradeState(tmp);
                        cachedState = upgradeState(cachedState as Version1State);
                
                        return store.setCachedState(cachedState as State)
                                .then(() => store.set("todo", tmp.tasks));

                    })
                }
            });      
        }

        return IonicStore.instances.get(name) as IonicStore;
    }


    public getCachedState() {
        return this.get("cachedstate")
    }

    public setCachedState(data: State) {
        return this.set("cachedstate", data).then(() => data);
    }

    public async setTask(id: string, task: Task) {
      await this.setObject("todo", id, task)
      return task;
    } 

    public removeTask(id: string) {
        return this.removeObject("todo", id)
    } 

    public getTasks(){
        return this.get("todo").then((tasks) => tasks ? tasks : [])
    };

    set(key: string, val: any) {
        return storage.set(key, val);
    }

    get(key: string) {
        return storage.get(key);
    }

    async setObject(key: string, id: string, val: any) {
    
        let all = await this.storage.get(key);
        all = all ? all : [];
        const objIndex = await all.findIndex((a: any) => a.id === id);
    
        if (objIndex === -1) {
            all.push(val)
        } else {
            all[objIndex] = val;
        }
        set(key, all);
    }
    
    async removeObject(key: string, id: string) {
 
        let all = await this.storage.get(key);
        all = all ? all : [];
        const objIndex = await all.findIndex((a: any) => a.id === id);
    
        all.splice(objIndex, 1);
        set(key, all);
    }
    
    async getObject(key: string, id: string) {
    
        let all = await this.storage.get(key);
        all = all ? all : [];
    
        const obj = await all.filter((a: any) => a.id === id)[0];
        return obj;
    }
}



var storage: Storage;

export const createStore = (name = "__mydb") => {

    storage = new Storage({
        
        name,
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    });

    storage.create();
    
}


export const set = (key: string, val: any) => {

    return storage.set(key, val);
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