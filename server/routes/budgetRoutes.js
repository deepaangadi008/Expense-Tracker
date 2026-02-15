const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCurrentBudget, upsertCurrentBudget } = require('../controllers/budgetController');

router.use(protect);
router.get('/current', getCurrentBudget);
router.put('/current', upsertCurrentBudget);

module.exports = router;
