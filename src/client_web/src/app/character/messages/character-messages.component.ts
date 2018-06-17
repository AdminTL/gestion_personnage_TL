import { Component } from '@angular/core';

@Component({
    selector: 'character-messages',
    templateUrl: './character-messages.component.html'
})
export class CharacterMessagesComponent {
    public currentCount = 0;

    public incrementCounter() {
        this.currentCount++;
    }
}
