// backend/models/channel.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Channel', {
      name: { type: DataTypes.STRING, unique: true, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: true }
    });
  };
  