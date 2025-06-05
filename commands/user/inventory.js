const InventoryService = require('../../services/inventoryService');

module.exports = {
    name: 'inventory',
    description: 'View your collected prizes and credits',
    execute: async (message) => {
        await InventoryService.showInventory(message);
    }
};