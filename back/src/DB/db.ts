import mongoose from "mongoose";

mongoose.set("strictQuery", true);
const connectToMongo = () => {
  mongoose
    .connect("mongodb://admin:password@localhost:27017/drive?authSource=admin")
    .then((obj) => {
      console.log("--- Successfully connected with data base ");
    })
    .catch((error) => {
      console.error("Invalid creadential ", error);
    });
};

export default connectToMongo;