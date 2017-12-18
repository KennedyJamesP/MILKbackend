'use strict';
module.exports = (sequelize, DataTypes) => {
  var comments = sequelize.define('comments', {
    pictureID: DataTypes.INTEGER,
    userID: DataTypes.INTEGER,
    comment: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return comments;
};