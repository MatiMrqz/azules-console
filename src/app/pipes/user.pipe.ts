import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'user'
})
export class UserPipe implements PipeTransform {

  transform(value: Employee[], hidden: boolean, searchString: string): Array<Employee> {
    hidden ??= false
    searchString = searchString.toLowerCase()
    if (!searchString) {
      return value.filter(v => { return (hidden ? true : v.hidden == hidden) })
    } else {
      return value.filter(v => {
        v.mail ??= ''
        v.phone ??= ''
        v.address ??= ''
        return (hidden ? true : v.hidden == hidden) && (v.uname.toLowerCase().includes(searchString) || v.mail.toLowerCase().includes(searchString) || v.phone.toLowerCase().includes(searchString) || v.address.toLowerCase().includes(searchString))
      })
    }
  }

}
