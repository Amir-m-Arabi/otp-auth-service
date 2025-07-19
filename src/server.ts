import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes";
import swaggerFile from "../swagger-output.json";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/", routes);

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerFile);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
