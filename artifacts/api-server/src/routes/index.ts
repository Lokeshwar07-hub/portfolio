import { Router, type IRouter } from "express";
import healthRouter from "./health";
import githubRouter from "./github";
import leetcodeRouter from "./leetcode";

const router: IRouter = Router();

router.use(healthRouter);
router.use(githubRouter);
router.use(leetcodeRouter);

export default router;
