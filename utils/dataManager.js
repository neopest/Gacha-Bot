const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class DataManager {
    static saveData(data) {
        try {
            fs.writeFileSync(config.paths.data, JSON.stringify(data, null, 4), 'utf8');
            console.log('Data saved successfully.');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    static loadData() {
        try {
            if (fs.existsSync(config.paths.data)) {
                const rawData = fs.readFileSync(config.paths.data, 'utf8');
                return JSON.parse(rawData);
            }
            return { users: {} };
        } catch (error) {
            console.error('Error loading data:', error);
            return { users: {} };
        }
    }

    static loadItems() {
        try {
            const data = fs.readFileSync(config.paths.items, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading items:', error);
            return { items: [] };
        }
    }

    static saveItems(items) {
        try {
            fs.writeFileSync(config.paths.items, JSON.stringify(items, null, 2), 'utf8');
            console.log('Items saved successfully.');
        } catch (error) {
            console.error('Error saving items:', error);
        }
    }

    static initializeUser(userId) {
        const data = this.loadData();
        if (!data.users[userId]) {
            data.users[userId] = { credits: 1, inventory: [] };
            this.saveData(data);
        }
        return data.users[userId];
    }
}

module.exports = DataManager;