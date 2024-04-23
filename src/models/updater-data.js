import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const updaterDataSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  info: { type: Object, default: {} },
  data: { type: Object, default: {} },
},
{
  timestamps: true
});

const UpdaterData = model('UpdaterData', updaterDataSchema)
export default UpdaterData