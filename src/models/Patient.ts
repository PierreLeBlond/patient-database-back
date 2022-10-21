import { sequelize } from '../config/db';
import { DataTypes } from 'sequelize';

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  file: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  aftercare: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM,
    values: ['child', 'man', 'woman'],
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  other_ex: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cataract: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tear_treatment: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  glasses: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ar: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avod_sc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avog_sc: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avod_ac: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avog_ac: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avodg_ac: {
    type: DataTypes.STRING,
    allowNull: false
  },
  laf: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prescription: {
    type: DataTypes.STRING,
    allowNull: false
  },
  glasses_donation: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  treatment: {
    type: DataTypes.STRING,
    allowNull: false
  },
  glasses_holder: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'patients',
  timestamps: false
});

const Act = sequelize.define('Act', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'acts',
  timestamps: false
});

Act.belongsTo(Patient, {
  foreignKey: {
    name: 'patient_id'
  },
  keyType: DataTypes.STRING,
  as: 'acts'
});
Act.removeAttribute('PatientId');
Patient.hasMany(Act, {
  as: 'acts',
  foreignKey: "patient_id",
  onDelete: 'CASCADE'
});

export { Patient, Act };