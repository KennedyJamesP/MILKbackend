'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.renameTable('pictures', 'posts');

	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.renameTable('posts', 'pictures');
	}
};
