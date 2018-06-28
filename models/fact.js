'use strict';

module.exports = (sequelize, DataTypes) => {
  var fact = sequelize.define('fact', {
    section: DataTypes.STRING,
    desc: DataTypes.STRING
  }, 
  {
    underscored: true
  },
  {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });

  return fact;
};