const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

function createCollection(client, collectionName) {
	// Build the commands Collection for easy access
	client[collectionName] = new Collection();
	const collectionPath = path.join(path.dirname(__dirname), collectionName);
	const collectionFiles = fs.readdirSync(collectionPath).filter(file => file.endsWith('.js') && !file.endsWith('test.js'));

	for (const file of collectionFiles) {
		const filePath = path.join(collectionPath, file);
		const collectionItem = require(filePath);
		// Set a new item in the Collection with the key as the item name and the value as the exported module
		if ('data' in collectionItem && 'execute' in collectionItem) {
			client[collectionName].set(collectionItem.data.name, collectionItem);
		} else {
			console.log(`[WARNING] The ${collectionName} at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

module.exports = {
	createCollection,
};