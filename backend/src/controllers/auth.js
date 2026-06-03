const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("../models/users")

const register = async (req, res) => { 
    const { email, password } = req.body

    if ( !email || !password ) {
        return res.status(400).json({ error: "Missing information required for registration"})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await User.create({email, password: hashedPassword})

    res.status(201).json({id: user.id, email: user.email})

}

const login = async (req,res) => {
    const { email, password } = req.body
    if ( !email || !password ) {
        return res.status(400).json({error: "Email or Password are invalid or missing"})
    }

    const user = await User.findOne({where: { email } })
    if (!user) {
        return res.status(401).json({error: "Invalid credentials"})
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
        return res.status(401).json({error: "Invalid credentials"})
    }

    const token = jwt.sign(
        { id:user.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h"}
    )

    res.json({ token })
}



module.exports = { register,login, }