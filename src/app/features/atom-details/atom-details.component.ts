import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { get } from 'lodash-es';

@Component({
    selector: 'app-atom-details',
    templateUrl: './atom-details.component.html',
    styleUrls: ['./atom-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtomDetailsComponent implements OnInit, OnChanges {
    @Input()
    data = null;

    phaseClass = {};

    constructor() {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        const { data = null } = changes;
        this.phaseClass = {
            gas: get(data, 'currentValue.phase', '') === 'gas',
            solid: get(data, 'currentValue.phase', '') === 'solid',
            unknown: get(data, 'currentValue.phase', '') === 'unknown',
            liquid: get(data, 'currentValue.phase', '') === 'liquid',
        };
    }
}
