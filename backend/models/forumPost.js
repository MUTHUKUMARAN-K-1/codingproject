// backend/models/forumPost.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumPost', {
    title:   { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    likes:   { type: DataTypes.INTEGER, defaultValue: 0 }
  });
};
