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
let Bin = class Bin {
  render() {
    return h(
      "div",
      { class: "list_wrapper" },
      h(
        "div",
        { class: "list" },
        h(
          "div",
          { class: "list_header" },
          h("h1", { class: "header_title" }, this.title),
          this.note ? h("p", { class: "header_desc" }, this.note) : "",
          h(
            "div",
            { class: "header_infos" },
            this.due
              ? h(
                  "div",
                  { class: "header_due" },
                  h("span", { class: "due_item" }, "Due ", this.due)
                )
              : ""
          )
        ),
        h(
          "div",
          { class: "list_cards" },
          h("h2", null, "Commitments (", this.cards.length, ")"),
          this.cards
            ? this.cards.map((card) =>
                h("oce-card", {
                  members: card.members,
                  due: card.due,
                  note: card.note || card.title,
                  action: () => {
                    console.log("hello");
                  },
                })
              )
            : ""
        ),
        this.outputs.length !== 0
          ? h("oce-output", { outputs: this.outputs })
          : ""
      )
    );
  }
};
__decorate([Prop()], Bin.prototype, "note", void 0);
__decorate([Prop()], Bin.prototype, "due", void 0);
__decorate([Prop()], Bin.prototype, "cards", void 0);
__decorate([Prop()], Bin.prototype, "outputs", void 0);
__decorate([Prop()], Bin.prototype, "title", void 0);
Bin = __decorate(
  [
    Component({
      tag: "oce-bin",
      styleUrl: "style.scss",
      shadow: true,
    }),
  ],
  Bin
);
export { Bin };
