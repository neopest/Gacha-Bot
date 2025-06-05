const DataManager = require('../utils/dataManager');
const { RARITY_PROBABILITIES, SUPER_SPIN_PROBABILITIES } = require('../utils/constants');

class GachaService {
    static getRandomCharacter() {
        const items = DataManager.loadItems();
        
        if (!items || !Array.isArray(items.items)) {
            console.error("Error: 'items' data is missing or invalid in items.json.");
            return null;
        }

        const availableCharacters = items.items.filter(character => character.stock > 0);
        if (availableCharacters.length === 0) {
            console.error("No characters available with stock > 0.");
            return null;
        }

        return this._selectCharacterByRarity(availableCharacters, RARITY_PROBABILITIES);
    }

    static getRareOrHigherCharacter() {
        const items = DataManager.loadItems();
        
        if (!items || !Array.isArray(items.items)) {
            console.error("Error: 'items' data is missing or invalid in items.json.");
            return null;
        }

        const availableCharacters = items.items.filter(character => 
            character.stock > 0 && ['rare', 'legendary'].includes(character.rarity.toLowerCase())
        );
        
        if (availableCharacters.length === 0) {
            console.warn("No characters available in rare or higher rarities.");
            return null;
        }

        return this._selectCharacterByRarity(availableCharacters, SUPER_SPIN_PROBABILITIES);
    }

    static _selectCharacterByRarity(characters, probabilities) {
        const charactersByRarity = this._groupByRarity(characters);
        const selectedRarity = this._selectRarity(probabilities);
        
        let currentRarity = selectedRarity;
        while (currentRarity) {
            const charactersInRarity = charactersByRarity[currentRarity];
            if (charactersInRarity && charactersInRarity.length > 0) {
                // Use weighted selection based on stock numbers
                return this._selectCharacterByStock(charactersInRarity);
            }
            currentRarity = this._downgradeRarity(currentRarity);
        }
        
        return null;
    }

    static _selectCharacterByStock(characters) {
        // Calculate total weight (sum of all stock numbers)
        const totalWeight = characters.reduce((sum, character) => sum + character.stock, 0);
        
        if (totalWeight === 0) {
            return null; // No stock available
        }
        
        // Generate random number between 0 and totalWeight
        let randomWeight = Math.random() * totalWeight;
        
        // Find the character that corresponds to this weight
        for (const character of characters) {
            randomWeight -= character.stock;
            if (randomWeight <= 0) {
                return character;
            }
        }
        
        // Fallback (should rarely happen)
        return characters[characters.length - 1];
    }

    static _groupByRarity(characters) {
        const grouped = { common: [], uncommon: [], rare: [], legendary: [] };
        
        characters.forEach(character => {
            const rarity = character.rarity.toLowerCase();
            if (grouped[rarity]) {
                grouped[rarity].push(character);
            }
        });
        
        return grouped;
    }

    static _selectRarity(probabilities) {
        const random = Math.random();
        let cumulative = 0;
        
        for (const [rarity, probability] of Object.entries(probabilities)) {
            cumulative += probability;
            if (random < cumulative) {
                return rarity;
            }
        }
        
        return Object.keys(probabilities)[0];
    }

    static _downgradeRarity(rarity) {
        const downgrades = {
            'legendary': 'rare',
            'rare': 'uncommon',
            'uncommon': 'common',
            'common': null
        };
        return downgrades[rarity];
    }

    // Additional utility method to get stock-based probability info
    static getStockBasedProbabilities() {
        const items = DataManager.loadItems();
        
        if (!items || !Array.isArray(items.items)) {
            return null;
        }

        const availableCharacters = items.items.filter(character => character.stock > 0);
        const charactersByRarity = this._groupByRarity(availableCharacters);
        
        const probabilities = {};
        
        for (const [rarity, characters] of Object.entries(charactersByRarity)) {
            if (characters.length > 0) {
                const totalStockInRarity = characters.reduce((sum, char) => sum + char.stock, 0);
                probabilities[rarity] = {};
                
                characters.forEach(character => {
                    const stockPercentage = (character.stock / totalStockInRarity) * 100;
                    probabilities[rarity][character.name] = {
                        stock: character.stock,
                        percentage: stockPercentage.toFixed(2) + '%'
                    };
                });
            }
        }
        
        return probabilities;
    }
}

module.exports = GachaService;
