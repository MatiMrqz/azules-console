import { Component, Input, input } from '@angular/core';
import { BehaviorSubject, debounceTime, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'reports-archive',
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent {
  @Input() public set refreshTrigger(value: any) {
    this.getData()
  }
  public _loading$ = new BehaviorSubject<boolean>(true);
  public reportsArchive: ArchiveOperations[]
  public reportsArchivePageItems: Array<ArchiveOperations & { id: number }>

  public page = 1;
  public pageSize = 5;
  public collectionSize = 0;

  constructor(
    private readonly webService: WebService
  ) {
    // this.getData()
  }
  public async getData() {
    this._loading$.next(true)
    this.reportsArchive = await this.webService.getReportsArchiveList()
    this.collectionSize = this.reportsArchive.length
    this.refreshTable()
    this._loading$.next(false)
  }
  refreshTable() {
    this.reportsArchivePageItems = this.reportsArchive.map((o, i) => ({ id: i + 1, ...o }))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize)
  }
  downloadFile(file: ArchiveOperations) {
    this.webService.getReportFile(file.key)
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name}`;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error(err)
      })
  }
}
