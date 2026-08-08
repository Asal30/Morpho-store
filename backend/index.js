import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

const database = process.env.DATABASE_URL;

app.use((req, res, next) => {

    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token != null) {
        jwt.verify(token, process.env.JWT_KEY, (err, decded) => {
            if(decded != null){
                req.user = decded;
                next();
            }else{
                res.status(401).json({
                    message : "Invalid token"
                })
            }
        });
    }else{
        next();
    }
});

mongoose.connect(database).then(
    ()=>{
        console.log("Connected to the Database")
    }
).catch(
    ()=>{
        console.log("Couldn't connected to the Database")
    }
)

app.listen(4200,(req,res) =>{
    console.log("Server is running on http://localhost:4200/");
});