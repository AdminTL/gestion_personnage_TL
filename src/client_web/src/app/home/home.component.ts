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
        title: "Jeu 41: Les limites du Pouvoirs",
        type: "GN - Tout le terrain",
        date: "8 octobre 2017",
        selected: true,
        location: {
          showed: true,
          name: "Terra Icognita",
          href: "https://goo.gl/maps/YpaQu3zk9Xy",
          address: "1801 Chemin Béthanie, Béthanie (Québec), J0H 1E1, (450) 548-2720"
        },
        price: {
          showed: true,
          single: 123,
          currency: "$"
        },
        season_pass: {
          showed: false,
          html_text: "150$ pour les 4 prochains jeux. <u>Économie de 30$</u>!"
        },
        facebook_event: {
          showed: true,
          href: "https://www.facebook.com/events/1623866417646126"
        },
        description: {
          selected: true,
          title: "Synopsis",
          text: "Pendant que les Sarsares éliminaient tour à tour leurs grands ennemis; Natueur, les Strônes et un début de\n" +
            "plan pour leur plus célèbre traitre , Bahalect. Les Vanican et les Canavim ont pris\n" +
            "position dans la guerre des héritiers, provoquant plus d’une onde de colère parmis les lords Canavim, les\n" +
            "patriarches et sénateur Vanican. Le chaos politique et militaire qui s’annonce est\n" +
            "à faire pâlir même les plus gros marchands d’armes de Malédastarône.<br/>\n" +
            "<br/>\n" +
            "Bahalect est réapparu, vivant mais tout de même immortel, peu importe comment le plan est de le renfermer une\n" +
            "bonne fois pour toute dans sa vieille tombe mieux scellée. Les habitants de la\n" +
            "région arriveront-ils à lui rejouer le mauvais coup qu’ils lui ont fait 1000 ans plus tôt?<br/>\n" +
            "<br/>\n" +
            "Dans la forteresse de Canavim, une ombre est apparue. Les croyants de Cesserak y voyaient au début le signe de\n" +
            "la venue de leur Dieu de l’ombre, mais plus l’ombre grandissait, plus cette\n" +
            "théorie s'invalidait. L’ombre était la grande apparition de leur pire ennemie: Le Néant.<br/>\n" +
            "<br/>\n" +
            "Le premier citoyen est parti à la recherche de Sayydi. Comment? Personne ne le sait, mais il tient à son futur\n" +
            "qui lui a été promis en s'assoyant sur le trône des immortels et devenir l’Élu\n" +
            "du Cosmos.<br/>\n" +
            "<br/>\n" +
            "Dans l’ouest, Amunzrat a réuni le plus grand rassemblement de nécromancien jamais fait. Plus de 888\n" +
            "nécromanciens, tous loyaux à la guilde régente, réuni autour du plus puissant nexus de\n" +
            "nécromancie jamais étudié. Leurs avenirs se jouent dans les prochaines semaines, rien à voir avec une invasion\n" +
            "Strônes, leurs armées d’esclave sont morts-vivants et leurs sorts en sont spécialisés.<br/>\n" +
            "<br/>\n" +
            "Avez-vous oublié les Démons???<br/>\n" +
            "<br/>\n" +
            "Jerm votre Coordo<br/>\n" +
            "<br/>\n" +
            "<br/>\n" +
            "ps: La Forteresse de Canavim est inaccessible, vendredi et samedi, personne ne dort là svp.<br/>\n" +
            "Si vous dormez au Terrain, vous devez absolument vous ramasser avant de dormir. SANS FAUTES. Les déchets des\n" +
            "autres vous seront mis sur le dos à tous.<br/>\n" +
            "<br/>\n" +
            "L'accueil se fera entre 10h et 12h. Début du scénario; Samedi 12h au village.<br/>\n" +
            "<br/>\n" +
            "30$ pour tous, ceux avec une passe saison seront remboursés de 15$.<br/>\n" +
            "<br/>\n" +
            "Veuillez ne pas oublier de TOUS NOUS RAPPORTER APRÈS LA GAME.<br/>\n" +
            "Merci et bon jeu."
        }
      }
    ],
    activity: {
      showed: true,
      description: {
        title: "Qu'est-ce que Traître-Lame?",
        text: "<p>\n" +
          "Traître-Lame est une activité née au sein de l'Atelier du loisir en 2009 mettant l'emphase sur le combat et la\n" +
          "géopolitique. L'activité se démarque par un système de règles avec une base simple,\n" +
          "mais avec une grande variété d'options. Le système de magie y est conçu pour être intéressant sans briser le flot\n" +
          "des combats ou permettre de terrasser un adversaire sans faire usage de sagacité\n" +
          "ou d'adresse au combat.\n" +
          "</p>\n" +
          "<p>\n" +
          "Traître-Lame se veut une activité orientée pour les adultes. La consommation d'alcool y est permise de façon\n" +
          "responsable et mature. Le jeu est principalement propulsé par un scénario profond et\n" +
          "complexe s'appuyant sur la structure à quatre factions de l'univers de Traître-Lame. Les joueur.se.s sont\n" +
          "invité.e.s à la création de leur personnage à choisir l'une de quatre factions jouables\n" +
          "de la\n" +
          "Sarsonne qui détermine le style de leur jeu.\n" +
          "</p>\n" +
          "<p>\n" +
          "L'empire de Vanicant offre un style de jeu actif et combatif, dans une atmosphère politique tordue où les jeux de\n" +
          "pouvoir et les trahisons sont nombreux.\n" +
          "</p>\n" +
          "<p>\n" +
          "Le Royaume de Canavim offre la possibilité aux joueur.se.s d'évoluer dans un cadre militaire plus organisé au\n" +
          "coeur d'une société moderne et hiérarchisée. Il s'agit aussi d'une faction où\n" +
          "l'anglais\n" +
          "est très présent.\n" +
          "</p>\n" +
          "<p>\n" +
          "La tribu Sarsar propose aux joueur.se.s d'incarner un groupe de combattant en constante guérilla où la politique\n" +
          "et la religion tribale sont intimement liées.\n" +
          "</p>\n" +
          "<p>\n" +
          "Finalement, les exilés du village de Vallam sont au centre des querelles économiques et politiques de l'économie\n" +
          "réelle et parallèle et propose aux joueur.se.s un jeu moins orienté vers le\n" +
          "combat et\n" +
          "plus vers l'intrigue et l'ésotérisme.\n" +
          "</p>"
      }
    }
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
