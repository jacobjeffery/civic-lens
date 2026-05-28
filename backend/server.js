require("dotenv").config()
require("./src/models/issues")
const app = require("./src/app")
const sequelize = require("./src/config/database")

const PORT = process.env.PORT || 4000
const HOST = process.env.HOST || "127.0.0.1"

const start = async () => {
    try {
        await sequelize.authenticate()
        console.log("[db] connection established")

        await sequelize.sync()
        console.log("[db] models synced")
    
        app.listen(PORT, HOST, () => {
            console.log(`[server] listening on ${HOST}:${PORT}`)
        })
    } catch (err) {
        console.error("[db] unable to connect:", err)
    }
}

start()
