// models/Conversation.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Candidate from './Candidate.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidate_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Candidate,
      key: 'id'
    },
    allowNull: false
  },
  transcript: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  entities_extracted: {
    type: DataTypes.JSON,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Define associations
Candidate.hasMany(Conversation, { foreignKey: 'candidate_id' });
Conversation.belongsTo(Candidate, { foreignKey: 'candidate_id' });

export default Conversation;