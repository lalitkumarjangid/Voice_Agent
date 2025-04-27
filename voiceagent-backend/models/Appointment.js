// models/Appointment.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Job from './Job.js';
import Candidate from './Candidate.js';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  job_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Job,
      key: 'id'
    },
    allowNull: false
  },
  candidate_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Candidate,
      key: 'id'
    },
    allowNull: false
  },
  date_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Define associations
Job.hasMany(Appointment, { foreignKey: 'job_id' });
Appointment.belongsTo(Job, { foreignKey: 'job_id' });

Candidate.hasMany(Appointment, { foreignKey: 'candidate_id' });
Appointment.belongsTo(Candidate, { foreignKey: 'candidate_id' });

export default Appointment;