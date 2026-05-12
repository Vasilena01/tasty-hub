import express, { Router } from 'express';
import {
  generateShoppingList,
  getShoppingListForWeek,
  toggleItemChecked,
  updateShoppingListItem,
  addManualItem,
  deleteItem,
  clearCheckedItems,
  deleteShoppingList
} from '../controllers/shoppingListController';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post('/generate/:weekStartDate', verifyToken, generateShoppingList);
router.get('/week/:weekStartDate', verifyToken, getShoppingListForWeek);
router.put('/:id/toggle', verifyToken, toggleItemChecked);
router.put('/:id', verifyToken, updateShoppingListItem);
router.post('/', verifyToken, addManualItem);
router.delete('/:id', verifyToken, deleteItem);
router.delete('/week/:weekStartDate/checked', verifyToken, clearCheckedItems);
router.delete('/week/:weekStartDate', verifyToken, deleteShoppingList);

export default router;
