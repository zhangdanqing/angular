import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {LocationStrategy} from 'angular2/src/router/location_strategy';


export class MockLocationStrategy extends LocationStrategy {
  internalBaseHref: string = '/';
  internalPath: string = '/';
  internalTitle: string = '';
  urlChanges: string[] = [];
  /** @internal */
  _subject: EventEmitter<any> = new EventEmitter();
  constructor() { super(); }

  simulatePopState(url: string): void {
    this.internalPath = url;
    ObservableWrapper.callEmit(this._subject, null);
  }

  path(): string { return this.internalPath; }

  prepareExternalUrl(internal: string): string {
    if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
      return this.internalBaseHref + internal.substring(1);
    }
    return this.internalBaseHref + internal;
  }

  simulateUrlPop(pathname: string): void {
    ObservableWrapper.callEmit(this._subject, {'url': pathname});
  }

  pushState(ctx: any, title: string, path: string, query: string): void {
    this.internalTitle = title;

    var url = path + (query.length > 0 ? ('?' + query) : '');
    this.internalPath = url;

    var external = this.prepareExternalUrl(url);
    this.urlChanges.push(external);
  }

  onPopState(fn: (value: any) => void): void { ObservableWrapper.subscribe(this._subject, fn); }

  getBaseHref(): string { return this.internalBaseHref; }

  back(): void {
    if (this.urlChanges.length > 0) {
      this.urlChanges.pop();
      var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
      this.simulatePopState(nextUrl);
    }
  }

  forward(): void { throw 'not implemented'; }
}
