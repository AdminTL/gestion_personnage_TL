import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import { Character } from '@app/character/character';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { Http } from '@angular/http';
import { Player } from '@app/character/player';

@Injectable({providedIn: 'root'})
export class CharacterService {

    private character: Subject<Character>;
    private player: Subject<Player>;
    public selectedCharacter$: Observable<Character>;
    public player$: Observable<Player>;

    constructor(private http: Http) {
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
            '{\"total_point_merite\": 6, \"given_name\": \"Alexis\", \"password\": null, \"postal_code\": null, \"passe_'
            + 'saison_2018\": false, \"twitter_id\": null, \"email\": \"alexis.buisson@hotmail.com\", \"name\": \"'
            + 'Alexis Buisson\", \"facebook_id\": \"10213490781556886\", \"date_modify\": 1527904919.51892, \"family'
            + '_name\": \"Buisson\", \"verified_email\": false, \"locale\": \"fr_CA\", \"google_id\": null, \"user'
            + '_id\": \"9699f564a08743cb8eb52887143457ca\", \"permission\": \"Joueur\", \"username\": \"Alexis Buisson\"}'
        ) as Player);
        // end test

        obs.subscribe(
            player => {
                this.setPlayer(player);
            },
            err => {
                console.log(err);
            }
        );

        this.getCharactersForUser().subscribe(
            character => {
                this.setSelectedCharacter(character.json() as Character);
            }
        )
    }

    getCharactersForUser(){
        return this.http.get(`${environment.apiUrl}/cmd/character/`);
    }

    addCharacterToUser(character: Character){
        return this.http.post(`${environment.apiUrl}/cmd/character/`, character);
    }
}