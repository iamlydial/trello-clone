import express from "express";
import {createServer} from 'http';
import { Server } from "socket.io";
import mongoose, { Mongoose, mongo } from "mongoose";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

//express
app.get('/', (req, res) => {
    res.send("API is up");
})

//socket io 
io.on('connection', ()=>{
    console.log("connect");
})

//mongoose
mongoose.connect('mongodb://localhost:27017/trello-clone').then(()=>{
    console.log('connected to mongo db')
    //http to start server 
    httpServer.listen(4001, ()=>{
        console.log('API is listening on port 4001');
    })
})




