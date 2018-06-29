'use strict';

//Todo add in section_id before pushing to prodution!!!

module.exports = (sequelize, DataTypes) => {
  const fact = sequelize.define('fact', {
    section: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    section_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    desc: { 
      type: DataTypes.STRING,
      allowNull: false, 
    }
  }, 
  {
    underscored: true
  });

  fact.associate = function(models) {
    // associations can be defined here
  }

  return fact;
};