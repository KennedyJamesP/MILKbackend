'use strict';

module.exports = (sequelize, DataTypes) => {
  const post = sequelize.define('post', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    statue_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
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
    const { comment, image, like } = models;

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

  post.prototype.toJSON =  function () {
   const post = Object.assign({}, this.get());

    // post.comments = await this.getComments();
    // post.images = await this.getImages();
    // post.likes = await this.getLikes();

    //delete post.user_id;

    return (post);
  };

  return post;
};
