import { Component, OnInit, Input } from "@angular/core";
import colors from "./colors";

interface CardData {
  header: string;
  cells: string[];
  index?: number;
}

interface HeaderStyle {
  bg: string;
  font: string;
}

@Component({
  selector: "ledge-card",
  templateUrl: "./ledge-card.component.html",
  styleUrls: ["./ledge-card.component.scss"],
})
export class SkillCardComponent implements OnInit {
  @Input()
  data: CardData = {
    header: "",
    cells: [],
    index: -1,
  };
  @Input()
  headerStyle: HeaderStyle = {
    bg: "#fff",
    font: "#333",
  };

  constructor() {}

  ngOnInit(): void {
    console.log(this.data);
  }

  /**TODO */
  getHeaderStyle() {
    let idx = this.data.index;

    if (!idx && idx !== 0) {
      idx = Math.floor(Math.random() * 10);
    }

    return {
      "background-color":
        (this.headerStyle && this.headerStyle.bg) || colors[idx],
      color: (this.headerStyle && this.headerStyle.font) || "#333",
    };
  }
}
