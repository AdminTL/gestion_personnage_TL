import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import { Character } from '@app/character/character';
import { Observable, BehaviorSubject, Subject, of, forkJoin } from 'rxjs';
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
        if(!data){
            this.character.next({} as Character);
        }
        else{
            this.character.next(data);
        }
    }

    setPlayer(data: Player) {
        if(!data){
            this.player.next({} as Player);
        }
        else{
            this.player.next(data);
        }
    }

    initPlayer(): void {

        forkJoin( // the subscribe will run only after all requests finish
            this.getPlayer(),
            this.getCharactersForUser()
        ).subscribe(([player, character]) => {
            const playerObj = player.json() as Player
            let charsArr = character.json() as Character[];
            
            if(!charsArr || charsArr.length == 0){
                charsArr = [{}] as Character[];
            }

            playerObj.character = charsArr;
            this.setPlayer(playerObj);
            this.setSelectedCharacter(charsArr[0]);
        },
        err => console.log(err));
    }

    getPlayer(){
        return this.http.get(`${environment.apiUrl}/cmd/profile/get_info/`)
    }

    getCharactersForUser(){ // TODO: split this to getCharacterNamesForUser and getCharacterById
        return this.http.get(`${environment.apiUrl}/cmd/character/`);
    }

    addCharacterToUser(character: Character){
        return this.http.post(`${environment.apiUrl}/cmd/character/`, character);
    }

    getCharacterForm(){
        return this.http.get(`${environment.apiUrl}/cmd/character_form`);
    }

}
