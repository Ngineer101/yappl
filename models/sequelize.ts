import { Sequelize } from 'sequelize'
const sequelize = new Sequelize(process.env.DATABASE_URL || "", {
  define: {
    freezeTableName: true,
  }
})

export default sequelize
