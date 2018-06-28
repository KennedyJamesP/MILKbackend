'use strict';

module.exports = (sequelize, DataTypes) => {
  var comment = sequelize.define('comment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    text: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    model_name: DataTypes.STRING,
    model_id: DataTypes.INTEGER
  }, 
  {
    underscored: true
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      create_with_model: function(model_name, model_id, user_id) {
        return Comment.create({
          text: text,
          user_id: user_id,
          model_name: model_name,
          model_id: model_id,
        })
        .then(comment => {
          console.log("Successfully created comment: ", comment);
          return comment;
        })
        .catch(err => {
          console.log("Failed to create comment");
          return err;
        });
      }
    }
  });

  return comment;
};