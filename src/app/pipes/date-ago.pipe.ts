import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: false
})
export class DateAgoPipe implements PipeTransform {
  private returnValue: string;
  private lastUpdate = undefined
  private lastValue
  transform(value: any, args?: any): any {
    if (value != this.lastValue) {
      this.lastUpdate = undefined
      this.lastValue = value
    }
    if (value && (this.lastUpdate === undefined || this.secondsCounter(this.lastUpdate) > 30)) {
      this.lastUpdate = new Date()
      const seconds = this.secondsCounter(value)
      if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
      {
        this.returnValue = 'en este momento'
        return this.returnValue
      }
      const intervals = {
        'año': 31536000,
        'mes': 2592000,
        'semana': 604800,
        'dia': 86400,
        'hora': 3600,
        'minuto': 60,
        'segundo': 1
      };
      let counter;
      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0)
          if (counter === 1) {
            this.returnValue = 'hace ' + counter + ' ' + i; // singular (1 day ago)
            return 'hace ' + counter + ' ' + i; // singular (1 day ago)
          } else {
            this.returnValue = 'hace ' + counter + ' ' + i + 's'; // plural (2 days ago)
            return 'hace ' + counter + ' ' + i + 's'; // plural (2 days ago)
          }
      }
    }
    else if (!!this.lastUpdate) {
      return this.returnValue
    }
    return value;
  }

  private secondsCounter(dateIn: Date) {
    return Math.floor((+new Date() - +new Date(dateIn)) / 1000);
  }
}