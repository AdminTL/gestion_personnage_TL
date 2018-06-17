import { Component } from '@angular/core';

@Component({
    selector: 'character-resources',
    templateUrl: './character-resources.component.html'
})
export class CharacterResourcesComponent {
    public currentCount = 0;

    public incrementCounter() {
        this.currentCount++;
    }
}
