import { Component, Input, input, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, debounceTime, delay, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { WebService } from 'src/app/services/web.service';

interface SearchResult{
  items:Array<ArchiveOperations & { id: number }>
  total:number
}

function matches(item: ArchiveOperations, term?: string) {
	return (
    term ?
    (item.name.toLowerCase().includes(term?.toLowerCase())
    ||
    item.lastModified.toLocaleString().includes(term.toLowerCase()))
    :
    true
	);
}

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
  public searchTerm$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public reportsArchive: ArchiveOperations[]
  private reportsArchivePage$ = new BehaviorSubject<Array<ArchiveOperations & { id: number }>>([]);
  get reportsArchivePageItems$() { return this.reportsArchivePage$.asObservable() }

  public pagination={
    page:1,
    pageSize:5,
  }

  private collectionSize$ = new BehaviorSubject<number>(0);
  get collectionSize() { return this.collectionSize$.asObservable() }
  private _search$ = new Subject<string|undefined>();

  set search(value: string) {
    this._search$.next(value)
  }
  set page(value: number) {
    this.pagination.page=value
    this._search$.next(this.searchTerm$.value)
  }
  set pageSize(value: number) {
    this.pagination.pageSize=value
    this._search$.next(this.searchTerm$.value)
  }
  get page() { return this.pagination.page }
  get pageSize() { return this.pagination.pageSize }

  constructor(
    private readonly webService: WebService
  ) {
    this._search$
      .pipe(
        debounceTime(200),
        switchMap((search)=>this._search(search)),
        delay(200)
      )
      .subscribe(res=>{
        this.reportsArchivePage$.next(res.items)
        this.collectionSize$.next(res.total)
      })
    // this.getData()
  }
  public async getData() {
    this._loading$.next(true)
    this.reportsArchive = await this.webService.getReportsArchiveList()
    this._search$.next(undefined)
    this._loading$.next(false)
  }
  private _search(searchTerm?:string):Observable<SearchResult>{
    //filter
    this.searchTerm$.next(searchTerm)
    let archives = this.reportsArchive.filter(item=>matches(item,searchTerm)).map<ArchiveOperations&{id:number}>((a,i)=>({id:i+1,...a}))
    const total = archives.length
    //paginate
    archives = archives.slice((this.pagination.page - 1) * this.pagination.pageSize, (this.pagination.page - 1) * this.pagination.pageSize + this.pagination.pageSize)
    return of({items:archives,total})
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
