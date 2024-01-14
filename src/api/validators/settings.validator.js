import Joi from 'joi';
import { Setting } from "../../models/index.js";

export function validateUserSettings(body) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(24),
    username: Joi.string().min(3).max(15),
    language: Joi.string().valid('en'),
    gender: Joi.string().valid('male', 'female', 'other'),
    birthDate: Joi.date()
  });
  return schema.validate(body);
}

export async function validateUpdaterSettings(body) {
  const schema = Joi.object({
    enabled: Joi.boolean(),
    checkedElements: {
        info: Joi.array().items(Joi.string().valid(...(await Setting.schema.path('updater.checkedElements.info').options.enum))),
        data: Joi.array().items(Joi.string().valid(...(await Setting.schema.path('updater.checkedElements.data').options.enum)))
    }
  });
  return schema.validate(body);
}