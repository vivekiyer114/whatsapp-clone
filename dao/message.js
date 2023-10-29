
import { ObjectId } from 'mongodb';
import { DATABASE_NAME, DATABASE_URL } from '../constants.js';
import Database from '../database.js';

class MessageDao{
    constructor(){
        const db = new Database(DATABASE_URL[global.env], DATABASE_NAME);
        this.dbInstance = db;
    }

    async createMessage(content) {
        try {
            await this.dbInstance.connect(); 
            const result = await this.dbInstance.getCollection("messages").insertOne({content});
            return result.insertedId; 
        } catch (err) {
            throw err;
        }finally{
            this.dbInstance.disconnect();
        }
    }
}

export default MessageDao;