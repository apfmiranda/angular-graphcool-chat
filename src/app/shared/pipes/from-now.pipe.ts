import { AppConfigService } from './../../core/services/app-config.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fromNow'
})
export class FromNowPipe implements PipeTransform {

  constructor(
    private appConfigService: AppConfigService
  ) {}

  transform(date: string, args?: any): any {
    return timeDifferenceForDate(date, this.appConfigService.timeDifference);
  }

}

function getTimeDifference(current: number, previous: number) {
  const milliSecondsPerMinute = 60 * 1000;
  const milliSecondsPerHour   = milliSecondsPerMinute * 60;
  const milliSecondsPerDay    = milliSecondsPerHour * 24;
  const milliSecondsPerYear   = milliSecondsPerDay * 365;
  const milliSecondsPerMonth  = milliSecondsPerDay * 30;

  const elapsed = current - previous;

  if (elapsed < milliSecondsPerMinute / 3) {
    return 'agora';
  }

  if (elapsed < milliSecondsPerMinute) {
    return 'menos de 1 min atrás';
  } else if (elapsed < milliSecondsPerHour) {
    return Math.round(elapsed / milliSecondsPerMinute) + ' min atrás';
  } else if (elapsed < milliSecondsPerDay) {
    const h = Math.round(elapsed / milliSecondsPerHour);
    return  h + ` hora${(h > 1) ? 's' : ''} atrás`;
  } else if (elapsed < milliSecondsPerMonth) {
    const d = Math.round(elapsed / milliSecondsPerDay)
    return d + ` dia${(d > 1 ? 's' : '')} atrás`;
  } else if (elapsed < milliSecondsPerYear) {
    const m = Math.round(elapsed / milliSecondsPerMonth);
    return m + ` mês${(m > 1 ? 'es' : '')} atrás`;
  } else {
    const a = Math.round(elapsed / milliSecondsPerYear);
    return a + ` ano${(a > 1 ? 's' : '')} atrás`;
  }
}

function timeDifferenceForDate(date: string, timeDifference: number) {
  const now = new Date().getTime() + timeDifference;
  const updated = new Date(date).getTime();
  return getTimeDifference(now, updated);
}
