import {Routes} from '@angular/router';
import {Component} from '@angular/core';

@Component({
  selector: 'app-dummy',
  template: ''
})
export class DummyComponent {}

export const routes: Routes = [
  { path: '**', component: DummyComponent }
];
