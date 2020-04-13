var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
import { Component, Prop } from "@stencil/core";
let Card = class Card {
  render() {
    return h(
      "div",
      { onClick: this.action, class: "card" },
      h("span", { class: "card_title" }, this.note),
      h(
        "div",
        { class: "card_infos" },
        h("h4", { class: "infos_due" }, "Due to ", this.due),
        h(
          "div",
          { class: "infos_members" },
          this.members.map((member) =>
            h(
              "span",
              { class: "members_item" },
              h("img", { class: "item_photo", src: member.image })
            )
          )
        )
      )
    );
  }
};
__decorate([Prop()], Card.prototype, "action", void 0);
__decorate([Prop()], Card.prototype, "note", void 0);
__decorate([Prop()], Card.prototype, "due", void 0);
__decorate([Prop()], Card.prototype, "members", void 0);
Card = __decorate(
  [
    Component({
      tag: "oce-card",
      styleUrl: "style.scss",
      shadow: true,
    }),
  ],
  Card
);
export { Card };
