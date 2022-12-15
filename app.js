const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const userRouter = require('./routes/userRoutes')

// APP SETUP
const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json())

// MONGOOSE SETUP
mongoose.set('strictQuery', true)
mongoose.connect('mongodb+srv://money-control:sonicrangers2022@cluster0.02npzs8.mongodb.net/?retryWrites=true&w=majority',
console.log('DB ONLINE'));

// ROUTES

app.use('/user', userRouter)

// START SERVER
app.listen('3000', console.log('SERVER STARTED'))
