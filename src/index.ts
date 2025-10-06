import path from "path";
import express from "express";
import config from "./config";
import { initializeMiddlewares } from "./middlewares";
import { initializeRouters } from "./routers";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

initializeMiddlewares(app);
initializeRouters(app);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
