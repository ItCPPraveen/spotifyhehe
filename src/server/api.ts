import express from 'express';
import YTMusic from 'ytmusic-api';
import mongoose from 'mongoose';
import { Song, Playlist } from './db.js';

const router = express.Router();
const ytmusic = new YTMusic();

let ytmusicInitialized = false;
async function initYTMusic() {
  if (!ytmusicInitialized) {
    await ytmusic.initialize();
    ytmusicInitialized = true;
  }
}

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query['q'] as string;
    if (!query) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    // Append "Tamil" if not specified
    const searchQuery = query.toLowerCase().includes('tamil') ? query : `${query} Tamil`;

    // Check MongoDB first
    let cachedSongs: unknown[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        cachedSongs = await Song.find({ searchTags: { $in: [searchQuery.toLowerCase()] } }).limit(10);
      } catch (err) {
        console.error('MongoDB find error:', err);
      }
    }
    
    if (cachedSongs.length > 0) {
      res.json(cachedSongs);
      return;
    }

    // Search YouTube Music
    await initYTMusic();
    const results = await ytmusic.searchSongs(searchQuery);
    
    const songsToSave = results.slice(0, 10).map(song => ({
      title: song.name,
      artist: song.artist.name,
      thumbnailUrl: song.thumbnails[0]?.url || '',
      youtubeId: song.videoId,
      duration: song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '0:00',
      searchTags: [searchQuery.toLowerCase()]
    }));

    // Save to MongoDB
    const savedSongs = [];
    if (mongoose.connection.readyState === 1) {
      for (const songData of songsToSave) {
        if (!songData.youtubeId) continue;
        try {
          const existing = await Song.findOne({ youtubeId: songData.youtubeId });
          if (existing) {
            if (!existing.searchTags.includes(searchQuery.toLowerCase())) {
              existing.searchTags.push(searchQuery.toLowerCase());
              await existing.save();
            }
            savedSongs.push(existing);
          } else {
            const newSong = new Song(songData);
            await newSong.save();
            savedSongs.push(newSong);
          }
        } catch (err) {
          console.error('Error saving song:', err);
        }
      }
    }

    res.json(savedSongs.length > 0 ? savedSongs : songsToSave); // Fallback to raw data if DB fails
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/playlists/clone', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'Playlist URL is required' });
      return;
    }

    // Extract playlist ID
    let playlistId = '';
    try {
      const urlObj = new URL(url);
      playlistId = urlObj.searchParams.get('list') || '';
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    if (!playlistId) {
      res.status(400).json({ error: 'Could not extract playlist ID from URL' });
      return;
    }

    await initYTMusic();
    const ytPlaylist = await ytmusic.getPlaylist(playlistId);
    const ytVideos = await ytmusic.getPlaylistVideos(playlistId);
    
    if (!ytPlaylist || !ytVideos || ytVideos.length === 0) {
      res.status(404).json({ error: 'Playlist not found or empty' });
      return;
    }

    const trackIds = [];
    const savedSongs = [];
    for (const video of ytVideos) {
      if (!video.videoId) continue;
      
      let song;
      if (mongoose.connection.readyState === 1) {
        try {
          song = await Song.findOne({ youtubeId: video.videoId });
          if (!song) {
            song = new Song({
              title: video.name,
              artist: video.artist?.name || 'Unknown',
              thumbnailUrl: video.thumbnails[0]?.url || '',
              youtubeId: video.videoId,
              duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
              searchTags: []
            });
            await song.save();
          }
          trackIds.push(song._id);
        } catch (err) {
          console.error('Error saving song:', err);
        }
      }
      
      savedSongs.push({
        title: video.name,
        artist: video.artist?.name || 'Unknown',
        thumbnailUrl: video.thumbnails[0]?.url || '',
        youtubeId: video.videoId,
        duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00'
      });
    }

    let newPlaylist;
    if (mongoose.connection.readyState === 1) {
      try {
        newPlaylist = new Playlist({
          name: ytPlaylist.name || 'Imported Playlist',
          ownerId: 'anonymous',
          trackIds,
          isImported: true
        });
        await newPlaylist.save();
      } catch (err) {
        console.error('Error saving playlist:', err);
      }
    }

    res.json(newPlaylist || {
      name: ytPlaylist.name || 'Imported Playlist',
      ownerId: 'anonymous',
      trackIds: [],
      tracks: savedSongs,
      isImported: true
    });
  } catch (error) {
    console.error('Playlist clone error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
