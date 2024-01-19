import Joi from 'joi';
import { Setting } from "../../models/index.js";

export async function validateUserSettings(body) {
  const schema = Joi.object({
    classes: {
      filteringType: Joi.string().valid(...(await Setting.schema.path('user.classes.filteringType').options.enum)),
      list: Joi.array().items(Joi.number())
    }
  });
  return schema.validate(body);
}

export async function validateUpdaterSettings(body) {
  const schema = Joi.object({
    enabled: Joi.boolean(),
    checkedElements: {
      info: Joi.array().items(Joi.string().valid(
          ...(await Setting.schema.path('updater.checkedElements.info').options.enum)
      )),
      data: Joi.array().items(Joi.string().valid(
          ...(await Setting.schema.path('updater.checkedElements.data').options.enum)
      ))
    },
    notifications: Joi.array().items(Joi.object({
      title: Joi.string().min(3).max(50),
      webhook: Joi.string().uri().allow(''),
      sentElements: Joi.array().items(Joi.string().valid(
        ...(await Setting.schema.path('updater.checkedElements.info').options.enum),
        ...(await Setting.schema.path('updater.checkedElements.data').options.enum)
      ))
    })),
    //checkFrequency: Joi.number().valid(...(await Setting.schema.path('updater.checkFrequency').options.enum))
  });
  return schema.validate(body);
}