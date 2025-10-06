import { Router } from "express";
import { authMiddleware } from "../middlewares";
import { authController } from "../controllers";

const router = Router();

router.get("/login", authMiddleware.checkGuest, authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/register", authMiddleware.checkGuest, authController.getRegister);
router.post("/register", authController.postRegister);

router.post("/logout", authController.postLogout);

export default router;
