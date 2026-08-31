import "dotenv/config"
import express from "express";
import routes from "./routes/index.js"
import { callbackUrl } from "./service/googleMail.js";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";


const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin:["https://annmarie-nonextractable-mathematically.ngrok-free.dev", 
        "http://localhost:3000",
        "https://rewrite-skeleton-petri.ngrok-free.dev",
    "https://stability-bracelets-better-understand.trycloudflare.com"],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true
}));

app.use(cookieParser(process.env.SECRET_KEY))

app.use(helmet());
export const activityLoggerMiddleware = (req: any, res: any, next: any) => {
  // Jab response bheja ja chuka ho, tab log karenge taaki status code bhi mil jaye
  res.on('finish', () => {
    // Agar GET request ko ignore karna hai (taaki logs na bhare), toh yahan condition laga sakte ho
    // if (req.method === 'GET') return next();

    const userId = req.user ? req.user.id : 'Guest'; // req.user aapke auth middleware se aayega
    
    logger.info('API Activity', {
      type: 'API_CALL',
      userId: userId,
      method: req.method, // GET, POST, PUT, DELETE
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
    });
  });
  
  next();
};
app.use("/app", routes);
app.get("/auth/google/callback", callbackUrl)
app.listen(port, (error: any)=>{
    if(error){
        throw error
    }else{
        console.log("app is listning", port)
    }
})