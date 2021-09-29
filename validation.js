const Joi = require('@hapi/joi');
const { modelName } = require('./models/User');


const registerValidation = (data) => {
    const schema = Joi.object({
        // name: Joi.string().min(6).required(),
        name: Joi.string()
            .min(6)
            .required(),
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required(),
        gender: Joi.string()
        .required()
    });

    return schema.validate(data);

};


const loginValidation = (data) => {
    const schema = Joi.object({
        // name: Joi.string().min(6).required(),

        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required()
    });

    return schema.validate(data);

};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;