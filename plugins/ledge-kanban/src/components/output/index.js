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
let Output = class Output {
  render() {
    return h(
      "div",
      { class: "list_outputs" },
      h("h2", null, "Outputs (", this.outputs.length, ")"),
      this.outputs.map((output) =>
        h(
          "div",
          { class: "outputs_card" },
          h("span", null, output.resourceClassifiedAs.name)
        )
      )
    );
  }
};
__decorate([Prop()], Output.prototype, "outputs", void 0);
Output = __decorate(
  [
    Component({
      tag: "oce-output",
      styleUrl: "style.scss",
      shadow: true,
    }),
  ],
  Output
);
export { Output };
