import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-playlist-copier',
  imports: [FormsModule, MatIconModule],
  template: `
    <div class="w-full max-w-2xl mx-auto p-4 mt-8">
      <div class="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl">
        <div class="flex items-center mb-4">
          <mat-icon class="text-red-500 mr-2">content_copy</mat-icon>
          <h2 class="text-xl font-bold">Clone YouTube Playlist</h2>
        </div>
        <p class="text-zinc-400 text-sm mb-6">Paste a YouTube or YouTube Music playlist URL to import all tracks into TamilStream.</p>
        
        <div class="flex space-x-2">
          <input 
            type="text" 
            [(ngModel)]="url" 
            placeholder="https://music.youtube.com/playlist?list=..." 
            class="flex-grow bg-zinc-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
          <button 
            (click)="clone()" 
            [disabled]="isLoading() || !url.trim()"
            class="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            @if (isLoading()) {
              <mat-icon class="animate-spin mr-2">sync</mat-icon>
              Cloning...
            } @else {
              <mat-icon class="mr-2">cloud_download</mat-icon>
              Clone
            }
          </button>
        </div>

        @if (successMessage()) {
          <div class="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center">
            <mat-icon class="mr-2">check_circle</mat-icon>
            {{ successMessage() }}
          </div>
        }

        @if (errorMessage()) {
          <div class="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center">
            <mat-icon class="mr-2">error</mat-icon>
            {{ errorMessage() }}
          </div>
        }
      </div>
    </div>
  `
})
export class PlaylistCopierComponent {
  url = '';
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  private apiService = inject(ApiService);

  clone() {
    if (!this.url.trim()) return;
    
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.apiService.clonePlaylist(this.url).subscribe({
      next: (playlist) => {
        this.successMessage.set(`Successfully cloned playlist "${playlist.name}" with ${playlist.trackIds.length} tracks.`);
        this.isLoading.set(false);
        this.url = '';
      },
      error: (err) => {
        console.error('Clone failed', err);
        this.errorMessage.set(err.error?.error || 'Failed to clone playlist. Please check the URL.');
        this.isLoading.set(false);
      }
    });
  }
}
