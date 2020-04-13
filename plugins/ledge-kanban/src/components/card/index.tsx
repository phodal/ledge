import { h, Component, Prop } from '@stencil/core';
import { members } from '../interfaces';

@Component({
  tag: 'oce-card',
  styleUrl: 'style.css',
  shadow: true
})
export class Card {

  @Prop() action: any;
  @Prop() note: string;
  @Prop() due: string;
  @Prop() members: Array<members>;


  render() {
    return (
      <div onClick={this.action} class='card'>
        <span class='card_title'>{this.note}</span>
        <div class='card_infos'>
          <h4 class='infos_due'>Due to {this.due}</h4>
          <div class='infos_members'>
            {this.members.map(member => (
              <span class='members_item'>
                <img class='item_photo' src={member.image}/>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
