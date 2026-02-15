const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getSummary,
  generateRecurringTransactions,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', addTransaction);
router.post('/generate-recurring', generateRecurringTransactions);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);
router.get('/summary', getSummary);

module.exports = router;
