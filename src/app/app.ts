import {ChangeDetectionStrategy, Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchBarComponent } from './components/search-bar.component';
import { FloatingPlayerComponent } from './components/floating-player.component';
import { PlaylistCopierComponent } from './components/playlist-copier.component';
import { SleepTimerComponent } from './components/sleep-timer.component';
import { HomeGridComponent } from './components/home-grid.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    SearchBarComponent, 
    FloatingPlayerComponent, 
    PlaylistCopierComponent, 
    SleepTimerComponent,
    HomeGridComponent
  ],
  template: `
    <div class="min-h-screen pb-32 bg-black text-white">
      <header class="bg-black/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold tracking-tight">SpotiHehe</h1>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6">
        <app-home-grid></app-home-grid>

        <div class="mb-12">
          <app-search-bar></app-search-bar>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <app-playlist-copier></app-playlist-copier>
          <app-sleep-timer></app-sleep-timer>
        </div>
      </main>

      <app-floating-player></app-floating-player>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class App {}
