import connectToDB from './db/connectionToDB.helper.js';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({path: './.env'});

connectToDB().then(()=>{
    app.listen(process.env.PORT|| 8080, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
    app.on('error', (err)=>{
        console.error("Error starting the server", err);
    });
}).catch((err)=>{
    console.error("Failed to connect to the database", err);
    process.exit(1);
});


/*;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log("Connected to the database successfully");

    }catch(err){
        console.error("Error connecting to the database", err);
        throw err;
    }
})();*/