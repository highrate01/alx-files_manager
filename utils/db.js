import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.uri = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.connected = false;
    this.dbName = database;

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
    const res = await db.collection('users').countDocuments();
    return res;
  }

  async nbFiles() {
    if (!this.connected) return 0;
    const db = this.client.db(this.dbName);
    const resFile = await db.collection('files').countDocuments();
    return resFile;
  }
}

const dbClient = new DBClient();
export default dbClient;
