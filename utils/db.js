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

    // Connect to the MongoDB server
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
    } catch (error) {
      console.error(`MongoDB connection error: ${error}`);
      this.connected = false;
    }
  }

  isAlive() {
    return this.connected;
  }
  async nbUsers() {
    const db = this.client.db();
    const usersCollection = db.collection('users');
    return await usersCollection.countDocuments();
  }

  async nbFiles() {
    if (!this.connected) return 0;
    const database = this.client.db();
    const filesCollection = database.collection('files');
    const res = await filesCollection.countDocuments();
    return res;
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
