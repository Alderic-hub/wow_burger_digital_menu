import { Router, type IRouter } from "express";
import healthRouter from "./health";
import emailRouter from "./email";
import otpRouter from "./otp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(emailRouter);
router.use(otpRouter);

export default router;
