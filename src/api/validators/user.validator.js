import Joi from 'joi';

export function validateLogin(body) {
  const schema = Joi.object({
    District: Joi.string().min(1).max(20).required(),
    Username: Joi.string().min(1).max(50).required(),
    Password: Joi.string().min(1).max(8000).required(),
    signIn: Joi.string().valid('LOG IN').required(),
  });
  return schema.validate(body);
}