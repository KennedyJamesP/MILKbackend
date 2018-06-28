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
  }, 
  {
    underscored: true
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      perform_create: function(user_id, location, statue_id) {
        let post = Post.create({
          user_id: user_id,
          location: location,
          statue_id: statue_id,
        })
        .then(post => {
          console.log("Successfully created post: ", post);
          return post;
        })
        .catch(err => {
          console.log("Failed to create post");
          return err;
        });
      },
      get_by_id: function(id) {
        return Post.findById(id)
        .then(post => {
          console.log("Found post:", post);
          return post;
        })
        .catch(err => {
          console.log("error getting post by id");
          return err;
        });
      },
      get_statue_post: function(statue_id) {
        return Post.findOne({
          where: {
            statue_id: statue_id
          }
        })
        .then(result => {
          console.log("Found Statue post:", result);
          return result;
        })
        .catch(err => {
          console.log("error getting post by id");
          return err;
        });
      }
    }
  });
  
  return post;
};
