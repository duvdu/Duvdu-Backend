import { dbConnection } from "@duvdu-v1/duvdu";
import { app } from "./app";


const start = async () => {
    
    //connect to database
    await dbConnection("mongodb://localhost:27017");

    app.listen(3000, () => {
        console.log("app listen in port 3000");
    });
};

start();