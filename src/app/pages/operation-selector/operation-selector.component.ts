import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, switchMap, tap } from 'rxjs';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-operation-selector',
  templateUrl: './operation-selector.component.html',
  styles: [
  ]
})
export class OperationSelectorComponent implements OnInit {
  public rev: Array<{ id: number | null, name: string }>
  public operationId: number
  public selectedId: number
  public selectedId$ = new Subject<number>()
  public operationDetail$: Observable<{ operation: DetailOperationDB, products: Array<DetailProducts>, pumps: Array<DetailPumps>, accountancy: DetailAccountancy }>
  public isLoading: boolean = true
  public isPassed: boolean

  constructor(
    private webService: WebService,
    private route: ActivatedRoute,
  ) { }

  public async getRevisions() {
    this.isLoading = true
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.operationId = id
    return this.webService.getRevisionsHistory(id)
      .then(res => {
        if (res.length > 0) {
          this.rev = res.map(b => {
            return { id: b.backup_operation_id, name: b.revision == 0 ? 'ORIGINAL' : `Revisión Nº${b.revision}` }
          })
          this.rev = [{ id, name: 'Ultima Revisión' }, ...this.rev]
        } else {
          this.rev = [{ id, name: 'ORIGINAL' }]
        }
        this.selectedId$.next(id)
        this.selectedId = id
        this.isLoading = false
      })
  }

  public async getOperation(id) {
    return this.webService.getOperationDetailbyId(id)
      .then(res => {
        console.log(res)
        let operation = res.operation
        this.isPassed = res.operation.passed == 1
        operation.id = this.operationId
        return { rev: this.rev.find(r => r.id == id), operation, ...res }
      })
  }

  public changeId(newId: number) {
    this.selectedId$.next(newId)
    this.selectedId = newId
  }
  ngOnInit(): void {
    this.operationDetail$ = this.selectedId$.pipe(
      switchMap(async (id) => {
        return await this.getOperation(id)
      })
    )
    this.getRevisions()
  }
  public setPassed() {
    this.webService.setOperationPassed(this.operationId)
    .then(()=>{
      this.isPassed=true
    })
    .catch((err)=>console.error(err))
  }
}
