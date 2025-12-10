import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { upsertIntegration, createRule, listRules, updateRule, deleteRule, testSend } from "../api/notifications/notification.controller";

const router = Router();
router.use(authenticate);

router.post("/integrations", upsertIntegration);
router.post("/rules", createRule);
router.get("/rules", listRules);
router.put("/rules/:id", updateRule);
router.delete("/rules/:id", deleteRule);

router.post("/test", testSend);

export default router;
