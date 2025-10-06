import { Router } from "express";
import * as authController from "../controllers/auth-controller";

const router = Router();

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.post("/logout", authController.postLogout);

export default router;
