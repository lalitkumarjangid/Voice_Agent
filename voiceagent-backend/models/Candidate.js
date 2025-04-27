// models/Candidate.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  current_ctc: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  expected_ctc: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  notice_period: {
    type: DataTypes.INTEGER, // In days
    allowNull: true
  },
  experience: {
    type: DataTypes.FLOAT, // In years
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default Candidate;