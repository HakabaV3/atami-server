import {DB} from "../db/db";
const db = new DB();
db.pInit();

export class Model {
    /**
     * format object for public
     */
    id: UUID

    constructor(id?: UUID) {
        this.id = id || Model.generateUUID()
    }

    static generateUUID() : UUID {
        let uuid = "";

        for (let i = 0; i < 32; i++) {
            let random = Math.random() * 16 | 0;

            if (i == 8 || i == 12 || i == 16 || i == 20) {
                uuid += "-"
            }
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }

        return uuid;
    }

    static pFindById(id: UUID) {
        return db.pGetCollection(this.name)
            .then(collection => collection.findOne({
                id: id
            }))
            .then(res => {
                return this.upgrade(res);
            });
    }

    static pFindAll(query: Object) {
        return db.pGetCollection(this.name)
            .then(collection => collection.find(query).limit(20).toArray())
            .then(items => {
                return items.map(item => this.upgrade(item));
            });
    }

    static pUpdateById(id: UUID, data: Object) {
        return db.pGetCollection(this.name)
            .then(collection => collection.findOneAndUpdate({
                id: id
            }, data, {
                upsert: true
            }))
            .then(res => this.upgrade(res.value));
    }

    pSave() {
        let data = this.downgrade();
        return Model.pUpdateById.call(this.constructor, this.id, data);
    }

    downgrade() : Object {
        let data = {}
        Object.assign(data, this);
        return data;
    }

    static upgrade(data: Object) : Model {
        let instance = new this();
        Object.assign(instance, data);
        return instance;
    }
}

export type UUID = string;