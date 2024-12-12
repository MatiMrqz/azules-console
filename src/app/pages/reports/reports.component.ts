import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {

  private eventSource:Subject<boolean>;
  public event$:Observable<boolean>;
  constructor() {
    this.eventSource = new Subject<boolean>()
    this.event$ = this.eventSource.asObservable()
  }

  updateArchiveComponent() {
    console.debug('Updating archive component')
    this.eventSource.next(true)
  }

}
