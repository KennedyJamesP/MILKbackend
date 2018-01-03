'use strict';
module.exports = (sequelize, DataTypes) => {
  var pictures = sequelize.define('pictures', {
    picture: DataTypes.BLOB
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return pictures;
};