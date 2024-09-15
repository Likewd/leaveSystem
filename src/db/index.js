import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connnectDB = async () => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGEDB_URI}/${DB_NAME}`)

        console.log(`\n MongoDB connected !! DB HOst ${connectioninstance.connection.host} `)


    } catch (error) {
        console.log("MONGO Connection ERROR", error)
        process.exit(1)
    }
}


export default connnectDB;