import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Handle errors from the Redis client
    this.client.on('error', (err) => {
      console.error(`Redis client error: ${err}`);
    });

    // Promisify Redis commands for async/await usage
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Check if Redis client is connected
  isAlive() {
    return this.client.connected;
  }

  // Asynchronously get a value by key from Redis
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  // Asynchronously set a key-value pair with an expiration time in Redis
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  // Asynchronously delete a value by key from Redis
  async del(key) {
    await this.delAsync(key);
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
