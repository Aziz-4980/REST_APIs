const User = require("../models/User")

const verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (user.isVerified) {
            next()
        }else{
            console.log('Please check your email address for verification')
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = { verifyEmail }