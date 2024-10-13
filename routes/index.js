import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

// maps to the controller methods

const router = Router();

// Define the routes and associate them with the corresponding controller methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

export default router;
