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
let Kanban = class Kanban {
  render() {
    return h(
      "div",
      { class: "board_container" },
      h(
        "div",
        { class: "board" },
        this.bins.map((bin) =>
          h("oce-bin", {
            cards: bin.cards,
            outputs: bin.outputs,
            due: bin.due,
            title: bin.title,
            note: bin.note,
          })
        )
      )
    );
  }
};
__decorate([Prop()], Kanban.prototype, "bins", void 0);
__decorate([Prop()], Kanban.prototype, "due", void 0);
Kanban = __decorate(
  [
    Component({
      tag: "oce-kanban",
      styleUrl: "style.scss",
      shadow: true,
    }),
  ],
  Kanban
);
export { Kanban };
