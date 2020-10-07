const mongoose = require("mongoose")

const connectDb = async(mongoUri) => {
    try {
        const conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });


        console.log(`MongoDB Connected: ${conn.connection.host}`)
        

    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}



module.exports = connectDb
