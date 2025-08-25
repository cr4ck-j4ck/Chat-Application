import express from "express";
import dotenv from "dotenv"
dotenv.config();

const Port = process.env.PORT || 3000;
const app = express();



app.listen(Port,()=>{
    console.log(`Started listening on Port ${Port}`)
});