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
    location: DataTypes.STRING,
    image_id: DataTypes.INTEGER
  }, 
  {
    underscored: true
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      get_by_id: function(id) {
        return Statue.findById(id)
        .then(statue => {
          console.log("Found Statue:", statue);
          return statue;
        })
        .catch(err => {
          console.log("error getting statue by id");
          return err;
        });
      },
    }
  });

  return statue;
};