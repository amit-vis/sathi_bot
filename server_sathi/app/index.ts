import express from "express";
import {config} from "dotenv";
import routes from "./routes/index.js"
import { callbackUrl } from "./service/googleMail.js";
import cors from "cors";
import helmet from "helmet";

config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin:["https://annmarie-nonextractable-mathematically.ngrok-free.dev", "http://localhost:3000"],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true
}));

app.use(helmet());
app.use("/app", routes);
app.get("/auth/google/callback", callbackUrl)
app.listen(port, (error: any)=>{
    if(error){
        throw error
    }else{
        console.log("app is listning", port)
    }
})