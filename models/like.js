'use strict';

module.exports = (sequelize, DataTypes) => {
  var like = sequelize.define('like', {
    user_id: DataTypes.INTEGER,
    model_name: DataTypes.STRING,
    model_id: DataTypes.STRING
  }, {
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
        .then(result => {
          console.log("Successfully found liked post: ", result);
          return result;
        })
        .catch(err => {
          console.log("Failed to find liked post");
          return res.status(404).json(error: err.message);
        });
      },
      create_with_model: function(model_name, model_id, user_id) {
        return Like.create({
          user_id: user_id,
          model_name: model_name,
          model_id: model_id
        })
        .then(result => {
          console.log("Successfully liked entity:", result);
          return result;
        })
        .catch(err => {
          console.log("Failed to like entity");
          return res.status(500).json(error: err.message);
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
          return res.status(500).json(error: err.message);
        });
      }
    }
  });

  return like;
};