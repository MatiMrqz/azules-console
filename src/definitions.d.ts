interface Products {
    id: number,
    name: string,
    description?: string,
    category_id?: Categories["id"],
    hidden: boolean,
    last_change: Date,
    stock: number,
    unit_price: number
}
interface DetailProducts extends Products{
    category:Categories['name'],
    init_stock:number,
    items_sold?:number,
    items_replacement?:number,
    amount_sold?:number

}
interface Categories {
    id: number,
    name: string,
    description: string
}
interface PumpType {
    id: number,
    name: string,
    unit: string
}
interface Pumps {
    id: number,
    description?: string,
    type_id?: PumpType["id"],
    last_update: Date,
    meter: number,
    max_meter_value: number,
    unit_price: number
}
interface DetailPumps extends Pumps{
    description?: string,
    max_meter_value: number,
    unit_price: number,
    pump_id:number,
    type_name:string,
    unit:string,
    init_meter:number,
    meter_diff?:number,
    venting?:number,
    amount_sold?:number
}
interface Employee {
    uuid: string,
    uname: string,
    mail?: string,
    phone?: string,
    address?: string,
    hidden: boolean,
    dt_added: Date,
    dt_modified: Date
}
interface OperationDB {
    id: number,
    operation_type: 'CLOSE' | 'OPEN' | 'CLAIM' | 'FIRST',
    observations?: string,
    timestamp: Date
    turn_name: string,
    turn_schedule: string,
}
interface Operation extends OperationDB{
    employee_id:string,
    uname:string,
    REPORT:number,
    PRODUCT_AMOUNT_SOLD:number,
    PUMPS_AMOUNT_SOLD:number,
}
interface DetailOperationDB extends OperationDB {
    employee_uuid:string,
    uname: string
    mail?: string,
}
interface OperationEmpDB extends DetailOperationDB {
    phone: string,
    address: string,
    id_accountancy: number,
}
interface OperationsReport {
    PRODUCT_AMOUNT_SOLD?: number,
    PUMPS_AMOUNT_SOLD?: number,
    REPORT: number,
    id: number,
    timestamp: Date,
    turn_name?: string,
    uname: string,
    employee_id: string
}
interface OperationsEmployeeSummary {
    N_OP: number,
    employee_id: string,
    uname: string
    REPORT: number,
    PRODUCTS_TOTAL: number,
    PUMPS_TOTAL: number,
}
interface Turns {
    id: number,
    name: string,
    schedule: string
}
interface DetailAccountancy{
    cash:number,
    envelopes_cash:number,
    n_envelopes:number,
    cards:number,
    MercadoPago:number,
    vouchers:number,
    expenses:number,
    others:number
}