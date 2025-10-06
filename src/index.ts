import path from "path";
import express from "express";
import config from "./config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
