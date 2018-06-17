import { Component } from '@angular/core';

@Component({
    selector: 'character-skills',
    templateUrl: './character-skills.component.html'
})
export class CharacterSkillsComponent {
    public currentCount = 0;

    public incrementCounter() {
        this.currentCount++;
    }
}
