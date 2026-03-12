import { Injectable, signal, computed } from '@angular/core';

export interface Song {
  _id?: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  youtubeId: string;
  duration: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  queue = signal<Song[]>([]);
  currentIndex = signal<number>(-1);
  isPlaying = signal<boolean>(false);
  
  sleepTimerActive = signal<boolean>(false);
  sleepTimerMinutes = signal<number>(0);
  private sleepTimerTimeout: ReturnType<typeof setTimeout> | null = null;

  currentSong = computed(() => {
    const q = this.queue();
    const idx = this.currentIndex();
    if (idx >= 0 && idx < q.length) {
      return q[idx];
    }
    return null;
  });

  playSong(song: Song) {
    const q = this.queue();
    const existingIndex = q.findIndex(s => s.youtubeId === song.youtubeId);
    
    if (existingIndex !== -1) {
      this.currentIndex.set(existingIndex);
    } else {
      this.queue.update(curr => [...curr, song]);
      this.currentIndex.set(q.length);
    }
    this.isPlaying.set(true);
  }

  addToQueue(song: Song) {
    this.queue.update(curr => [...curr, song]);
    if (this.currentIndex() === -1) {
      this.currentIndex.set(0);
      this.isPlaying.set(true);
    }
  }

  next() {
    if (this.currentIndex() < this.queue().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.isPlaying.set(true);
    } else {
      this.isPlaying.set(false);
    }
  }

  previous() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.isPlaying.set(true);
    }
  }

  togglePlay() {
    if (this.currentSong()) {
      this.isPlaying.update(p => !p);
    }
  }

  setSleepTimer(minutes: number) {
    if (this.sleepTimerTimeout) {
      clearTimeout(this.sleepTimerTimeout);
    }
    
    if (minutes > 0) {
      this.sleepTimerMinutes.set(minutes);
      this.sleepTimerActive.set(true);
      
      this.sleepTimerTimeout = setTimeout(() => {
        this.isPlaying.set(false);
        this.queue.set([]);
        this.currentIndex.set(-1);
        this.sleepTimerActive.set(false);
        this.sleepTimerMinutes.set(0);
      }, minutes * 60 * 1000);
    } else {
      this.sleepTimerActive.set(false);
      this.sleepTimerMinutes.set(0);
    }
  }
}
