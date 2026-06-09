const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const CATEGORIES = require("../constants/categories")

const Issue = sequelize.define("Issue", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    userId: {
        type:DataTypes.INTEGER,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [CATEGORIES],
                msg: "Invalid category"
            }
        }
    },

    status: {
        type: DataTypes.STRING,
        defaultValue: "open"
    },

    votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})

const User = require("./users")
Issue.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Issue, { foreignKey: "userId"})

module.exports = Issue