// backend/models/submission.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Submission', {
    userId:    { type: DataTypes.INTEGER, allowNull: false },
    problemId: { type: DataTypes.INTEGER, allowNull: false },
    code:      { type: DataTypes.TEXT, allowNull: false },
    language:  { type: DataTypes.STRING, allowNull: false },
    result:    { type: DataTypes.STRING, defaultValue: 'pending' }
  });
};
