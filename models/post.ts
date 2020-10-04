import Sequelize, { DataTypes, Model } from "sequelize";
import sequelize from './sequelize';

class Post extends Model { }

Post.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  canonicalUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Post',
  indexes: [{ unique: true, fields: ['title'] }]
})
