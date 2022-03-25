interface Products{
    id:number,
    name:string,
    description?:string,
    category_id?:Categories["id"],
    hidden:boolean,
    last_change:Date,
    stock:number,
    unit_price:number
}
interface Categories{
    id:number,
    name:string,
    description:string
}
interface PumpType{
    id:number,
    name:string,
    unit:string
}
interface Pumps{
    id:number,
    description?:string,
    type_id?:PumpType["id"],
    last_update:Date,
    meter:number,
    max_meter_value:number,
    unit_price:number
}
interface Employee{
    uuid:string,
    uname:string,
    mail?:string,
    phone?:string,
    address?:string,
    hidden:boolean,
    dt_added:Date,
    dt_modified:Date
}