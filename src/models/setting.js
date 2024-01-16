import mongoose from 'mongoose';
const { Schema, model } = mongoose;

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
    checkedElements: {
      info: {
        type: [String],
        default: ['Grade Changed'],
        enum: [
          'Class Added',
          'Class Removed',
          'Class Renamed',
          'Teacher Changed',
          'Grade Changed',
        ]
      },
      data: {
        type: [String],
        default: ['Assignment Added (Graded)', 'Assignment Deleted', 'Assignment Grade Changed'],
        enum: [
          'Category Added',
          'Category Removed',
          'Category Renamed',
          'Category Weight Changed',
          'Assignment Added (Graded)',
          'Assignment Deleted',
          'Assignment Grade Changed',
          'Assignment Note Changed',
          'Assignment Due Date Changed',
        ]
      }
    },
    notifications: {
      type: [{
        _id: false,
        title: String,
        webhook: String,
        sentElements: [String]
      }],
      default: [{
        title: 'Info',
        webhook: '',
        sentElements: []
      },{
        title: 'Data',
        webhook: '',
        sentElements: []
      }]
    },
    checkFrequency: {
      type: Number, // in minutes
      default: 30,
      enum: [ 5, 15, 30, 60, 360, 1440 ] // 5 minutes, 15 minutes, 30 minutes, 1 hour, 6 hours, 24 hours
    }
  },
},
{
  timestamps: true
});

const Setting = model('Setting', settingSchema)
export default Setting