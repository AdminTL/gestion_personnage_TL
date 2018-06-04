import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';

@Component({
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent {
    public totalSeasonPass: number;

    constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
        http.get(baseUrl + 'api/SampleData/TotalSeasonPass').subscribe(result => {
            this.totalSeasonPass = (result.json() as SeasonPassNumber).result;
        }, error => console.error(error));
    }
}

interface SeasonPassNumber {
    result: number;
}
