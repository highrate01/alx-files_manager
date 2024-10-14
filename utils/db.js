import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    // Construct the MongoDB URI
    this.uri = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(this.uri, { useUnifiedTopology: true });
    this.connected = false;
    this.dbName = database;
    // Connect to the MongoDB server
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error(`MongoDB connection error: ${error}`);
      this.connected = false;
    }
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    if (!this.connected) return 0;
    const db = this.client.db(this.dbName);
    const usersCollection = db.collection('users');
    const res = await usersCollection.countDocuments();
    return res;
  }

  async nbFiles() {
    if (!this.connected) return 0;
    const db = this.client.db(this.dbName);
    const filesCollection = db.collection('files');
    const resFile = await filesCollection.countDocuments();
    return resFile;
  }

  async getUser(query) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    try {
      const db = this.client.db(this.dbName);
      const user = await db.collection('users').findOne(query);
      if (user) {
        const { password, ...safeUser } = user;
        return safeUser;
      }
      return null;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async createUser(userData) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    try {
      const db = this.client.db(this.dbName);
      const result = await db.collection('users').insertOne(userData);
      const newUser = await this.getUser({ _id: result.insertedId });
      return newUser;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
