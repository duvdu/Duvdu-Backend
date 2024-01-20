import { dbConnection } from "@duvdu-v1/duvdu";
import { app } from "./app";


const start = async () => {

    if (!process.env.MONGO_URI) {
        throw new Error("mongo uri must be defined");
    };
    
    //connect to database
    await dbConnection(process.env.MONGO_URI);

    app.listen(3000, () => {
        console.log("app listen in port 3000");
    });
};

start();