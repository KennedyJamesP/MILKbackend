'use strict';

module.exports = (sequelize, DataTypes) => {
  const like = sequelize.define('like', {
    user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    model_name: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    model_id: { 
      type: DataTypes.STRING,
      allowNull: false, 
    }
  }, 
  {
    underscored: true
  });

  like.associate = function(models) {
    // associations can be defined here
  };

  return like;
};