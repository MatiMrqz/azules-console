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
interface DetailProducts extends Products {
    category: Categories['name'],
    init_stock: number,
    items_sold?: number,
    items_replacement?: number,
    amount_sold?: number

}
interface Categories {
    id: number,
    name: string,
    description: string
}
interface PumpType {
    id: number,
    name: string,
    unit: string,
    itc: number
}
interface Pumps {
    id: number,
    description?: string,
    type_id?: PumpType["id"],
    type_name?: PumpType["name"],
    unit?: PumpType["unit"],
    itc?: PumpType["itc"],
    last_update: Date,
    meter: number,
    max_meter_value: number,
    unit_price: number
}
interface DetailPumps extends Pumps {
    description?: string,
    max_meter_value: number,
    unit_price: number,
    pump_id: number,
    type_name: string,
    unit: string,
    init_meter: number,
    meter_diff?: number,
    venting?: number,
    amount_sold?: number
}
interface Admin {
    uuid: string,
    fname: string,
    mail?: string,
    role: 'ADMIN'
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
interface Helper {
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
interface Operation extends OperationDB {
    employee_id: string,
    uname: string,
    helper_id: string,
    helper_uname: string,
    passed: boolean,
    GRAL_METER_DIFF: number,
    REPORT: number,
    PRODUCT_AMOUNT_SOLD: number,
    PUMPS_AMOUNT_SOLD: number,
    M3_SOLD: number
}
interface DetailOperationDB extends OperationDB {
    employee_uuid: string,
    uname: string,
    helper_uuid?: string,
    helper_uname?: string,
    mail?: string,
    id_accountancy: number,
    passed: number | boolean,
    admin_name?: string | null,
    updated_on?: Date
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
    M3_SOLD: number,
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
    M3_SOLD: number
}
interface Turns {
    id: number,
    name: string,
    schedule: string
}
interface DetailAccountancy {
    cash: number,
    envelopes_cash: number,
    n_envelopes: number,
    cards: number,
    MercadoPago: number,
    vouchers: number,
    expenses: number,
    others: number
}
interface OperationBackup {
    backup_operation_id: number,
    revision: number,
}
interface InvoiceRecord {
    n: number,
    amount: string,
    voucher_type: number,
    identifier: number,
    id_type: number,
    user_name: string,
    business_name: string,
    CAE: string,
    CAE_exp_date: Date,
    performed_by_mode: 'AUTO' | 'MANUAL',
    performed_by: string,
    performed_by_role: 'ADMIN' | 'EMP',
    timestamp: Date
}
interface InvoiceVoucherTypes {
    Id: number,
    Desc: string,
    FchDesde: string,
    FchHasta: string | null
}
interface InvoiceClient {
    n: number,
    identifier: number,
    id_type: number,
    user_name?: string,
    business_name?: string,
    tax_address: string,
    person: "FISICA" | "JURIDICA",
    voucher_preference: number,
    phone?: string,
    email?: string
}
interface AfipTypes {
    Id: number,
    Desc: string,
    FchDesde: string,
    FchHasta: string
}
interface ItemInvoice {
    description: string,
    quantity: number,
    net_unit_price: number,
    unit_price: number,
    discountPercent?: string,
    unit?: string,
    aliquot: {
        aliquotType: number,
        aliquotPercent: string
        aliquotUnitAmount?: number
    }[],
    subtotal: number
}
interface VoucherAfipData {
    CbteDesde: number
    CbteFch: number
    CbteHasta: number
    Concepto: number
    DocNro: number
    DocTipo: number
    ImpIVA: number
    ImpOpEx: number
    ImpTotConc: number
    ImpTotal: number
    ImpNeto: number
    ImpTrib: number
    Iva: { BaseImp: number, Id: number, Importe: number }[]
    MonCotiz: number
    MonId: string
}
interface VoucherEmitterData {
    company: { name: string, mail: string }
    legals: { salesPoint: string, condition: string, cuit: string, iibb: string }
    local: { name: string, address: string }
    seller: { name: string, mail: string }
}
interface CompanySettings {
    COMPANY_NAME: string,
    COMPANY_DOMAIN: string,
    COMPANY_MAIL: string,
    LOCAL_NAME: string,
    LOCAL_ADDRESS: string,
}
interface AfipSettings {
    SALES_POINT: number,
    CONDITION: string,
    CUIT: string,
    IIBB: string,
    EMP_ALLOWED_VTYPES: string,
    ALIQUOT_TYPE_SELECTED: string,
}
interface AutoSettings{
    CF_MAX_AMOUNT:number
    CF_AUTO_PROCESSED:number
}