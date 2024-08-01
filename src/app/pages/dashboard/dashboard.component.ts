import { Pipe, Component, OnInit, PipeTransform } from "@angular/core";
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { WebService } from "src/app/services/web.service";
// import * as Chart from "chart.js";

@Pipe({
  name: 'byuname'
})
export class OpByUname implements PipeTransform {

  transform(value: OperationsReport[], userUuid: string): OperationsReport[] {

    return value.filter(v => {
      return v.employee_id === userUuid
    })
  }
}
@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html",
  styles: [`
  .dp-hidden {
    width: 0;
    margin: 0;
    border: none;
    padding: 0;
  }
  .custom-day {
    text-align: center;
    padding: 0.185rem 0.25rem;
    display: inline-block;
    height: 2rem;
    width: 2rem;
  }
  .custom-day.focused {
    background-color: #e6e6e6;
  }
  .custom-day.range, .custom-day:hover {
    background-color: rgb(2, 117, 216);
    color: white;
  }
  .custom-day.faded {
    background-color: rgba(2, 117, 216, 0.5);
  }
`]
})
export class DashboardComponent implements OnInit {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public datasets: any;
  public data: any;
  private borderColors = ['#00d6b4', '#ffeef1', '#1f8ef1', '#553233', '#3f57d3']

  private chartDailySales: Chart
  private chartGasSold: Chart
  private chartReports: Chart
  private chartProdPumps: Chart


  public turns: Turns[];
  private lastTurn: string;

  private dailyReportbyTurns: { turn: string, schedule: string, dailyOperations: OperationsReport[] }[]
  public operationsReport: OperationsReport[]
  private posDetail: PoSOperationDetail[][];
  public employeeSummary: OperationsEmployeeSummary[]
  public lastOperation: OperationEmpDB = {
    id: 0,
    uname: '-',
    mail: '-',
    phone: '-',
    address: '-',
    employee_uuid: '-',
    operation_type: 'FIRST',
    observations: '-',
    id_accountancy: 0,
    turn_name: '-',
    turn_schedule: '-',
    passed: false,
    timestamp: new Date()
  }
  public lastOpDate: Date;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public hoveredDate: NgbDate | null = null;
  constructor(
    private webService: WebService,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
  ) {
    this.fromDate = calendar.getPrev(calendar.getToday(), 'm', 1)
    this.toDate = calendar.getNext(calendar.getToday());
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
      this.updateDataandCharts()
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  public async init() {
    await this.getLastOperationStatus()
    await this.updateDataandCharts()
  }
  public async getApiData() {
    return Promise.all([
      this.getTurns(),
      this.getDailyReportbyTurns(),
      this.getOperationsReport(),
      this.getDailyOperationsbyPoS()
    ])
  }
  //API GETTER METHODS
  private async getTurns() {
    return this.webService.getTurns()
      .then((turns: Turns[]) => {
        this.turns = turns
        this.lastTurn = turns[turns.length - 1].name ?? ''
      })
  }
  public async getOperationsReport() {
    return this.webService.getOperationReport(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      .then(or => {
        this.operationsReport = or
        this.operationsReportbyEmployee(or)
      })
  }
  public async getDailyOperationsbyPoS(){
    return this.webService.getDailyPoSbyDate(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      .then(res=>{
        this.posDetail=res
      }
      )
  }
  private operationsReportbyEmployee(or: OperationsReport[]) {
    const employees = or.reduce((acc:string[], item) => {
      if (acc.includes(item.employee_id)) {
        return acc
      }
      return acc = [item.employee_id, ...acc]
    }, [])
    this.employeeSummary = employees.map(i => {
      return or.filter(or=>or.employee_id==i)
        .reduce<OperationsEmployeeSummary>((acc:OperationsEmployeeSummary,item:OperationsReport)=>{
          return acc = {
            PRODUCTS_TOTAL: +acc.PRODUCTS_TOTAL + +item.PRODUCT_AMOUNT_SOLD,
            POSOP_TOTAL: +acc.POSOP_TOTAL + +item.POSOP_AMOUNT_SOLD,
            REPORT: +acc.REPORT + +item.REPORT,
            N_OP:acc.N_OP+1,
            employee_id: item.employee_id,
            uname: item.uname
          }
        },{POSOP_TOTAL:0,PRODUCTS_TOTAL:0,REPORT:0,N_OP:0,employee_id:null,uname:null})
    })
  }
  public async getLastOperationStatus() {
    return this.webService.getLastOperationDash()
      .then(lastOp => {
        this.lastOperation = lastOp;
        this.lastOpDate = new Date()
        console.debug('Last op updated')
      })
  }
  public async getDailyReportbyTurns() {
    return this.webService.getDailybyTurnsReport(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      .then(res => {
        this.dailyReportbyTurns = res
      })
  }
  //CHARTS
  public dailySalesChart() {
    let gradientBarChartConfiguration: ChartOptions = {
      maintainAspectRatio: false,
      legend: {
        display: true
      },
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: false,
        position: "nearest",
        callbacks: {
          title: () => 'Monto Vendido',
          label: (tooltipItem, data) => {
            return `${data.datasets[tooltipItem.datasetIndex].label}:$${tooltipItem.yLabel}`
          }
        }
      },
      responsive: true,
      scales: {

        yAxes: [{
          stacked: true,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            // suggestedMin: 100,
            // suggestedMax: 10000,
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }],

        xAxes: [{
          offset: true,
          stacked: true,
          distribution: 'linear',
          type: 'time',
          time: {
            unit: 'day',
            round: 'day',
          },
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }]
      }
    };
    this.canvas = <HTMLCanvasElement>document.getElementById("chartBig1");
    this.ctx = this.canvas.getContext("2d");
    let gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(29,140,248,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(29,140,248,0.0)');
    gradientStroke.addColorStop(0, 'rgba(29,140,248,0)'); //blue colors

    this.chartDailySales = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: this.dailyReportbyTurns.map((turn, i) => {
          return {
            stack: "Daily",
            label: turn.turn,
            fill: true,
            backgroundColor: gradientStroke,
            hoverBackgroundColor: gradientStroke,
            borderColor: this.borderColors[i],
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            data: turn.dailyOperations.map(o => {
              let dt = new Date(o.timestamp)
              return { t: o.turn_name == this.lastTurn ? dt.setDate(dt.getDate() - 1) : dt, y: (+(o.PRODUCT_AMOUNT_SOLD ?? 0) + +(o.POSOP_AMOUNT_SOLD ?? 0)) }
            })
          }
        })
      },
      options: gradientBarChartConfiguration
    });
    console.log(this.chartDailySales.config.data.datasets)
  }
  public reportsChart() {
    let gradientChartOptionsConfigurationWithTooltipGreen: ChartOptions = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: false,
        position: "nearest",
        callbacks: {
          label: (tooltipItem, data) => {
            return `${data.datasets[tooltipItem.datasetIndex].label}:$${tooltipItem.yLabel}`
          }
        }
      },
      responsive: true,
      scales: {
        yAxes: [{
          // barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 50,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }],

        xAxes: [{
          // barPercentage: 1.6,
          type: 'time',
          distribution: 'linear',
          stacked: true,
          time: {
            parser: (t)=> new Date(t*1000),
            unit: 'day',
            tooltipFormat: '[Ventas] DD/MM/YY HH:mm[hs]'
          },
          gridLines: {
            drawBorder: false,
            color: 'rgba(0,242,195,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    this.canvas = <HTMLCanvasElement>document.getElementById("PoSChart");
    this.ctx = this.canvas.getContext("2d");

    const genGradient = (hexColor:string) => {
      const gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

      gradientStroke.addColorStop(1, hexColor+'11');
      gradientStroke.addColorStop(0.4, hexColor+'00'); //green colors
      gradientStroke.addColorStop(0, hexColor+'00');
      return gradientStroke
    }

    let backgrounds = ['#00d6b4', '#d600d6']

    this.chartProdPumps = new Chart(this.ctx, {
      type: 'line',
      data: {
        datasets: 
        this.posDetail.map((pos,i) => ({
          label: pos[0].name,
          fill: true,
          backgroundColor: genGradient(backgrounds[i]),
          borderColor: backgrounds[i],
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: backgrounds[i],
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: backgrounds[i],
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: pos.map(op => ({t: op.timestamp, y: +op.amount_sold}))
        }))
      },
      options: gradientChartOptionsConfigurationWithTooltipGreen
    });
  }
  public prodPoSChart() {
    let gradientChartOptionsConfigurationWithTooltipGreen: ChartOptions = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: false,
        position: "nearest",
        callbacks: {
          label: (tooltipItem, data) => {
            return `${data.datasets[tooltipItem.datasetIndex].label}:$${tooltipItem.yLabel}`
          }
        }
      },
      responsive: true,
      scales: {
        yAxes: [{
          // barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: 50,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }],

        xAxes: [{
          // barPercentage: 1.6,
          type: 'time',
          distribution: 'linear',
          stacked: true,
          time: {
            parser: (t)=> new Date(t*1000),
            unit: 'day',
            tooltipFormat: '[Ventas] DD/MM/YY HH:mm[hs]'
          },
          gridLines: {
            drawBorder: false,
            color: 'rgba(0,242,195,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    this.canvas = <HTMLCanvasElement>document.getElementById("chartLineGreen");
    this.ctx = this.canvas.getContext("2d");


    let gradientStrokeGreen = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStrokeGreen.addColorStop(1, 'rgba(0,214,180,0.15)');
    gradientStrokeGreen.addColorStop(0.4, 'rgba(0,214,180,0.0)'); //green colors
    gradientStrokeGreen.addColorStop(0, 'rgba(0,214,180,0)'); //green colors

    let gradientStrokePink = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStrokePink.addColorStop(1, 'rgba(214,0,214,0.15)');
    gradientStrokePink.addColorStop(0.4, 'rgba(214,0,214,0.0)'); //green colors
    gradientStrokePink.addColorStop(0, 'rgba(214,0,214,0)'); //green colors

    let backgrounds = ['#00d6b4', '#d600d6']

    this.chartProdPumps = new Chart(this.ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: "Productos",
          fill: true,
          backgroundColor: gradientStrokeGreen,
          borderColor: backgrounds[0],
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: backgrounds[0],
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: backgrounds[0],
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: this.operationsReport.map(op => { return { t: op.timestamp, y: +op.PRODUCT_AMOUNT_SOLD } }),
        },
        {
          label: "Puntos de Venta",
          fill: true,
          backgroundColor: gradientStrokePink,
          borderColor: backgrounds[1],
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: backgrounds[1],
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: backgrounds[1],
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: this.operationsReport.map(op => {
            return { t: op.timestamp, y: +op.POSOP_AMOUNT_SOLD }
          }),
        }
        ]
      },
      options: gradientChartOptionsConfigurationWithTooltipGreen
    });
  }

  public async updateDataandCharts() {
    return this.getApiData().then(
      () => {
        this.chartDailySales?.destroy()
        this.chartGasSold?.destroy()
        this.chartProdPumps?.destroy()
        this.chartReports?.destroy()
        this.dailySalesChart()
        this.reportsChart()
        this.prodPoSChart()
        console.debug('Charts updated')
      }
    )
  }

  ngOnInit() {
    this.init()
  }
}
