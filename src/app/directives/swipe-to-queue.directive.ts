import { Directive, ElementRef, EventEmitter, Output, OnInit, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[appSwipeToQueue]',
  standalone: true
})
export class SwipeToQueueDirective implements OnInit, OnDestroy {
  @Output() swipeRight = new EventEmitter<void>();
  private hammerManager: unknown;
  private el = inject(ElementRef);

  async ngOnInit() {
    if (typeof window !== 'undefined') {
      const Hammer = (await import('hammerjs')).default;
      this.hammerManager = new Hammer(this.el.nativeElement);
      (this.hammerManager as { on: (event: string, callback: () => void) => void }).on('swiperight', () => {
        this.swipeRight.emit();
      });
    }
  }

  ngOnDestroy() {
    if (this.hammerManager) {
      (this.hammerManager as { destroy: () => void }).destroy();
    }
  }
}
