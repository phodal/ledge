import { Injectable } from '@angular/core';

@Injectable()
export class LedgeStorageService {
  get storage() {
    return window.localStorage;
  }

  getItem(key: string) {
    const json = this.storage.getItem(key);
    return json ? JSON.parse(json) : {};
  }

  getItemString(key: string) {
    return this.storage.getItem(key);
  }

  setItemString(key: string, value: string) {
    return this.storage.setItem(key, value);
  }

  setItem(key: string, value: string | object) {
    const storageValue = value ? JSON.stringify(value) : '';
    return this.storage.setItem(key, storageValue);
  }
}
