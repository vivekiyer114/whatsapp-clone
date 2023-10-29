
import { ObjectId } from 'mongodb';
import { DATABASE_NAME, DATABASE_URL } from '../constants.js';
import Database from '../database.js';


class GroupDao {
    constructor(){
        const db = new Database(DATABASE_URL[global.env], DATABASE_NAME);
        this.dbInstance = db;
    }

    async findByUserName(username) {
        try{
            await this.dbInstance.connect(); 
            const user = await this.dbInstance.getCollection('users').findOne({ username });
            if (!user) {
                throw new Error({status: 401, message: "Invalid username or password"});
            }
            return user;
        }catch(err){
            throw err;
        }finally{
            this.dbInstance.disconnect();
        }
    }

    async createGroup(data) {
        try{
            await this.dbInstance.connect(); 
            return await this.dbInstance.getCollection('groups').insertOne(data);
        }catch(err){
            throw err;
        }finally{
            this.dbInstance.disconnect();
        }
    }

    async findGroupById(groupId) {
        try {
            await this.dbInstance.connect();

            const group = await this.dbInstance.getCollection('groups').findOne({ _id: new ObjectId(groupId) });
    
            if (!group) {
                throw new Error({ status: 404, message: 'Group not found' });
            }
    
            return group;
        } catch (err) {
            throw err;
        } finally {
            this.dbInstance.disconnect();
        }
    }
    
    async updateGroupById(groupId, updateData) {
        try {
            await this.dbInstance.connect();
    
            const filter = { _id: new ObjectId(groupId) };
            const update = { $set: updateData }; // You can update specific fields in the group using the $set operator
    
            const result = await this.dbInstance.getCollection('groups').updateOne(filter, update);
    
            if (result.modifiedCount === 0) {
                throw new Error({ status: 404, message: 'Group not found' });
            }
    
            return result;
        } catch (err) {
            throw err;
        } finally {
            this.dbInstance.disconnect();
        }
    }
    
}


export default GroupDao;