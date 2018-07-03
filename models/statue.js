'use strict';

module.exports = (sequelize, DataTypes) => {
  const statue = sequelize.define('statue', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    artist_desc: DataTypes.STRING,
    artist_name: DataTypes.STRING,
    artist_url: DataTypes.STRING, 
    statue_desc: DataTypes.STRING,
    location: DataTypes.STRING
  }, 
  {
    underscored: true
  });
  
  statue.associate = function(models) {
    const { comment, image, like } = models;

    statue.hasMany(comment, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_name: 'statue'
      }
    });

    statue.hasMany(image, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_name: 'statue'
      }
    });

    statue.hasMany(like, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_name: 'statue'
      }
    });
  };

  statue.prototype.toJSON = async function () {

    const comments = await this.getComments();
    const images = await this.getImages();
    const likes = await this.getLikes();

    const statue = Object.assign({}, this.get(), {
      comments,
      images,
      likes
    });

    return statue;
  };

  return statue;
};