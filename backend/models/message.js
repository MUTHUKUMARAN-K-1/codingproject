// backend/models/message.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Message', {
      channelId: { type: DataTypes.INTEGER, allowNull: false },
      senderId:  { type: DataTypes.INTEGER, allowNull: false },
      content:   { type: DataTypes.TEXT, allowNull: false }
    });
  };
  