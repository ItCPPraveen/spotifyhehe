import { Component, inject, viewChild, AfterViewInit, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { YouTubePlayer } from '@angular/youtube-player';
import { PlayerService } from '../services/player.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-player',
  imports: [MatIconModule, YouTubePlayer, CommonModule],
  template: `
    @if (playerService.currentSong()) {
      <div class="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-4 flex items-center justify-between z-50 shadow-2xl">
        <div class="flex items-center w-1/3">
          <img [src]="playerService.currentSong()?.thumbnailUrl" alt="Thumbnail" class="w-14 h-14 rounded-md object-cover">
          <div class="ml-4 truncate">
            <p class="font-bold text-white truncate">{{ playerService.currentSong()?.title }}</p>
            <p class="text-sm text-zinc-400 truncate">{{ playerService.currentSong()?.artist }}</p>
          </div>
        </div>

        <div class="flex flex-col items-center w-1/3">
          <div class="flex items-center space-x-6">
            <button (click)="playerService.previous()" class="text-zinc-400 hover:text-white transition-colors">
              <mat-icon>skip_previous</mat-icon>
            </button>
            <button (click)="playerService.togglePlay()" class="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform">
              <mat-icon>{{ playerService.isPlaying() ? 'pause' : 'play_arrow' }}</mat-icon>
            </button>
            <button (click)="playerService.next()" class="text-zinc-400 hover:text-white transition-colors">
              <mat-icon>skip_next</mat-icon>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-end w-1/3 space-x-4">
          @if (playerService.sleepTimerActive()) {
            <div class="flex items-center text-red-500 text-sm font-medium bg-red-500/10 px-3 py-1 rounded-full">
              <mat-icon class="text-sm mr-1">timer</mat-icon>
              {{ playerService.sleepTimerMinutes() }}m
            </div>
          }
          <button (click)="toggleQueue()" class="text-zinc-400 hover:text-white transition-colors">
            <mat-icon>queue_music</mat-icon>
          </button>
        </div>
      </div>
      
      <!-- Queue Overlay -->
      @if (showQueue) {
        <div class="fixed bottom-24 right-4 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-40 overflow-hidden flex flex-col max-h-[60vh]">
          <div class="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 class="font-bold">Up Next</h3>
            <button (click)="toggleQueue()" class="text-zinc-400 hover:text-white">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="overflow-y-auto p-2 space-y-1">
            @for (song of playerService.queue(); track $index) {
              <div 
                class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors"
                [class.bg-zinc-800]="playerService.currentIndex() === $index"
                (click)="playFromQueue($index)"
                (keydown.enter)="playFromQueue($index)"
                tabindex="0"
              >
                @if (playerService.currentIndex() === $index) {
                  <mat-icon class="text-red-500 mr-2 text-sm">volume_up</mat-icon>
                } @else {
                  <div class="w-4 mr-2 text-zinc-500 text-xs text-center">{{ $index + 1 }}</div>
                }
                <div class="truncate flex-grow">
                  <p class="text-sm font-medium truncate" [class.text-red-500]="playerService.currentIndex() === $index">{{ song.title }}</p>
                  <p class="text-xs text-zinc-400 truncate">{{ song.artist }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
    }

    <!-- Hidden YouTube Player (Always in DOM) -->
    <div class="absolute left-0 top-0 w-10 h-10 pointer-events-none z-[-1] overflow-hidden">
      <youtube-player 
        #player
        [videoId]="playerService.currentSong()?.youtubeId"
        [width]="40"
        [height]="40"
        (ready)="onReady($event)"
        (stateChange)="onStateChange($event)"
        [playerVars]="{ autoplay: 1, controls: 0 }"
      ></youtube-player>
    </div>
  `
})
export class FloatingPlayerComponent implements AfterViewInit {
  playerService = inject(PlayerService);
  showQueue = false;

  player = viewChild<YouTubePlayer>('player');

  constructor() {
    effect(() => {
      const isPlaying = this.playerService.isPlaying();
      const currentSong = this.playerService.currentSong();
      const p = this.player();
      if (p && currentSong) {
        try {
          if (isPlaying) {
            p.playVideo();
          } else {
            p.pauseVideo();
          }
        } catch (e) {
          console.warn('YouTube player not ready yet', e);
        }
      }
    });
  }

  ngAfterViewInit() {
    // Ensure API is loaded
    if (typeof window !== 'undefined' && !(window as { YT?: unknown }).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }

  onReady(event: { target: { playVideo: () => void, setVolume: (vol: number) => void, unMute: () => void } }) {
    console.log('YouTube Player Ready', event);
    event.target.unMute();
    event.target.setVolume(100);
    if (this.playerService.isPlaying()) {
      event.target.playVideo();
    }
  }

  onStateChange(event: { data: number, target: { playVideo: () => void } }) {
    console.log('YouTube Player State Change', event.data);
    // YT.PlayerState.ENDED = 0
    if (event.data === 0) {
      this.playerService.next();
    }
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1 && !this.playerService.isPlaying()) {
      this.playerService.isPlaying.set(true);
    }
    // YT.PlayerState.PAUSED = 2
    if (event.data === 2 && this.playerService.isPlaying()) {
      this.playerService.isPlaying.set(false);
    }
    // YT.PlayerState.UNSTARTED = -1 or CUED = 5
    if ((event.data === -1 || event.data === 5) && this.playerService.isPlaying()) {
      event.target.playVideo();
    }
  }

  toggleQueue() {
    this.showQueue = !this.showQueue;
  }

  playFromQueue(index: number) {
    this.playerService.currentIndex.set(index);
    this.playerService.isPlaying.set(true);
  }
}
