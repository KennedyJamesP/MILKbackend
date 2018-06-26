'use strict';

module.exports = (sequelize, DataTypes) => {
  var comment = sequelize.define('comment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    text: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    model_name: DataTypes.STRING,
    model_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return comment;
};