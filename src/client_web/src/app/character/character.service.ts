import { Character } from './character';
import { Player } from './player';

import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { of, Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';


@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private character: Subject<Character>;
  private player: Subject<Player>;
  public selectedCharacter$: Observable<Character>;
  public player$: Observable<Player>;

  constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {

    this.character = new BehaviorSubject<Character>(null);
    this.selectedCharacter$ = this.character.asObservable();
    this.player = new BehaviorSubject<Player>(null);
    this.player$ = this.player.asObservable();
  }


  setSelectedCharacter(data: Character) {
    this.character.next(data);
  }

  setPlayer(data: Player) {
    this.player.next(data);
    if (data.character !== undefined && data.character.length > 0) {
      this.setSelectedCharacter(data.character[0]);
    }
  }

  initPlayer(): void {
    // test
    const obs = of(JSON.parse(
      '{\"character\": [{\"approbation\": {\"date\": 1527904919.51892, \"status\": 2}, \"date_creation\"'
      + ': 1526904643.412309, \"technique_maitre\": [{\"options\": [\"Maitre-Esclavagiste\"], \"habilite\"'
      + ': \"Malveillance\", \"discipline\": \"Sournoise\"}], \"date_modify\": 1527904919.51892, \"accueil_'
      + 'jeu_1\": true, \"rituel\": [], \"xp_autre\": 0, \"question_background_raison\": \"L\'import-export '
      + 'de vivres dans la r\\u00e9gion, la propagation de la gastronomie de mal\\u00e9dastarone\", \"'
      + 'question_vision_esclavage\": \"Esclavagiste\", \"faction\": \"Mal\\u00e9dastar\\u00f4ne\", \"esclave'
      + '\": [], \"merite\": [{\"sub_merite\": \"March\\u00e9 Esclave\"}, {\"sub_merite\": \"March\\u00e9 '
      + 'Esclave\"}], \"sous_ecole\": [], \"xp_naissance\": 6, \"habilites\": [{\"options\": [\"Salaire\"], '
      + '\"habilite\": \"Baratin\", \"discipline\": \"Professionnelle\"}, {\"options\": [\"Herboristerie\", '
      + '\"Sp\\u00e9cialiste I - Herboristerie\", \"Sp\\u00e9cialiste II - Herboristerie\"], \"habilite\": \"'
      + 'M\\u00e9tier\", \"discipline\": \"Professionnelle\"}, {\"options\": [\"Sans-Coeur\"], \"habilite\": '
      + '\"Malveillance\", \"discipline\": \"Sournoise\"}], \"sous_faction\": \"Fonctionnaire\", \"name\": '
      + '\"1112 (onze douze)\", \"question_orientation\": [\"\\u00c9conomique\", \"Gourmande\"]}], \"total_'
      + 'point_merite\": 6, \"given_name\": \"Alexis\", \"password\": null, \"postal_code\": null, \"passe_'
      + 'saison_2018\": false, \"twitter_id\": null, \"email\": \"alexis.buisson@hotmail.com\", \"name\": \"'
      + 'Alexis Buisson\", \"facebook_id\": \"10213490781556886\", \"date_modify\": 1527904919.51892, \"family'
      + '_name\": \"Buisson\", \"verified_email\": false, \"locale\": \"fr_CA\", \"google_id\": null, \"user'
      + '_id\": \"9699f564a08743cb8eb52887143457ca\", \"permission\": \"Joueur\", \"username\": \"Alexis Buisson\"}'
      )as Player);
    // end test

    // TODO uncomment for prod
    // let obs = this.http.get(baseUrl + 'cmd/character_view').map(result => result.json() as Player);

    obs.subscribe(
          player => {
            this.setPlayer(player);
          },
          err => {
              console.log(err);
          }
        );
  }
}
