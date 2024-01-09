import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  personId: {
    type: Number, required: true, unique: true
  },
  userName: {
    type: String, required: true, unique: true
  },
  firstName: {
    type: String, required: true
  },
  lastName: {
    type: String, required: true
  },
  role: {
    type: String, required: true
  },
  type: {
    type: String,
    enum: ['admin', 'user', 'reader', 'creator'],
    default: 'user',
  },

  needsLogin: {
    type: Boolean,
    default: false,
  },
  tokens: {
    id_token: String,
    access_token: String,
    expires_in: Number,
    token_type: String,
    refresh_token: String,
    scope: String,
    issued_at: Number,
    expiration_time: Number,
  },

  photoUrl: {
    type: String,
    default:
        'https://upload.wikimedia.org/wikipedia/commons/4/47/HI_all.png',
  },

  language: {
    type: String,
    enum: ['en'],
    default: 'en',
  },

},
{
  timestamps: true
});

const User = model('User', userSchema)
export default User

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       properties:
*         personId:
*           type: number
*         username:
*           type: string
*         firstName:
*           type: string
*         lastName:
*           type: string
*         role:
*           type: string
*         type:
*           type: string
*           enum: ['user', 'admin', 'creator', 'reader']
*         needsLogin:
*           type: string
*         photoUrl:
*           type: string
*         language:
*           type: string
*           enum: ['en']
*/