import { Pipe, Component, OnInit, PipeTransform } from "@angular/core";
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from "@ng-bootstrap/ng-bootstrap";
import { WebService } from "src/app/services/web.service";
// import * as Chart from "chart.js";

@Pipe({
  name: 'byuname'
})
export class OpByUname implements PipeTransform {

  transform(value: OperationsReport[], userUuid: string): unknown {

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

  public gasAverage: number = 0;
  public turns: Turns[];
  private lastTurn: string;
  private pumpsGasSold: { id: number, PUMPS_M3_SOLD: number, timestamp: string }[]
  private dailyReportbyTurns: { turn: string, schedule: string, dailyOperations: OperationsReport[] }[]
  public operationsReport: OperationsReport[]
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
    await this.apiDataGet()
    await this.getLastOperationStatus()
    console.info('Carga Finalizada')
    this.dailySalesChart()
    this.gasSoldChart()
    this.reportsChart()
    this.prodpumpsChart()
  }
  public async apiDataGet() {
    return Promise.all([
      this.getTurns(),
      this.getDailyReportbyTurns(),
      this.getOperationsReport(),
      this.getEmployeeSummary(),
      this.getGasSoldData()
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
  private async getEmployeeSummary() {
    return this.webService.getOperationsSumarybyEmployee(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      .then((res: OperationsEmployeeSummary[]) => {
        this.employeeSummary = res
      })
  }
  public async getOperationsReport() {
    return this.webService.getOperationReport(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      .then(or => {
        this.operationsReport = or
      })
  }
  public async getLastOperationStatus() {
    return this.webService.getLastOperationDash()
      .then(lastOp => {
        this.lastOperation = lastOp;
        this.lastOpDate = new Date()
      })
  }
  public async getDailyReportbyTurns() {
    this.webService.getDailybyTurnsReport(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      .then(res => {
        this.dailyReportbyTurns = res
      })
  }
  public async getGasSoldData() {
    return this.webService.getPumpsGasSold(this.formatter.format(this.fromDate), this.formatter.format(this.toDate))
      .then(gs => {
        this.pumpsGasSold = gs
      })
  }
  //CHARTS
  public dailySalesChart() {
    var gradientBarChartConfiguration: ChartOptions = {
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
    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

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
              return { t: o.turn_name == this.lastTurn ? dt.setDate(dt.getDate() - 1) : dt, y: (+(o.PRODUCT_AMOUNT_SOLD ?? 0) + +(o.PUMPS_AMOUNT_SOLD ?? 0)) }
            })
          }
        })
      },
      options: gradientBarChartConfiguration
    });
  }
  public gasSoldChart() {
    var gradientChartOptionsConfigurationWithTooltipRed: ChartOptions = {
      maintainAspectRatio: false,
      legend: {
        display: false
      },

      tooltips: {
        callbacks: {
          title: () => `Total diario`,
          label: (tooltipItem, data) => {
            var label = `${tooltipItem.yLabel}[m³]`
            return label
          }
        },
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: false,
        position: "nearest"
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
            min: 0,
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],

        xAxes: [{
          distribution: 'linear',
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'HH:mm[hs]',
          },
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    this.canvas = <HTMLCanvasElement>document.getElementById("chartLineRed");
    this.ctx = this.canvas.getContext("2d");

    var gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors

    var data = {
      datasets: [{
        label: "Cantidad",
        fill: true,
        backgroundColor: gradientStroke,
        borderColor: '#ec250d',
        borderWidth: 2,
        borderDash: [],
        borderDashOffset: 0.0,
        pointBackgroundColor: '#ec250d',
        pointBorderColor: 'rgba(255,255,255,0)',
        pointHoverBackgroundColor: '#ec250d',
        pointBorderWidth: 20,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: this.pumpsGasSold.map(op => {
          this.gasAverage += +op.PUMPS_M3_SOLD
          return { t: op.timestamp, y: +op.PUMPS_M3_SOLD }
        })
      }]
    };
    this.gasAverage = this.gasAverage / this.pumpsGasSold.length
    this.gasAverage= Math.round(this.gasAverage*100)/100
    this.chartGasSold = new Chart(this.ctx, {
      type: 'line',
      data: data,
      options: gradientChartOptionsConfigurationWithTooltipRed
    });
  }
  public reportsChart() {
    var gradientChartOptionsConfigurationWithTooltipPurple: ChartOptions = {
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
          label: (tooltipItem, data) => {
            return `${data.datasets[tooltipItem.datasetIndex].label}:$${Math.round(+tooltipItem.yLabel * 100) / 100}`
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
            suggestedMin: 60,
            suggestedMax: 125,
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],

        xAxes: [{
          offset: true,
          distribution: 'linear',
          type: 'time',
          time: {
            unit: 'day',
            round: 'day',
            tooltipFormat: 'DD/MM/YY HH:mm[hs]'
          },
          gridLines: {
            drawBorder: false,
            color: 'rgba(225,78,202,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };

    this.canvas = <HTMLCanvasElement>document.getElementById("CountryChart");
    this.ctx = this.canvas.getContext("2d");

    var gradientStroke = this.ctx.createLinearGradient(0, 220, 0, 0);

    gradientStroke.addColorStop(1, 'rgba(46,204,113,0.8)');
    gradientStroke.addColorStop(0.5, 'rgba(30,30,30,0.0)');
    gradientStroke.addColorStop(0, 'rgba(231,76,60,0.8)');
    var config: ChartConfiguration = {
      type: 'bar',
      data: {
        datasets: this.turns.map((t, i) => {
          return {
            label: `${t.name}`,
            fill: true,
            backgroundColor: gradientStroke,
            borderColor: this.borderColors[i],
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: this.borderColors[i],
            pointBorderColor: 'rgba(255,255,255,0)',
            pointHoverBackgroundColor: '#909497',
            pointBorderWidth: 20,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 15,
            pointRadius: 4,
            data: this.operationsReport.filter(ot => { return ot.turn_name == t.name }).map(ot => {
              let dt = new Date(ot.timestamp)
              return { t: ot.turn_name == this.lastTurn ? dt.setDate(dt.getDate() - 1) : dt, y: (+ot.REPORT - (+ot.PRODUCT_AMOUNT_SOLD + +ot.PUMPS_AMOUNT_SOLD)) }
            }),
          }
        })
      },
      options: gradientChartOptionsConfigurationWithTooltipPurple
    };
    this.chartReports = new Chart(this.ctx, config);
  }
  public prodpumpsChart() {
    var gradientChartOptionsConfigurationWithTooltipGreen: ChartOptions = {
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
            fontColor: "#9e9e9e"
          }
        }]
      }
    };

    this.canvas = <HTMLCanvasElement>document.getElementById("chartLineGreen");
    this.ctx = this.canvas.getContext("2d");


    var gradientStrokeGreen = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStrokeGreen.addColorStop(1, 'rgba(0,214,180,0.15)');
    gradientStrokeGreen.addColorStop(0.4, 'rgba(0,214,180,0.0)'); //green colors
    gradientStrokeGreen.addColorStop(0, 'rgba(0,214,180,0)'); //green colors

    var gradientStrokePink = this.ctx.createLinearGradient(0, 230, 0, 50);

    gradientStrokePink.addColorStop(1, 'rgba(214,0,214,0.15)');
    gradientStrokePink.addColorStop(0.4, 'rgba(214,0,214,0.0)'); //green colors
    gradientStrokePink.addColorStop(0, 'rgba(214,0,214,0)'); //green colors

    var backgrounds = ['#00d6b4', '#d600d6']

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
          label: "Surtidores",
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
            return { t: op.timestamp, y: +op.PUMPS_AMOUNT_SOLD }
          }),
        }
        ]
      },
      options: gradientChartOptionsConfigurationWithTooltipGreen
    });
  }

  public updateDataandCharts() {
    this.apiDataGet().then(
      () => {
        this.chartDailySales.destroy()
        this.chartGasSold.destroy()
        this.chartProdPumps.destroy()
        this.chartReports.destroy()
        this.dailySalesChart()
        this.gasSoldChart()
        this.reportsChart()
        this.prodpumpsChart()
        console.info('Datos Actualizados')
      }
    )
  }

  ngOnInit() {
    this.init()
  }
}
