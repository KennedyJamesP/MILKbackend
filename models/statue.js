'use strict';

module.exports = (sequelize, DataTypes) => {
  var statue = sequelize.define('statue', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    artist_desc: DataTypes.STRING,
    artist_name: DataTypes.STRING,
    artist_url: DataTypes.STRING,
    statue_desc: DataTypes.STRING,
    title: DataTypes.STRING,
    image_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return statue;
};