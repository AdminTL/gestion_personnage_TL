import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment";

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent {
  public totalSeasonPass: number;

  home_info = {
    title: "Bienvenue sur le site web du grandeur nature <b>Traître-Lame</b>",
    summary: "Une activité au Québec axée sur les capacités réelles des joueur.se.s plutôt que sur l'ancienneté de leur personnage.",
    event: {
      index: 0
    },
    show_next_event: true,
    events: [
      {
        type: "GN - Tout le terrain",
        date: "8 octobre 2017",
        location: {
          show: true,
          name: "Terra Icognita",
          href: "https://goo.gl/maps/YpaQu3zk9Xy",
          address: "1801 Chemin Béthanie, Béthanie (Québec), J0H 1E1, (450) 548-2720"
        },
        price: {
          show: true,
          single: 123,
          currency: "$"
        },
        season_pass: {
          show: false,
          html_text: "150$ pour les 4 prochains jeux. <u>Économie de 30$</u>!"
        },
        facebook_event: {
          show: true,
          href: "https://www.facebook.com/events/1623866417646126"
        },
      }
    ],
    show_next_synopsis: true,
  };

  constructor(private http: HttpClient) {
    this.http.get(`${environment.apiUrl}/cmd/stat/total_season_pass`).subscribe((data: StatPassData) => {
      this.totalSeasonPass = data.total_season_pass_2017;
    }, error => console.error(error));
  }
}

interface StatPassData {
  total_season_pass_2017: number;
}
