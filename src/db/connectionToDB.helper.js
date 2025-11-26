import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectToDB = async () => {
    try{
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("Connected to the database successfully,", conn.connection.host);

    }catch(err){
        console.error("Error connecting to the database", err);
        process.exit(1)
    }
}
export default connectToDB;