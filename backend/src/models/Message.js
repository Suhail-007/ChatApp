import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  mood: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Message', messageSchema);
