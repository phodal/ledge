import { h, Component, Prop } from '@stencil/core';

@Component({
  tag: 'ledge-kanban',
  styleUrl: 'style.css',
  shadow: true
})
export class Kanban {
  @Prop() bins: string;

  render() {
    const bins = JSON.parse(this.bins);
    return (
      <div class='kanban-container'>
        <h1>hello, kanban</h1>
      </div>
    );
  }
}
