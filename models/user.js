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
  }, 
  {
    underscored: true
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      get_user_by_id: function(id) {
        return this.findById(id)
        .then(user => {
          console.log("User successfully retrieved from db: "+ JSON.stringify(user));
          return user;
        })
        .catch(err => {
          console.log("Error retrieving user from db:" + JSON.stringify(err));
          return {error: err, status: 500};
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        console.log("user to json:", this.get())
        var values = Object.assign({}, this.get());

        delete values.password;

        return values;
      }
    }
  });

  return user;
};