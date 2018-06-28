'use strict';

module.exports = (sequelize, DataTypes) => {
  var like = sequelize.define('like', {
    user_id: DataTypes.INTEGER,
    model_name: DataTypes.STRING,
    model_id: DataTypes.STRING
  }, 
  {
    underscored: true
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      get_like_by_user: function(post_id, user_id) {
        return Like.findOne({
          where: {
            user_id: user_id,
            model_id: post_id
          }
        })
        .then(like => {
          console.log("Successfully found liked post: ", like);
          return like;
        })
        .catch(err => {
          console.log("Failed to find liked post");
          return {error: err, status: 500};
        });
      },
      create_with_model: function(model_name, model_id, user_id) {
        return Like.create({
          user_id: user_id,
          model_name: model_name,
          model_id: model_id
        })
        .then(like => {
          console.log("Successfully liked entity:", like);
          return like;
        })
        .catch(err => {
          console.log("Failed to like entity");
          return {error: err, status: 500};
        });
      },
      remove: function(model_name, model_id, user_id) {
        return Like.destroy({
          where: {
            user_id: user_id,
            model_name: model_name,
            model_id: model_id
          }
        })
        .then(result => {
          console.log("Successfully unliked entity and destroyed row", result);
          return result;
        })
        .catch(err => {
          console.log("Failed to unlike entity");
          return {error: err, status: 500};
        });
      }
    }
  });

  return like;
};