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
    location: DataTypes.STRING,
    image_id: DataTypes.INTEGER
  }, 
  {
    underscored: true
  });
  
  statue.associate = function(models) {
    // associations can be defined here
  };

  return statue;
};