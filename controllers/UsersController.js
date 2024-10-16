import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const db = dbClient.client.db(dbClient.dbName);
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const result = await usersCollection.insertOne({ email, password: hashedPassword });
      const newUser = result.ops[0];

      return res.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (error) {
      console.error('Error in postNew:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const db = dbClient.client.db(dbClient.dbName);
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
