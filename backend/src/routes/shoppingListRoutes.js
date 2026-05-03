const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const shoppingListController = require('../controllers/shoppingListController');

// All routes require authentication
router.use(auth);

// POST /api/shopping-lists/generate/:weekStartDate - Generate shopping list from meal plan
router.post('/generate/:weekStartDate', shoppingListController.generateShoppingList);

// GET /api/shopping-lists/week/:weekStartDate - Get shopping list for week
router.get('/week/:weekStartDate', shoppingListController.getShoppingListForWeek);

// PUT /api/shopping-lists/:id/toggle - Toggle item checked status
router.put('/:id/toggle', shoppingListController.toggleItemChecked);

// PUT /api/shopping-lists/:id - Update shopping list item
router.put('/:id', shoppingListController.updateShoppingListItem);

// POST /api/shopping-lists - Add manual item
router.post('/', shoppingListController.addManualItem);

// DELETE /api/shopping-lists/:id - Delete single item
router.delete('/:id', shoppingListController.deleteItem);

// DELETE /api/shopping-lists/week/:weekStartDate/checked - Clear checked items
router.delete('/week/:weekStartDate/checked', shoppingListController.clearCheckedItems);

// DELETE /api/shopping-lists/week/:weekStartDate - Delete entire list
router.delete('/week/:weekStartDate', shoppingListController.deleteShoppingList);

module.exports = router;
