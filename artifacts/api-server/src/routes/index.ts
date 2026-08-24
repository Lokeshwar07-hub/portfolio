import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import githubRouter from "./github.js";
import leetcodeRouter from "./leetcode.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(githubRouter);
router.use(leetcodeRouter);

export default router;
