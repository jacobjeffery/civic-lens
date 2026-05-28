const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Issue = sequelize.define("Issue", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        allowNull: false
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

module.exports = Issue