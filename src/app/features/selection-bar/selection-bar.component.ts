import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { get } from 'lodash-es';
import { HighlightState } from '../shared/';

const CATEGORIES = [
    'alkali',
    'alkaline',
    'lant',
    'actinoid',
    'transition',
    'postTransition',
    'metalloid',
    'nonMetal',
    'nobleGas',
];

@Component({
    selector: 'app-selection-bar',
    templateUrl: './selection-bar.component.html',
    styleUrls: ['./selection-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionBarComponent implements OnInit, OnChanges {
    @Output()
    highlightElement: EventEmitter<HighlightState> = new EventEmitter<HighlightState>();

    @Input()
    currentAtomCategory: string;

    highlightState: HighlightState;
    grayButtonStyle: any = null;
    allMetals = ['alkali', 'alkaline', 'lant', 'actinoid', 'transition', 'postTransition'];
    allNonMetals = ['nonMetal', 'nobleGas'];

    constructor() {
        this.resetHighlight();
        this.resetGrayButtons();
    }

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        const { currentAtomCategory = null } = changes;
        const currentCategory = get(currentAtomCategory, 'currentValue', null);
        this.resetHighlight();

        if (currentCategory) {
            let prop = '';
            switch (currentCategory) {
                case 'alkali-metal':
                    prop = 'alkali';
                    break;
                case 'alkaline-earth-metal':
                    prop = 'alkaline';
                    break;
                case 'lanthanide':
                    prop = 'lant';
                    break;
                case 'actinide':
                    prop = 'actinoid';
                    break;
                case 'transition-metal':
                    prop = 'transition';
                    break;
                case 'post-transition-metal':
                    prop = 'postTransition';
                    break;
                case 'metalloid':
                    prop = 'metalloid';
                    break;
                case 'nonmetal':
                    prop = 'nonMetal';
                    break;
                case 'noble-gas':
                    prop = 'nobleGas';
                    break;
            }
            if (prop) {
                this.highlightState[prop] = true;
            }
        }
    }

    resetHighlight() {
        this.highlightState = {
            alkali: false,
            alkaline: false,
            lant: false,
            actinoid: false,
            transition: false,
            postTransition: false,
            metalloid: false,
            nonMetal: false,
            nobleGas: false,
        };
    }

    resetGrayButtons() {
        this.grayButtonStyle = CATEGORIES.reduce((acc, c) => {
            acc[c] = false;
            return acc;
        }, {});
    }

    numHighlightState() {
        return Object.keys(this.highlightState).filter(k => this.highlightState[k] === true).length;
    }

    changeHighlightState(keys: string[], value: boolean) {
        this.resetHighlight();
        keys.forEach(key => (this.highlightState[key] = value));

        this.highlightElement.emit(this.highlightState);

        if (this.numHighlightState() === 1) {
            this.grayButtonStyle = CATEGORIES.reduce((acc, c) => {
                acc[c] = this.highlightState[c] !== true;
                return acc;
            }, {});
        } else {
            this.resetGrayButtons();
        }
    }
}
