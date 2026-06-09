const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")
const Issue = require("./issues")
const User = require("./users")

const Vote = sequelize.define("Vote", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    issueId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ["userId", "issueId"]
        }
    ]
})

Vote.belongsTo(User, { foreignKey: "userId" })
Vote.belongsTo(Issue, { foreignKey: "issueId" })

module.exports = Vote
