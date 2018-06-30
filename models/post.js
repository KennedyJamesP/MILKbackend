'use strict';

module.exports = (sequelize, DataTypes) => {
  const post = sequelize.define('post', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    location: DataTypes.STRING
  }, 
  {
    underscored: true
  });

  post.associate = function(models) {
    // associations can be defined here
  };
  
  return post;
};
