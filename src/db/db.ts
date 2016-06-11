import {MongoClient, Db as MDB, Collection as Collection} from 'mongodb' 
import * as Config from '../config' 

export class DB {
    private static instance: DB    
    private db: MDB
    prInitialized: Promise<void>
    collections: Map<string, Collection> = new Map()

    constructor() {
        if (DB.instance) return DB.instance;
        DB.instance = this;
    }

    pInit() {
        if (!this.prInitialized) {
            this.prInitialized = new Promise<void>((resolve, reject) => {
                MongoClient.connect(Config.DB_URL, (err: Error, db: MDB)=>{
                    if (err) return reject(err);

                    this.db = db;
                    resolve();
                });
            });
        }

        return this.prInitialized;
    }

    pGetCollection(name: string) : Promise<Collection> {
        if (this.collections.has(name)) {
            return Promise.resolve(this.collections.get(name));
        }

        return new Promise((resolve, reject) => {
            this.db.collection(name, (err:any, collection:Collection) => {
                if (err) return reject(err); 

                this.collections.set(name, collection);
                resolve(collection);
            });
        });
    }
}