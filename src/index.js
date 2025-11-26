import connectToDB from './db/connectionToDB.helper.js';
import dotenv from 'dotenv';
dotenv.config({path: './.env'});

connectToDB();


/*;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("Connected to the database successfully");

    }catch(err){
        console.error("Error connecting to the database", err);
        throw err;
    }
})();*/