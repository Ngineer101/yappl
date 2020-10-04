import Sequelize, { DataTypes, Model, Deferrable } from "sequelize";
import sequelize from './sequelize';
import User from './user';

class Publication extends Model { }

Publication.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    }
  }
}, {
  sequelize,
  modelName: 'Publication',
  indexes: [{ unique: true, fields: ['name'] }]
})
