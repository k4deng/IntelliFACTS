import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const sentElementsEnum = {
  info: [
    'Class Added',
    'Class Removed',
    'Class Renamed',
    'Teacher Changed',
    'Grade Changed',
  ],
  data: [
    'Category Added',
    'Category Removed',
    'Category Renamed',
    'Category Weight Changed',
    'Assignment Added (Graded)',
    'Assignment Removed',
    'Assignment Grade Changed',
    'Assignment Note Changed',
    'Assignment Due Date Changed',
  ]
};

export const styleEnum = ['fancy', 'optimized', 'plain'];

const settingSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: {
    classes: {
      filteringType: {
        type: String,
        default: 'blacklist',
        enum: ['whitelist', 'blacklist']
      },
      list: [Number]
    }
  },
  updater: {
    enabled: { type: Boolean, default: false },
    discordNotifications: {
      type: [{
        _id: false,
        channelId: String,
        webhook: String,
        sentElements: {
          type: [String],
          enum: [...sentElementsEnum.info, ...sentElementsEnum.data]
        },
        style: {
          type: String,
          enum: styleEnum,
          default: 'optimized'
        },
      }],
      default: []
    },
    pushSubscriptions: {
      type: [{
        _id: false,
        endpoint: String,
        expirationTime: String,
        keys: {
          p256dh: String,
          auth: String
        },
        sentElements: {
          type: [String],
          enum: [...sentElementsEnum.info, ...sentElementsEnum.data]
        }
      }],
      default: []
    },
    checkFrequency: { //internal feature, not exposed to user
      type: Number, // in minutes, make sure added enums are converted to valid cron expressions when ran with makeSchedule() in src/updater/worker.js
      default: 30,  // below are all valid values
      enum: [ 5, 15, 30, 60, 360, 1440 ] // 5 minutes, 15 minutes, 30 minutes, 1 hour, 6 hours, 24 hours
    },
    botMaxChannels: { //internal feature, not exposed to user
        type: Number,
        default: 2
    }
  },
},
{
  timestamps: true
});

const Setting = model('Setting', settingSchema)
export default Setting