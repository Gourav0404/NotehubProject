import mongoose from "mongoose";

const connect_db = async()=>{
    try {
         const connection_instance = await mongoose.connect(process.env.MONGO_URI);
         console.log("MONGODB connection successfull!!!");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export {connect_db};