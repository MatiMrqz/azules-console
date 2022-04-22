import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { WebService } from "./web.service";

@NgModule({
    imports:[
        CommonModule
    ]
})
export class WebModule {
    public static forRoot(){
        return {
            ngModule: WebModule,
            providers: [WebService]
        }
    }
}