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
    model_name: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    model_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    }
  }, 
  {
    underscored: true
  });

  comment.associate = function(models) {    
    comment.belongsTo(models.user, {
      foreignKey: 'user_id'
    });
  };

  return comment;
};