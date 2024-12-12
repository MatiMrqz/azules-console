import { Component, output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, filter, map, merge, Observable, OperatorFunction, Subject } from 'rxjs';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'reports-new-report',
  templateUrl: './new-report.component.html',
  styleUrl: './new-report.component.scss'
})
export class NewReportComponent {
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  reportGenerated = output<void>();
  constructor(
    private readonly webService: WebService,
    private readonly calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
  ) {

    this.fromDate.valueChanges.subscribe(_ => {
      this.onValidDateSelected(this.fromDate, this.toDate)
    })
    this.toDate.valueChanges.subscribe(_ => {
      this.onValidDateSelected(this.fromDate, this.toDate)
    })
    this.getReportForm.valueChanges.subscribe(res => {
      this.updateButtonStatus(this.getReportForm.valid, this.retrieveReportButton)
    })
  }
  public lastOpDate: Date;
  public hoveredDate: NgbDate | null = null;

  public employees: Pick<Employee, "uuid" | "uname">[] = []
  public loading: boolean = false;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  public getReportForm = new FormGroup({
    fromDate: new FormControl<NgbDate>(null, [Validators.required, this.validDate()]),
    toDate: new FormControl<NgbDate | null>(null, [Validators.required, this.validDate()]),
    selectedEmployee: new FormControl<Pick<Employee, "uuid" | "uname"> | null>({ value: null, disabled: true }, [this.validEmployee()]),
    retrieveReportButton: new FormControl({ value: 'Obtener reporte', disabled: true })
  })

  get fromDate() { return this.getReportForm.get('fromDate') }
  get toDate() { return this.getReportForm.get('toDate') }
  get selectedEmployee() { return this.getReportForm.get('selectedEmployee') }
  get retrieveReportButton() { return this.getReportForm.get('retrieveReportButton') }

  private updateButtonStatus(validForm: boolean, control: AbstractControl) {
    if (validForm && control.disabled) {
      control.enable({ emitEvent: false });
    } else if (this.getReportForm.invalid && control.enabled) {
      control.disable({ emitEvent: false })
    }
  }
  private onValidDateSelected(controlFrom: AbstractControl<NgbDate>, controlTo: AbstractControl<NgbDate>) {
    if (controlFrom.valid && controlTo.valid) {
      this.getEmployees(this.formatter.format(controlFrom.value), this.formatter.format(controlTo.value))
        .then(emp => {
          this.employees = emp
          this.selectedEmployee.enable({ emitEvent: false })
          this.updateButtonStatus(this.getReportForm.valid, this.retrieveReportButton)
        })
    } else if (this.selectedEmployee.enabled) {
      this.selectedEmployee.disable()
      this.updateButtonStatus(this.getReportForm.valid, this.retrieveReportButton)
    }
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate.value && !this.toDate.value) {
      this.fromDate.setValue(date);
    } else if (this.fromDate.value && !this.toDate.value && date.after(this.fromDate.value)) {
      this.toDate.setValue(date);
    } else {
      this.toDate.setValue(null);
      this.fromDate.setValue(date);
    }
  }

  private async getEmployees(from: string, to: string): Promise<Pick<Employee, "uuid" | "uname">[]> {
    this.loading = true
    return this.webService.getEmployeesBetweenOperationsDates(from, to)
      .then(emp => {
        this.loading = false
        return [{ uname: "Todos", "uuid": "1" }, ...emp]
      })
      .catch(err => {
        console.error(err)
        this.loading = false
        return [{ uname: "Todos", "uuid": "1" }]
      })
  }

  isHovered(date: NgbDate) {
    return this.fromDate.value && !this.toDate.value && this.hoveredDate && date.after(this.fromDate.value) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate.value) && date.before(this.toDate.value);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate.value) || (this.toDate.value && date.equals(this.toDate.value)) || this.isInside(date) || this.isHovered(date);
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  private validDate(): ValidatorFn {
    return (control: AbstractControl<NgbDate | null>): ValidationErrors | null => {
      return this.calendar.isValid(control.value) ? null : { 'invalidDate': { value: control.value } };
    }
  }
  private validEmployee(): ValidatorFn {
    return (control: AbstractControl<Pick<Employee, "uuid" | "uname"> | null>): ValidationErrors | null => {
      return this.employees.some(e => e.uuid === control.value?.uuid) ? null : { 'invalidEmployee': { value: control.value } };
    }
  }

  searchEmployee: OperatorFunction<string, readonly Pick<Employee, "uuid" | "uname">[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term: string) =>
        (term === '' ? this.employees : this.employees.filter((v: Employee) => v.uname.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10),
      ),
    );
  };
  employeeInputFormatter = (r: Employee) => r.uname;

  submitForm() {
    if (this.getReportForm.invalid) console.error('Form invalid')
    this.retrieveReportButton.setValue('Generando reporte...')
    this.retrieveReportButton.disable({ emitEvent: false })
    if (this.selectedEmployee.value.uuid !== '1') {
    this.webService.getXlsxReportByEmployee(this.formatter.format(this.fromDate.value), this.formatter.format(this.toDate.value), this.selectedEmployee.value)
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedEmployee.value.uname}_${this.formatter.format(this.fromDate.value)}_${this.formatter.format(this.toDate.value)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.getReportForm.reset({ retrieveReportButton: 'Obtener reporte' })
        this.selectedEmployee.disable({ emitEvent: false })
        this.updateButtonStatus(this.getReportForm.valid, this.retrieveReportButton)
        this.reportGenerated.emit()
      })
      .catch(err => {
        console.error(err)
      })
    } else{
      this.webService.getXlsxReportGral(this.formatter.format(this.fromDate.value), this.formatter.format(this.toDate.value))
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GRAL_${this.formatter.format(this.fromDate.value)}_${this.formatter.format(this.toDate.value)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.getReportForm.reset({ retrieveReportButton: 'Obtener reporte' })
        this.selectedEmployee.disable({ emitEvent: false })
        this.updateButtonStatus(this.getReportForm.valid, this.retrieveReportButton)
        this.reportGenerated.emit()
      })
      .catch(err => {
        console.error(err)
      })
    }
  }
}
