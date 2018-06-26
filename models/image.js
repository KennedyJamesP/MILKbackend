'use strict';

module.exports = (sequelize, DataTypes) => {
  var image = sequelize.define('image', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    height: DataTypes.INTEGER,
    width: DataTypes.INTEGER,
    url: DataTypes.STRING,
    post_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return image;
};