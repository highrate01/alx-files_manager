import express from 'express';
import routes from './routes/index';

// creates express app
const app = express();

// Set the port from the environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Use the imported routes
app.use('/', routes);

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
