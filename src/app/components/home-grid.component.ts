import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-home-grid',
  imports: [MatIconModule],
  template: `
    <div class="mb-8 mt-2">
      <h2 class="text-3xl font-bold text-white mb-6">{{ greeting() }}</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        @for (item of recentItems; track item.id) {
          <div 
            class="flex items-center bg-zinc-800/40 hover:bg-zinc-700/60 transition-colors rounded-md overflow-hidden cursor-pointer group"
            (click)="playItem(item)"
            (keydown.enter)="playItem(item)"
            tabindex="0"
          >
            <img [src]="item.image" [alt]="item.title" class="w-16 h-16 md:w-20 md:h-20 object-cover shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
            <div class="flex-grow px-4 font-bold text-sm md:text-base text-white truncate">
              {{ item.title }}
            </div>
            <div class="pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform" tabindex="-1">
                <mat-icon>play_arrow</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <div class="mb-12">
      <div class="flex items-end justify-between mb-4">
        <h2 class="text-2xl font-bold text-white hover:underline cursor-pointer">Suggested for you</h2>
        <span class="text-sm font-bold text-zinc-400 hover:underline cursor-pointer">Show all</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        @for (playlist of suggestedPlaylists; track playlist.id) {
          <div 
            class="bg-zinc-800/30 hover:bg-zinc-800/80 transition-colors p-4 rounded-xl cursor-pointer group"
            (click)="playItem(playlist)"
            (keydown.enter)="playItem(playlist)"
            tabindex="0"
          >
            <div class="relative mb-4">
              <img [src]="playlist.image" [alt]="playlist.title" class="w-full aspect-square object-cover rounded-md shadow-lg">
              <button class="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:scale-105 duration-200" tabindex="-1">
                <mat-icon>play_arrow</mat-icon>
              </button>
            </div>
            <h3 class="font-bold text-white truncate mb-1">{{ playlist.title }}</h3>
            <p class="text-sm text-zinc-400 line-clamp-2">{{ playlist.description }}</p>
          </div>
        }
      </div>
    </div>
  `
})
export class HomeGridComponent implements OnInit {
  playerService = inject(PlayerService);
  greeting = signal('Good day');

  recentItems = [
    { id: 1, title: 'Liked Songs', image: 'https://picsum.photos/seed/liked/150/150' },
    { id: 2, title: 'Top 50 - Global', image: 'https://picsum.photos/seed/global/150/150' },
    { id: 3, title: 'A.R. Rahman Hits', image: 'https://picsum.photos/seed/arr/150/150' },
    { id: 4, title: 'Workout Mix', image: 'https://picsum.photos/seed/workout/150/150' },
    { id: 5, title: 'Anirudh Musical', image: 'https://picsum.photos/seed/anirudh/150/150' },
    { id: 6, title: 'Lo-Fi Beats', image: 'https://picsum.photos/seed/lofi/150/150' },
  ];

  suggestedPlaylists = [
    { id: 101, title: 'New Releases', description: 'Catch up on the latest releases.', image: 'https://picsum.photos/seed/new/200/200' },
    { id: 102, title: 'Chill Vibes', description: 'Kick back to the best new and recent chill tunes.', image: 'https://picsum.photos/seed/chill/200/200' },
    { id: 103, title: 'Kollywood Classics', description: 'Evergreen hits from the 90s and 2000s.', image: 'https://picsum.photos/seed/classic/200/200' },
    { id: 104, title: 'Focus', description: 'Music to help you concentrate.', image: 'https://picsum.photos/seed/focus/200/200' },
    { id: 105, title: 'Party Time', description: 'Upbeat tracks to get the party started.', image: 'https://picsum.photos/seed/party/200/200' },
  ];

  ngOnInit() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting.set('Good morning');
    } else if (hour < 18) {
      this.greeting.set('Good afternoon');
    } else {
      this.greeting.set('Good evening');
    }
  }

  playItem(item: { id: number, title: string, image: string, description?: string }) {
    console.log('Playing', item.title);
    // In a real application, this would fetch the playlist tracks and add them to the queue.
  }
}
