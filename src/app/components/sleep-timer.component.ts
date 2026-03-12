import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-sleep-timer',
  imports: [FormsModule, MatIconModule],
  template: `
    <div class="w-full max-w-2xl mx-auto p-4 mt-8">
      <div class="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-xl">
        <div class="flex items-center mb-4">
          <mat-icon class="text-red-500 mr-2">snooze</mat-icon>
          <h2 class="text-xl font-bold">Sleep Timer</h2>
        </div>
        <p class="text-zinc-400 text-sm mb-6">Set a timer to automatically pause playback and clear the queue.</p>
        
        <div class="flex items-center space-x-4 mb-6">
          <input 
            type="range" 
            min="0" 
            max="60" 
            step="5" 
            [(ngModel)]="minutes" 
            class="flex-grow accent-red-500"
          >
          <span class="text-2xl font-bold w-16 text-right">{{ minutes }}m</span>
        </div>

        <div class="flex justify-end space-x-3">
          @if (playerService.sleepTimerActive()) {
            <button 
              (click)="cancelTimer()" 
              class="px-4 py-2 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel Timer
            </button>
          }
          <button 
            (click)="setTimer()" 
            [disabled]="minutes === 0"
            class="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Set Timer
          </button>
        </div>
      </div>
    </div>
  `
})
export class SleepTimerComponent {
  minutes = 15;
  playerService = inject(PlayerService);

  setTimer() {
    this.playerService.setSleepTimer(this.minutes);
  }

  cancelTimer() {
    this.playerService.setSleepTimer(0);
    this.minutes = 15;
  }
}
