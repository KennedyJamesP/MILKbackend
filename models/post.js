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
    caption: DataTypes.STRING,
    location: DataTypes.STRING
  }, 
  {
    underscored: true
  });

  post.associate = function(models) {
    const { comment, image, like, statue } = models;

    post.belongsTo(statue, {
      foreignKey: 'statue_id'
    });

    post.hasMany(comment, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_name: 'post'
      }
    });

    post.hasMany(image, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_name: 'post'
      }
    });

    post.hasMany(like, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_name: 'post'
      }
    });
  };

  return post;
};
