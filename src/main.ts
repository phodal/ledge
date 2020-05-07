import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// tslint:disable-next-line:variable-name
const __stripTrailingSlash = (Location as any).stripTrailingSlash;
(Location as any).stripTrailingSlash = function _stripTrailingSlash(
  url: string
): string {
  const queryString$ = url.match(/([^?]*)?(.*)/);
  if (queryString$[2].length > 0) {
    return /[^\/]\/$/.test(queryString$[1])
      ? queryString$[1] + '.' + queryString$[2]
      : __stripTrailingSlash(url);
  }
  return /[^\/]\/$/.test(url) ? url + '.' : __stripTrailingSlash(url);
};

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
