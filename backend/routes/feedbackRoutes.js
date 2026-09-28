import express from 'express';
import { sendFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', sendFeedback);

export default router;
