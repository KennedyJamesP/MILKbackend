'use strict';

module.exports = (sequelize, DataTypes) => {
  var post = sequelize.define('post', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    location: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    statue_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      get: function(id) {
        Post.findOne({
          where: {
            id: id
          }
        })
        .then(result => {
          return result
        })
        .catch(err => {
          console.log("error getting post by id");
          return res.status(500).json({error: err.message})
        });
      }
    }
  });
  
  return post;
};
