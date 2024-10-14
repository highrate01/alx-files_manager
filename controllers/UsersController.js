import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    try {
      const existingUser = await dbClient.getUser({ email });
      if (existingUser) {
        return response.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const newUser = await dbClient.createUser({ email, password: hashedPassword });

      return response.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (error) {
      console.error('Error in postNew:', error);
      return response.status(500).json({ error: 'Server error' });
    }
  }

  static async getMe(request, response) {
    try {
      const userToken = request.header('X-Token');
      const authKey = `auth_${userToken}`;
      const userId = await redisClient.get(authKey);

      if (!userId) {
        return response.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.getUser({ _id: new ObjectId(userId) });
      if (!user) {
        return response.status(401).json({ error: 'Unauthorized' });
      }

      return response.json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error in getMe:', error);
      return response.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;
