import { h, Component, Prop } from '@stencil/core';

@Component({
  tag: 'oce-modal',
  styleUrl: 'style.css',
  shadow: true
})
export class Modal {

  @Prop() data: any;

  render() {
    return (
      <section class='modal_content'>
        {/* <ModalTitle close={close} id={data.id} note={data.note} /> */}
        <div class='content_info'>
          <div class='content_module'>
            <div class='module_header'>
              <div class='header_labels'>
                {/* <ModalMembers provider={data.provider} id={data.id} allPlanAgents={allPlanAgents} members={data.involvedAgents} /> */}
                <div class='labels_due'>
                  <div class='due'>
                    <span class='due_item'>Due {this.data.due}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <ModalActivities id={id} />
        <LogEvent id={id} units={units} scopeId={data.scope.id} commitmentId={data.id} /> */}
        </div>
      </section>
    );
  }
}
