import * as express from "express";
import * as cors from "cors";
import { config } from "dotenv";
import routes from "./routes";
import { connectDB } from "./db";

config();

const app = express();

app.use(cors()); 
app.use(express.json());
app.use("/api", routes);

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});