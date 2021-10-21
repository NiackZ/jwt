import dotenv from 'dotenv'
import express from "express";
import mongoose from 'mongoose'
import Cors from 'cors'
import cookieParser from "cookie-parser";
import router from './routes/index.js';
import errorMW from './middleware/error-middleware.js';

dotenv.config()

const PORT = process.env.PORT || 5000

async function startApp()
{
	try {
		const app = express()
		app.listen(PORT,()=>{
			console.log(`server started on port ${PORT}`.toUpperCase());
		})

		app.use(Cors({
			credentials: true,
			origin: process.env.CLIENT_URL
		}))

		app.use(express.json())
		app.use(cookieParser())
		
		app.use('/api', router)
		app.use(errorMW)
		
		await mongoose.connect(process.env.MONGODB)
	} catch (error) {
		console.log(error);
	}
}
startApp()