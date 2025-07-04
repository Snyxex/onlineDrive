import mongoose from "mongoose";
import { getLogger } from "../common/logs";

const logger = getLogger("DBConnection");

mongoose.set("strictQuery", true);
const connectToMongo = () => {
  mongoose
    .connect("mongodb://admin:password@localhost:27017/drive?authSource=admin")
    .then((obj) => {
      logger.info("Successfully connected with data base ");
    })
    .catch((error) => {
      logger.error("Invalid creadential ", error);
    });
};

export default connectToMongo;