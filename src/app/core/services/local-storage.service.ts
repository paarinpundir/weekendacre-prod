import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly prefix = 'eco_adventure_park_';

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(this.prefix + key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  setObject(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      this.setItem(key, serialized);
    } catch (error) {
      console.error('Error saving object to localStorage:', error);
    }
  }

  getObject(key: string): any | null {
    try {
      const item = this.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading object from localStorage:', error);
      return null;
    }
  }
}
