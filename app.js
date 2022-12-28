const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const userRouter = require('./routes/userRoutes')
const sharedAccountRouter = require('./routes/houseAccountRoutes');
const transactionRouter = require('./routes/transactionRoutes');

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

app.use('/user', userRouter);
app.use('/sharedAccount', sharedAccountRouter)<
app.use('/transactions', transactionRouter)

// START SERVER
app.listen('3000', console.log('SERVER STARTED'))
