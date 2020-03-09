import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-phase',
    template: `
        <div
            class="{{ type }}"
            (mouseenter)="enter.emit(type)"
            (mouseleave)="enter.emit('')"
            [class.selected]="selected"
        >
            {{ symbol }}
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
            }

            .solid {
                color: #000;
            }

            .liquid {
                color: #0000dd;
            }

            .gas {
                color: #990000;
            }

            .unknown {
                color: #667766;
            }

            .solid,
            .liquid,
            .gas,
            .unknown {
                padding: 2px;
                font-size: 1em;
                font-weight: bold;
            }

            .solid,
            .liquid,
            .gas,
            .unknown {
                width: 50%;
                margin: 0 0 0 auto;
                border: 1px solid #000;
                text-align: center;
                cursor: pointer;
            }

            .solid.selected,
            .liquid.selected,
            .unknown.selected,
            .gas.selected {
                color: #fff;
            }

            .solid.selected {
                background: #171717;
            }

            .liquid.selected {
                background: #2d51e1;
            }

            .gas.selected {
                background: #923a49;
            }

            .unknown.selected {
                background: #898989;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPhaseComponent implements OnInit {
    @Output()
    enter = new EventEmitter<string>();

    @Input()
    selected: boolean;

    @Input()
    symbol: string;

    @Input()
    type: string;

    constructor() {}

    ngOnInit() {}
}
