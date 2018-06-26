'use strict';

module.exports = (sequelize, DataTypes) => {
  var post = sequelize.define('post', {
    id: DataTypes.INTEGER,
    location: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    statue_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  
  return post;
};
