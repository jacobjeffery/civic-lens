const request = require("supertest")

require("dotenv").config({ path: ".env.test" })

const app = require("../src/app")
const sequelize = require("../src/config/database")
require("../src/models/issues")
require("../src/models/users")

beforeAll(async () => {
    await sequelize.sync({ force: true })
})

afterAll(async () => {
    await sequelize.close()
})

const testUser = {
    email: `test${Date.now()}@example.com`,
    password: "test123"
}
let token

describe("auth", () => {
    test("POST /auth/register creates a user", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send(testUser)

        expect(res.status).toBe(201)
        expect(res.body.email).toBe(testUser.email)
        expect(res.body.password).toBeUndefined()
    })

    test("POST /auth/login returns a token", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send(testUser)

        expect(res.status).toBe(200)
        expect(res.body.token).toBeDefined()
        token = res.body.token
    })
})

describe("issues", () => {
    test("GET /issues is public", async () => {
        const res = await request(app).get("/issues")

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    test("POST /issues without token returns 401", async () => {
        const res = await request(app)
            .post("/issues")
            .send({ title: "x", description: "x", category: "x" })

        expect(res.status).toBe(401)
    })

    test("POST /issues with token returns 201", async () => {
        const res = await request(app)
            .post("/issues")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Pothole", description: "Big one", category: "roads" })

        expect(res.status).toBe(201)
        expect(res.body.title).toBe("Pothole")
        expect(res.body.userId).toBeDefined()
    })
})
