import { MongoClient } from "mongodb";

class Database {
  constructor(url, dbName) {
    this.url = url;
    this.dbName = dbName;
    this.client = new MongoClient(this.url);
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('Connected to the database.');
    } catch (err) {
      console.error('Error connecting to the database:', err);
    }
  }

  disconnect() {
    this.client.close();
    console.log('Disconnected from the database.');
  }

  getCollection(collectionName) {
    return this.db.collection(collectionName);
  }

  async createDocument(collectionName, data) {
    const collection = this.getCollection(collectionName);
    const result = await collection.insertOne(data);
    return result.ops[0];
  }

  async readDocuments(collectionName, query = {}) {
    const collection = this.getCollection(collectionName);
    return collection.find(query).toArray();
  }

  async updateDocument(collectionName, query, updateData) {
    const collection = this.getCollection(collectionName);
    const result = await collection.findOneAndUpdate(query, { $set: updateData }, { returnOriginal: false });
    return result.value;
  }

  async deleteDocument(collectionName, query) {
    const collection = this.getCollection(collectionName);
    const result = await collection.findOneAndDelete(query);
    return result.value;
  }
}

export default Database;
