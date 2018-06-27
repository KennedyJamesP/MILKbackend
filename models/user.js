'use strict';

module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    image_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      get_user_by_id: function(id) {
        return User.findById(id)
          .then(user => {
            console.log("User successfully retrieved from db: "+ JSON.stringify(user));
            return res.json({message: "success", data: user});;
          })
          .catch(err => {
            console.log("Error retrieving user from db:" + JSON.stringify(err));
            res.status(404).json({message: "User retrieval failed", error: err.message });
          })
      }
    }
  });

  return user;
};