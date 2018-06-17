import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {MenuItem} from 'primeng/api';


@Component({
    selector: 'character-frame',
    templateUrl: './character-frame.component.html'
})
export class CharacterFrameComponent {

    constructor(private _router: Router, private _route: ActivatedRoute) { }

    items: MenuItem[];

    ngOnInit() {
        this.items = [
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
}
