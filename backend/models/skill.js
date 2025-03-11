// backend/models/skill.js
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Skill', {
      name: { type: DataTypes.STRING, allowNull: false },
      roadmap: { type: DataTypes.TEXT, allowNull: false }
    });
  };
  