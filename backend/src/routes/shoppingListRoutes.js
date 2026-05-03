const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const shoppingListController = require('../controllers/shoppingListController');

// POST /api/shopping-lists/generate/:weekStartDate - Generate shopping list from meal plan
router.post('/generate/:weekStartDate', verifyToken, shoppingListController.generateShoppingList);

// GET /api/shopping-lists/week/:weekStartDate - Get shopping list for week
router.get('/week/:weekStartDate', verifyToken, shoppingListController.getShoppingListForWeek);

// PUT /api/shopping-lists/:id/toggle - Toggle item checked status
router.put('/:id/toggle', verifyToken, shoppingListController.toggleItemChecked);

// PUT /api/shopping-lists/:id - Update shopping list item
router.put('/:id', verifyToken, shoppingListController.updateShoppingListItem);

// POST /api/shopping-lists - Add manual item
router.post('/', verifyToken, shoppingListController.addManualItem);

// DELETE /api/shopping-lists/:id - Delete single item
router.delete('/:id', verifyToken, shoppingListController.deleteItem);

// DELETE /api/shopping-lists/week/:weekStartDate/checked - Clear checked items
router.delete('/week/:weekStartDate/checked', verifyToken, shoppingListController.clearCheckedItems);

// DELETE /api/shopping-lists/week/:weekStartDate - Delete entire list
router.delete('/week/:weekStartDate', verifyToken, shoppingListController.deleteShoppingList);

module.exports = router;
