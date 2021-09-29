const verify = require('./verifyToken');
const router= require('express').Router();


router.get('/', verify,  (req,res) =>{
    res.json({
        posts:{
            title: 'Private Post',
            description:'Description of private post'
        }
    })
})

module.exports = router;
