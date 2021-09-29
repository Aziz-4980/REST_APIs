const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//importing routes
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');
const cors = require('cors');

dotenv.config();


//connect to DB
mongoose.connect(process.env.DB_CONNECT,
()=> console.log('Connected to DB'));

//Middleware
app.use(express.json());
app.use(cors());


//routes middleware
app.use('/api/user', authRoute);
app.use('/api/posts', postsRoute);



app.listen(8000, ()=> console.log('server is running!'));

