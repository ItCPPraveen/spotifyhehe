import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
  title: string;
  artist: string;
  thumbnailUrl: string;
  youtubeId: string;
  duration: string;
  searchTags: string[];
}

const SongSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  youtubeId: { type: String, required: true, unique: true },
  duration: { type: String, required: true },
  searchTags: { type: [String], default: [] },
});

export const Song = mongoose.model<ISong>('Song', SongSchema);

export interface IPlaylist extends Document {
  name: string;
  ownerId: string;
  trackIds: mongoose.Types.ObjectId[];
  isImported: boolean;
}

const PlaylistSchema: Schema = new Schema({
  name: { type: String, required: true },
  ownerId: { type: String, default: 'anonymous' },
  trackIds: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  isImported: { type: Boolean, default: false },
});

export const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);

export async function connectDB() {
  const uri = process.env['MONGODB_URI'];
  if (!uri || uri.includes('<username>')) {
    console.warn('MONGODB_URI is not set or is a placeholder. Skipping MongoDB connection.');
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message && err.message.includes('SSL alert number 80')) {
      console.warn('⚠️ MongoDB Connection Warning: Your IP address is likely not allowlisted in MongoDB Atlas.');
      console.warn('👉 To fix this, go to your MongoDB Atlas dashboard -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0).');
      console.warn('ℹ️ The app will continue to run using the YouTube Music API directly as a fallback.');
    } else {
      console.error('MongoDB connection error:', err.message || error);
    }
  }
}
