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

  post.prototype.toJSON = async function () {

    const comments = await this.getComments();
    const images = await this.getImages();
    const likes = await this.getLikes();

    const post = Object.assign({}, this.get(), {
      comments,
      images,
      likes
    });

    return (post);
  };

  return post;
};