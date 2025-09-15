require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const { MONGO_URI, JWT_SECRET, PORT } = process.env;

// Basic validations
if (!JWT_SECRET || JWT_SECRET === 'your_jwt_secret') {
  console.error('\nERROR: JWT_SECRET is not set or is still the placeholder in backend/.env.\nPlease set JWT_SECRET in backend/.env to a strong secret.\n');
  // don't exit here; JWT is only required for auth operations, but warn loudly
}

if (!MONGO_URI || MONGO_URI === 'your_mongodb_connection_string') {
  console.error('\nERROR: MONGO_URI is not set or is invalid in backend/.env.\nSet MONGO_URI to a valid MongoDB connection string that starts with "mongodb://" or "mongodb+srv://".\nExample: mongodb+srv://user:password@cluster0.mongodb.net/mydb?retryWrites=true&w=majority\n');
  process.exit(1);
}

if (!/^mongodb(\+srv)?:\/\//.test(MONGO_URI)) {
  console.error('\nERROR: MONGO_URI does not appear to be a valid MongoDB URI. It must start with "mongodb://" or "mongodb+srv://".\nPlease update backend/.env accordingly.\n');
  process.exit(1);
}

// Connect to MongoDB, then start the server
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');

  // Routes - only mount after DB connection
  app.get('/', (req, res) => {
    res.send('MERN To-Do Backend Running');
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/tasks', require('./routes/tasks'));

  const listenPort = PORT || 5000;
  app.listen(listenPort, () => console.log(`Server running on port ${listenPort}`));

}).catch(err => {
  console.error('\nFailed to connect to MongoDB. Error:');
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
