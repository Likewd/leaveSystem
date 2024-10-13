// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured! Shutting down...');
    process.exit(1);
 })
import connectDB from "./db/index.js";
import app from './app.js'

connectDB().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`server is running on !!! ${process.env.PORT || 3000}`)
    })
}).catch((err) => {
    console.log("MONGO db connection failed !!!", err)
})


// connectDB()
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured! Shutting down...');
 
    server.close(() => {
     process.exit(1);
    })
 })
