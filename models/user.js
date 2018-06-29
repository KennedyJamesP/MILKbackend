'use strict';

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
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
  });

  user.associate = function(models) {
    // associations can be defined here
  }

  user.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    
    delete values.password;
    return values;
  }
  
  return user;
};