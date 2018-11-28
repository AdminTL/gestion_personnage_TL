import { Character } from './character';
import { Player } from './player';

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CharacterExtensions } from './character-extensions';
import { CharacterService } from './character.service';

@Component({
  selector: 'character-frame',
  templateUrl: 'character-frame.component.html',
  styleUrls: ['character-frame.component.css']
})
export class CharacterFrameComponent implements OnInit {

  constructor(private characterService: CharacterService, private _router: Router, private _route: ActivatedRoute) {
    this.characterService.initPlayer();
    this.characterService.player$.subscribe(player => this.player = player, err => console.log(err));
    this.characterService.selectedCharacter$.subscribe(char => this.selectedChar = char, err => console.log(err));
  }

  player: Player;
  selectedChar: Character;
  sectionMenuItems: any[];

  ngOnInit() {
    this.sectionMenuItems = [
      {
        label: 'Formulaire',
        command: () => this.navigate('form')
      },
      {
        label: 'Sommaire',
        items: [
          { label: 'Attributs', icon: 'glyphicon glyphicon-tasks', command: () => this.navigate('attributes') },
          { label: 'Habiletés', icon: 'glyphicon glyphicon-flash', command: () => this.navigate('skills') },
          { label: 'Objets de départ', icon: 'glyphicon glyphicon-briefcase', command: () => this.navigate('resources') }
        ]
      },
      {
        label: 'Messages Importants',
        command: () => this.navigate('messages')
      }
    ];
  }

  navigate(fragment: string) {
    this._router.navigate([fragment], { relativeTo: this._route });
  }

  switchSelectedChar(char: Character) {
    this.selectedChar = char;
  }

  getSpentXp(): number {
    return CharacterExtensions.countSpentXp(this.selectedChar);
  }

  getTotalXp(): number {
    return CharacterExtensions.countTotalXp(this.selectedChar);
  }

  countTotalMerite() {
    if (this.player === undefined) {
      return 0;
    }
    return this.player.total_point_merite;
  }
  countSpentMerite() {
    if (this.player === undefined) {
      return 0;
    }
    let total = 0;
    for (let i = 0; i < this.player.character.length; i++) {
      total += this.zeroOrLength(this.player.character[i].merite);
    }
    return total;
  }

  zeroOrLength(value: any[]) {
    if (value !== undefined && value !== null) {
      return value.length;
    }
    return 0;
  }

  countCharacters(): number {
    return this.player.character.length;
  }
}
