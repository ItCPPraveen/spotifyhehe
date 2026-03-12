import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../services/api.service';
import { PlayerService, Song } from '../services/player.service';
import { SwipeToQueueDirective } from '../directives/swipe-to-queue.directive';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule, MatIconModule, SwipeToQueueDirective],
  template: `
    <div class="w-full max-w-2xl mx-auto p-4">
      <div class="relative">
        <input 
          type="text" 
          [(ngModel)]="query" 
          (keyup.enter)="search()"
          placeholder="Search for songs, artists..." 
          class="w-full bg-zinc-900 text-white rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
        <mat-icon class="absolute left-4 top-3.5 text-zinc-400">search</mat-icon>
        @if (isLoading()) {
          <div class="absolute right-4 top-3.5">
            <mat-icon class="animate-spin text-red-500">sync</mat-icon>
          </div>
        }
      </div>

      @if (results().length > 0) {
        <div class="mt-6 space-y-2">
          <h2 class="text-xl font-bold mb-4">Results</h2>
          @for (song of results(); track song.youtubeId) {
            <div 
              class="flex items-center p-3 hover:bg-zinc-800 rounded-xl group cursor-pointer transition-colors" 
              (click)="playSong(song)"
              (keydown.enter)="playSong(song)"
              tabindex="0"
              appSwipeToQueue
              (swipeRight)="addToQueue(song)"
            >
              <div class="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <img [src]="song.thumbnailUrl" [alt]="song.title" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <mat-icon class="text-white">play_arrow</mat-icon>
                </div>
              </div>
              <div class="ml-4 flex-grow min-w-0">
                <p class="font-medium truncate">{{ song.title }}</p>
                <p class="text-sm text-zinc-400 truncate">{{ song.artist }}</p>
              </div>
              <div class="text-sm text-zinc-500 mr-4">{{ song.duration }}</div>
              <button (click)="addToQueue(song, $event)" class="opacity-0 group-hover:opacity-100 p-2 hover:bg-zinc-700 rounded-full transition-all" title="Add to queue (or swipe right)">
                <mat-icon>queue_music</mat-icon>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SearchBarComponent {
  query = '';
  results = signal<Song[]>([]);
  isLoading = signal(false);

  private apiService = inject(ApiService);
  private playerService = inject(PlayerService);

  search() {
    if (!this.query.trim()) return;
    
    this.isLoading.set(true);
    this.apiService.search(this.query).subscribe({
      next: (songs) => {
        this.results.set(songs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Search failed', err);
        this.isLoading.set(false);
      }
    });
  }

  playSong(song: Song) {
    this.playerService.playSong(song);
  }

  addToQueue(song: Song, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.playerService.addToQueue(song);
  }
}
