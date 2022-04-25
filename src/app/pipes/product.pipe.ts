import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'product'
})
export class ProductPipe implements PipeTransform {

  transform(value: Products[], hidden?: boolean, searchString?: string): unknown {
    hidden ??= false
    searchString = searchString.toLowerCase()
    if (!searchString) {
      return value.filter(v => { return (hidden ? true : v.hidden == hidden) })
    } else {
      return value.filter(v => { 
        v.description??=''
        return (hidden ? true : v.hidden == hidden) && (v.name.toLowerCase().includes(searchString) || v.description.toLowerCase().includes(searchString)|| v.unit_price.toString().includes(searchString.replace(/,/g,'.')))
      })
    }
  }

}
