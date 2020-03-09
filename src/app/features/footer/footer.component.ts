import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
        <div>
            <p>Made by Connie Leung @2017</p>
            <p>Powered by Angular 7</p>
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
            }

            div {
                padding: 10px 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                background: #4a4a4a;
                color: #fff;
            }

            p {
                font-size: 1em;
                line-height: 120%;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
