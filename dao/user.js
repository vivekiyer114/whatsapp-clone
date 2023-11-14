
import { DATABASE_NAME, DATABASE_URL } from '../constants.js';
import Database from '../database.js';


class UserDao {
    constructor() {
        const db = new Database(DATABASE_URL[global.env], DATABASE_NAME);
        this.dbInstance = db;
    }

    async findByUserName(username) {
        try {
            await this.dbInstance.connect();
            const user = await this.dbInstance.getCollection('users').findOne({ username });
            if (!user) {
                throw new Error("Invalid username or password");
            }
            return user;
        } catch (err) {
            throw err;
        } finally {
            this.dbInstance.disconnect();
        }
    }

    async createUser(data) {
        try {
            await this.dbInstance.connect();
            const user = await this.dbInstance.getCollection('users').insertOne(data);
            return user;
        } catch (err) {
            throw err;
        } finally {
            this.dbInstance.disconnect();
        }
    }

    async updateUserByUserName(username, data) {
        try {
            await this.dbInstance.connect();
            const user = await this.dbInstance.getCollection('users').updateOne({ username }, { $set: { ...data } });
            return user;
        } catch (err) {
            throw err;
        } finally {
            this.dbInstance.disconnect();
        }
    }

    async getGroupData(username) {
        try {
            await this.dbInstance.connect();
            const pipeline = [
                { $match: { username:'vivek' } }, { $unwind: "$groups" }, 
                { $lookup: { from: 'groups', as: 'groups', localField: 'groups', foreignField: "_id" } }, 
                { $unwind: "$groups" }, 
                { $unwind: { path: "$groups.messages", preserveNullAndEmptyArrays: true } }, 
                { $lookup: { from: "messages", localField: "groups.messages.message_id", as: "messages", foreignField: "_id" } },
                { $unwind: "$messages" },
                { $lookup: { from: "users", localField: "groups.messages.user_id", foreignField: "_id", as: "messageUser" } },
                {
                    $group: {
                        _id: "$groups._id",
                        name: { $first: "$groups.name" },
                        messages: {
                            $push: {
                                content: "$messages.content",
                                user_name: "$messageUser.name"
                            }
                        }
                    }
                }
            ];
            

            return (await this.dbInstance.getCollection('users').aggregate(pipeline).toArray());
        } catch (err) {
            throw err;
        } finally {
            this.dbInstance.disconnect();
        }
    }
}


export default UserDao;