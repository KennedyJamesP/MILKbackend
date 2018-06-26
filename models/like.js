'use strict';

module.exports = (sequelize, DataTypes) => {
  var like = sequelize.define('like', {
    user_id: DataTypes.INTEGER,
    model_name: DataTypes.STRING,
    model_id: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return like;
};