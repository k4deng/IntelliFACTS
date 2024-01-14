import { Novu } from '@novu/node';
import { novuApiKey } from "../../config/index.js";

export const novu = new Novu(novuApiKey);