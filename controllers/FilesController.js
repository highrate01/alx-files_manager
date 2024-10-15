import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    const db = dbClient.client.db(dbClient.dbName);
    const filesCollection = db.collection('files');

    if (parentId !== '0') {
      const parentFile = await filesCollection.findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const newFile = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? 0 : new ObjectId(parentId),
    };

    if (type === 'folder') {
      const result = await filesCollection.insertOne(newFile);
      newFile._id = result.insertedId;
      return res.status(201).json(newFile);
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filename = uuidv4();
    const localPath = path.join(folderPath, filename);

    try {
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
    } catch (error) {
      console.error('Error writing file:', error);
      return res.status(500).json({ error: 'Unable to save file' });
    }

    newFile.localPath = localPath;

    const result = await filesCollection.insertOne(newFile);
    newFile._id = result.insertedId;

    return res.status(201).json(newFile);
  }
}

export default FilesController;
