import {
  Directive,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ViewContainerRef,
  DynamicComponentLoader,
  ComponentRef,
  OnDestroy,
  ElementRef
} from 'angular2/core';
import {ConfirmPopover} from './confirmPopover.component';

@Directive({
  selector: '[mwl-confirm]'
})
export class Confirm implements OnDestroy {

  @Input() title: string;
  @Input() message: string;
  @Input() confirmText: string;
  @Input() cancelText: string;
  @Input() placement: string;
  @Input() confirmButtonType: string;
  @Input() cancelButtonType: string;
  @Input() isDisabled: boolean = false;
  @Output() confirm: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();
  popover: Promise<ComponentRef> = null;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private loader: DynamicComponentLoader,
    private elm: ElementRef
  ) {}

  _showPopover(): void {
    if (!this.popover && !this.isDisabled) {
      this.popover = this.loader.loadNextToLocation(ConfirmPopover, this.viewContainerRef).then((popover: ComponentRef) => {
        popover.instance.title = this.title;
        popover.instance.message = this.message;
        popover.instance.confirmText = this.confirmText;
        popover.instance.cancelText = this.cancelText;
        popover.instance.placement = this.placement;
        popover.instance.confirmButtonType = this.confirmButtonType;
        popover.instance.cancelButtonType = this.cancelButtonType;
        popover.instance.confirm = this.confirm;
        popover.instance.cancel = this.cancel;
        return popover;
      });
    }
  }

  _hidePopover(): void {
    if (this.popover) {
      this.popover.then((popoverComponent: ComponentRef) => {
        popoverComponent.destroy();
        this.popover = null;
      });
    }
  }

  @HostListener('window:resize')
  _onResize(): void {
    // TODO - re-position the popover
  }

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchend', ['$event'])
  _onDocumentClick(event: MouseEvent): void {;

    // TODO - replace with: `this.renderer.invokeElementMethod(this.elm.nativeElement, 'contains', [event.target])`
    // Pending on https://github.com/angular/angular/issues/8386

    if (this.popover && !this.elm.nativeElement.contains(event.target)) {
      this.popover.then((popover: ComponentRef) => {
        if (!popover.location.nativeElement.contains(event.target)) {
          this._hidePopover();
        }
      });
    }
  }

  @HostListener('click')
  _togglePopover(): void {
    if (!this.popover) {
      this._showPopover();
    } else {
      this._hidePopover();
    }
  }

  ngOnDestroy(): void {
    this._hidePopover();
  }

}