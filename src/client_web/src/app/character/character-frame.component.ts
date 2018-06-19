import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import {MenuItem} from 'primeng/api';


@Component({
    selector: 'character-frame',
    templateUrl: './character-frame.component.html'
})
export class CharacterFrameComponent implements OnInit{

    constructor(http: Http, @Inject('BASE_URL') baseUrl: string, private _router: Router, private _route: ActivatedRoute) {
        http.get(baseUrl + 'cmd/character_view').subscribe(result => {
            this.player = result.json() as Player;
            if(this.player.character !== undefined && this.countCharacters() > 0){
              this.selectedChar = this.player.character[0];
            }
        }, error => console.error(error));
    }

    player: Player;
    selectedChar: Character;
    sectionMenuItems: MenuItem[];

    ngOnInit() {
        // test
        this.player = JSON.parse("{\"character\": [{\"approbation\": {\"date\": 1527904919.51892, \"status\": 2}, \"date_creation\": 1526904643.412309, \"technique_maitre\": [{\"options\": [\"Maitre-Esclavagiste\"], \"habilite\": \"Malveillance\", \"discipline\": \"Sournoise\"}], \"date_modify\": 1527904919.51892, \"accueil_jeu_1\": true, \"rituel\": [], \"xp_autre\": 0, \"question_background_raison\": \"L'import-export de vivres dans la r\\u00e9gion, la propagation de la gastronomie de mal\\u00e9dastarone\", \"question_vision_esclavage\": \"Esclavagiste\", \"faction\": \"Mal\\u00e9dastar\\u00f4ne\", \"esclave\": [], \"merite\": [{\"sub_merite\": \"March\\u00e9 Esclave\"}, {\"sub_merite\": \"March\\u00e9 Esclave\"}], \"sous_ecole\": [], \"xp_naissance\": 6, \"habilites\": [{\"options\": [\"Salaire\"], \"habilite\": \"Baratin\", \"discipline\": \"Professionnelle\"}, {\"options\": [\"Herboristerie\", \"Sp\\u00e9cialiste I - Herboristerie\", \"Sp\\u00e9cialiste II - Herboristerie\"], \"habilite\": \"M\\u00e9tier\", \"discipline\": \"Professionnelle\"}, {\"options\": [\"Sans-Coeur\"], \"habilite\": \"Malveillance\", \"discipline\": \"Sournoise\"}], \"sous_faction\": \"Fonctionnaire\", \"name\": \"1112 (onze douze)\", \"question_orientation\": [\"\\u00c9conomique\", \"Gourmande\"]}], \"total_point_merite\": 6, \"given_name\": \"Alexis\", \"password\": null, \"postal_code\": null, \"passe_saison_2018\": true, \"twitter_id\": null, \"email\": \"alexis.buisson@hotmail.com\", \"name\": \"Alexis Buisson\", \"facebook_id\": \"10213490781556886\", \"date_modify\": 1527904919.51892, \"family_name\": \"Buisson\", \"verified_email\": false, \"locale\": \"fr_CA\", \"google_id\": null, \"user_id\": \"9699f564a08743cb8eb52887143457ca\", \"permission\": \"Joueur\", \"username\": \"Alexis Buisson\"}") as Player;
        if(this.player.character !== undefined && this.countCharacters() > 0){
            this.selectedChar = this.player.character[0];
        }
        // end test

        this.sectionMenuItems = [
            {
                label: 'Formulaire',
                command: () => this.navigate('form')
            },
            {
                label: 'Sommaire',
                items: [
                    {label: 'Attributs', icon: 'glyphicon glyphicon-tasks', command: () => this.navigate('attributes')},
                    {label: 'Habiletés', icon: 'glyphicon glyphicon-flash', command: () => this.navigate('skills')},
                    {label: 'Objets de départ', icon: 'glyphicon glyphicon-briefcase', command: () => this.navigate('resources')}
                ]
            },
            {
                label: 'Messages Importants',
                command: () => this.navigate('messages')
            }
        ];
    }

    navigate(fragment: string) {
			  this._router.navigate([ fragment ], { relativeTo: this._route });
		}

		switchSelectedChar(char: Character) {
        this.selectedChar = char;
		}

		countCharacters(): number {
		    return this.player.character.length;
		}

		countSpentMerite(){
		    let total = 0;
		    for(let i = 0; i < this.player.character.length; i++){
		        total += this.zeroOrLength(this.player.character[i].merite);
		    }
		    return total;
		}

		countTotalXp(){
		    return this.selectedChar.xp_naissance + this.selectedChar.xp_autre;
		}

		countSpentXp() {
        let total_xp = 0;

        total_xp += this.zeroOrLength(this.selectedChar.energie);
        total_xp += this.zeroOrLength(this.selectedChar.endurance);
        total_xp += this.countSkillsXp(this.selectedChar.habilites);
        total_xp += this.countSkillsXp(this.selectedChar.technique_maitre);

        return total_xp;
    }

    countSkillsXp(skills: Skill[]): number{
        let total_xp = 0;
        if (skills !== undefined && skills !== null) {
            for (let i = 0; i < skills.length; i++) {
                total_xp += this.zeroOrLength(skills[i].options);
            }
        }
        return total_xp;
    }

    zeroOrLength(value: any[]){
        if(value !== undefined && value !== null){
            return value.length;
        }
        return 0;
    }
}
