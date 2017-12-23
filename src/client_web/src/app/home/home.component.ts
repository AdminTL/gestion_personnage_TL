import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Config} from '../../config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  total_season_pass: number = 0;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get<StatSeasonPass>(Config.serverUrl + "/cmd/stat/total_season_pass").subscribe(
      data => {
        this.total_season_pass = data.total_season_pass_2017;
      },
      err => (
        console.error("Error occured : " + err)
      )
    );
  }
}

interface StatSeasonPass {
  total_season_pass_2017: number;
}
