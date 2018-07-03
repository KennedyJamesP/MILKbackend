'use strict';

module.exports = (sequelize, DataTypes) => {
  const image = sequelize.define('image', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    model_name: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    model_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    height: DataTypes.INTEGER,
    width: DataTypes.INTEGER
  },
  {
    underscored: true
  });

  image.associate = function(models) {
  };

  image.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    
    delete values.model_name;
    delete values.model_id;
    return values;
  }

  return image;
};