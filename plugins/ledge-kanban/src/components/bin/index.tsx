import { h, Component, Prop } from '@stencil/core';
import { output } from '../interfaces';

@Component({
  tag: 'oce-bin',
  styleUrl: 'style.css',
  shadow: true
})
export class Bin {
  @Prop() note: string;
  @Prop() due: string;
  @Prop() cards: Array<any>;
  @Prop() outputs: Array<output>;
  @Prop() title: string;

  render() {
    return (
      <div class='list_wrapper'>
        <div class='list'>
          <div class='list_header'>
            <h1 class='header_title'>{this.title}</h1>
            {this.note
              ? <p class='header_desc'>{this.note}</p>
              : ''}
            <div class='header_infos'>
              {this.due
                ? <div class='header_due'>
                  <span class='due_item'>Due {this.due}</span>
                </div>
                : ''}
            </div>
          </div>
          <div class='list_cards'>
            <h2>Commitments ({this.cards.length})</h2>
            {this.cards
              ? this.cards.map(card =>
                <oce-card members={card.members} due={card.due} note={card.note || card.title} action={() => {
                  console.log('hello');
                }}/>
              ) : ''}
          </div>
          {this.outputs.length !== 0
            ? <oce-output outputs={this.outputs}/>
            : ''}
        </div>
      </div>
    );
  }
}
