// backend/models/problem.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Problem', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    constraints: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    examples: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    functionSignature: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hints: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'easy'
    },
    solution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    testCases: {
      type: DataTypes.TEXT, // store as JSON string
      allowNull: false
    }
  });
};
