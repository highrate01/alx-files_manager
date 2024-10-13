import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// contains the logic for both endpoints, /status and /stats

class AppController {
  // Handler for GET /status
  static getStatus(req, res) {
    // Check if Redis and DB are alive
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    // Send the response with the status
    return res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  // Handler for GET /stats
  static async getStats(req, res) {
    // Get the number of users and files
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    // Send the response with the stats
    return res.status(200).json({ users: usersCount, files: filesCount });
  }
}

export default AppController;
