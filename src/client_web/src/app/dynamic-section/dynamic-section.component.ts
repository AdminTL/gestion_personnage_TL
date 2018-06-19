import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'dynamic-section',
    templateUrl: './dynamic-section.component.html',
    styleUrls: ['./dynamic-section.component.css']
})
export class DynamicSectionComponent {
    public route: string

    constructor(router: Router) {
        this.route = router.url.split('#')[0];
    }

    @Input()
    public section: Section;

    @Input()
    public depth: number;

    public isString(elem: any): boolean {
        return typeof elem === "string";
    }

    public isArray(elem: any): boolean {
        return elem[0] !== undefined;
    }

    public isMedia(elem: any): boolean {
        return (elem as Media).type !== undefined;
    }

    public isDefined(elem: any): boolean {
        return elem !== undefined;
    }

    public getShortTitle(): string {
        return this.section.title.replace(/[\s]/g, '');
    }
}
