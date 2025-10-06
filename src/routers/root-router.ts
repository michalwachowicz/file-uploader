import { Router } from "express";
import { getIndex } from "../controllers/root-controller";

const router = Router();

router.get("/", getIndex);

export default router;
