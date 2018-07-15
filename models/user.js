'use strict';

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    password: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    email: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    image_id: DataTypes.INTEGER
  }, 
  {
    defaultScope: {
      attributes: { 
        exclude: ['password']
      }
    },
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
