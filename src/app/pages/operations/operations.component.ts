import { DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform } from '@angular/core';
import { BehaviorSubject, debounceTime, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styles: [],
  providers: [DecimalPipe]
})
export class OperationsComponent implements OnInit {
  public _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  public _operations$ = new BehaviorSubject<Operation[]>([]);
  public _collectionSize$ = new BehaviorSubject<number>(0);
  private operationsFetch: Operation[]
  public searchTerm: string = ''

  public page = 1;
  public pageSize = 10;

  public radioDef = '1M';
  public filter = {
    close: true,
    open: false
  }

  constructor(
    private webService: WebService,
    private pipe: DecimalPipe
  ) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._operations$.next(result.operations)
      this._collectionSize$.next(result.size)
    })
  }

  public async getData(period?: "1M" | "1Y" | "5Y") {
    this.operationsFetch = await this.webService.getAllOperations(period)
    this.refreshTable()
  }

  public refreshTable() {
    this._search$.next()
  }

  private _search(): Observable<{ operations: Operation[], size: number }> {

    let operations = this.operationsFetch
    operations = operations.filter(op => (op.operation_type == "CLOSE" && this.filter.close) || (op.operation_type == "OPEN" && this.filter.open))
    operations = operations.filter(op => this.matches(op, this.searchTerm, this.pipe))

    const size = operations.length

    operations = operations.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)

    return of({ operations, size })
  }

  private matches(operation: Operation, term: string, pipe: PipeTransform) {
    return operation.id.toString().includes(term) || operation.uname.toLowerCase().includes(term.toLowerCase()) || operation.turn_name.toLowerCase().includes(term.toLowerCase()) || operation.observations!.toLowerCase().includes(term.toLowerCase()) || operation.helper_uname?.toLowerCase().includes(term.toLowerCase())
  }

  ngOnInit(): void {
    this.getData()
  }

}
