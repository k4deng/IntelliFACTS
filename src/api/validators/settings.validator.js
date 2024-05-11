import Joi from 'joi';
import { Setting } from "../../models/index.js";
import { sentElementsEnum, styleEnum } from "../../models/setting.js";

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
    notifications: Joi.array().items(Joi.object({
      channelId: Joi.string(),
      sentElements: Joi.array().items(Joi.string().valid(
        ...(sentElementsEnum.info),
        ...(sentElementsEnum.data)
      )),
      style: Joi.string().valid(...styleEnum)
    }))
  });
  return schema.validate(body);
}