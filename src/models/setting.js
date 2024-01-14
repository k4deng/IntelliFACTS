import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const settingSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: {
    test: { type: String, default: 'test' }
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
    }
  },
},
{
  timestamps: true
});

const Setting = model('Setting', settingSchema)
export default Setting