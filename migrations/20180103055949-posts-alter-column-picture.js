'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
			return queryInterface.changeColumn(
				'posts', 'picture', {
					type: Sequelize.INTEGER,
					references: {
						model: 'pictures',
						key: 'id',
					}
				}).then( () => {
					return queryInterface.renameColumn(
					'posts', 'picture', 'pictureID');
				});
	},

	down: (queryInterface, Sequelize) => {
			return queryInterface.renameColumn(
				'posts', 'pictureID', 'picture'
			).then( () => {
				return queryInterface.changeColumn(
					'posts', 'picture', {
						type: Sequelize.BLOB
					}
				});S
	}
};
