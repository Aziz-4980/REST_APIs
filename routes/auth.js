const router = require('express').Router();
const User = require('../models/User');
// const validate = require('../models/User');
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { verifyEmail } = require('./emailVerification');

// const { required } = require('@hapi/joi');

//validations
// const Joi = require('@hapi/joi');

// const schema = Joi.object({
//     // name: Joi.string().min(6).required(),
//     name: Joi.string()
//         .min(6)
//         .required(),
//     email: Joi.string()
//         .min(6)
//         .required()
//         .email(),
//     password: Joi.string()
//         .min(6)
//         .required()
// });


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'codingtesting30@gmail.com',
        pass: 'abdul.aziz.khan'
    },
    tls: {
        rejectUnauthorized: false

    }
})


router.post('/register', async (req, res) => {

    //validating new user
    // const{error} = Jio.validate(req.body,schema);
    // const validation = Joi.validate(req.body, schema);
    // if(error) return res.status(400).send(error.details[0].message);
    // const val =  schema.validate(req.body);
    // res.send(val);

    //validating credientals
    const { error } = registerValidation(req.body);
    // res.send(error.details[0].messagers);

    if (error) return res.status(400).send(error.details[0].message);
    //checking if the user exists

    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).send('Email already exists');

    //hasing passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);




    //registering a new user
    // res.send('Register');
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        // password: req.body.password
        password: hashedPassword,
        emailToken: crypto.randomBytes(64).toString('hex'),
        isVerified: false,
        gender: req.body.gender
    });
    try {
        const savedUser = await user.save();
        res.send(savedUser);

        var mailOptions = {
            from: '"Verify your email" <codingtesting30@gmail.com>',
            to: user.email,
            subject: 'verify mail',
            html: `<h2>${user.name} thank you for registering to our website </h2>
            </br>
            <h3>Please verify you remail to contonue...</h3>
            <a href="http://${req.headers.host}/api/user/verify-email?token=${user.emailToken}">Click here to verify...</a>`

        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log('verification mail sent to your email address')
            }
        })


    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/verify-email', async (req, res) => {

    try {
        const token = req.query.token
        const user = await User.findOne({ emailToken: token })
        if (user) {
            user.emailToken = null
            user.isVerified = true
            await user.save()
            res.redirect('http://localhost:3000/login')
        }
        else {
            res.redirect('http://localhost:3000/register')
            console.log('email not verified')

        }
    } catch (err) {
        console.log(err)
    }

});


router.post('/login', verifyEmail, async (req, res) => {
    //validating login credientals
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //checking email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('email not found');



    //checking password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid Password');

    // res.send('logged in!');

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.status(200).header('auth-token', token).send({ token: token });

    // res.cookie("token", token,{
    //     httpOnly: true,
    //     maxAge:24*60*60*1080 //1 day
    // })
    // res.send({
    //     message: success
    // })z

});


router.post('/reset-pass', (req, res) => {

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }

        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    return res.status(404).json({ error: "User doesnot exixt in the data base" })
                }
                user.resetToken = token,
                    user.expireToken = Date.now() + 360000
                user.save().then((result) => {
                    transporter.sendMail({
                        to: req.body.email,
                        from: "no-reply@aziz.com",
                        subject: "Password Reset",
                        html: `<h2>${user.name} Welcome back to our website </h2>
            </br>
            <h3>Please Click the link Below to reset your PASSWORD...</h3>
            <a href="http://localhost:3000/reset/${token}">Click here to change Password...</a>`


                    })

                    res.json({ message: "check your email" })
                })

            })
    })


});

router.post('/new-password', async (req, res) => {
    const senttoken = req.body.resetToken
    //    console.log(senttoken)
    const newPass = req.body.password
    console.log(req.body)

    User.findOne({
        resetToken: senttoken, expireToken: { $gt: Date.now() }
    }).then(user => {
        if (!user) {
            return res.status(422).json({ message: 'session expired, try again' })
        }

        bcrypt.hash(newPass, 32).then(hashedPassword => {
            user.password = hashedPassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then((saveduser) => {
                res.json({ message: 'password updated successfully' })
            })
        })


    }).catch(err => {
        console.log(err)
    })



})











module.exports = router;
