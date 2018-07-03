'use strict';

module.exports = (sequelize, DataTypes) => {
  const like = sequelize.define('like', {
    user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    model_name: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    model_id: { 
      type: DataTypes.INTEGER
    }
  }, 
  {
    underscored: true
  });

  like.associate = function(models) {    
    like.belongsTo(models.user, {
      foreignKey: 'user_id'
    });
  };

  like.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    
    delete values.model_name;
    delete values.model_id;
    return values;
  }

  return like;
};