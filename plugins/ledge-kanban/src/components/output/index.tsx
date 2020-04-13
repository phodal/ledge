import { h, Component, Prop } from '@stencil/core';
import { output } from '../interfaces';

@Component({
  tag: 'oce-output',
  styleUrl: 'style.css',
  shadow: true
})
export class Output {
  @Prop() outputs: Array<output>;

  render() {
    return (
      <div class='list_outputs'>
        <h2>Outputs ({this.outputs.length})</h2>
        {this.outputs.map(output => (
          <div class='outputs_card'>
            <span>{output.resourceClassifiedAs.name}</span>
          </div>
        ))}
      </div>
    );
  }
}
