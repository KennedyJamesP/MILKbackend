'use strict';

module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    text: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    model_name: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    model_id: { 
      type: DataTypes.INTEGER,
      allowNull: false, 
    }
  }, 
  {
    underscored: true
  });

  comment.associate = function(models) {
    const { post, statue } = models;
    
    comment.belongsTo(post, {
      foreignKey: 'model_id',
      constraints: false,
      as: 'post'
    });

    comment.belongsTo(statue, {
      foreignKey: 'model_id',
      constraints: false,
      as: 'statue'
    });
  };

  comment.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    
    delete values.model_name;
    delete values.model_id;
    return values;
  }

  return comment;
};