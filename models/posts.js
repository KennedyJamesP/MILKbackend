'use strict';
module.exports = (sequelize, DataTypes) => {
  var pictures = sequelize.define('posts', {
    pictureID: DataTypes.INTEGER,
    location: DataTypes.TEXT,
    userID: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return pictures;
};