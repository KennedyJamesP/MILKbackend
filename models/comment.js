'use strict';

module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    text: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    model_name: DataTypes.STRING,
    model_id: DataTypes.INTEGER
  }, 
  {
    underscored: true
  });

  comment.associate = function(models) {
    // associations can be defined here
  };

  return comment;
};