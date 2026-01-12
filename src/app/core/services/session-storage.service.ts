import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly prefix = 'eco_adventure_park_';

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(this.prefix + key);
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  setObject(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      this.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving object to sessionStorage:', error);
    }
  }

  getObject(key: string): any | null {
    try {
      const item = this.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading object from sessionStorage:', error);
      return null;
    }
  }
}

