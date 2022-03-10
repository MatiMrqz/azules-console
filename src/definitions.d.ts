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