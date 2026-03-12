import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from './player.service';

export interface Playlist {
  _id: string;
  name: string;
  ownerId: string;
  trackIds: string[];
  isImported: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  search(query: string): Observable<Song[]> {
    return this.http.get<Song[]>(`/api/search?q=${encodeURIComponent(query)}`);
  }

  clonePlaylist(url: string): Observable<Playlist> {
    return this.http.post<Playlist>('/api/playlists/clone', { url });
  }
}
