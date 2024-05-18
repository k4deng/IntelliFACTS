import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const changeSchema = new Schema({
        userId: { type: Schema.Types.ObjectId, required: true },
        type: { type: String, enum: ['info', 'data'] },
        class: { type: String },
        data: { type: Schema.Types.Mixed },
    },
    {
        timestamps: true
    });

const Change = model('Change', changeSchema)
export default Change