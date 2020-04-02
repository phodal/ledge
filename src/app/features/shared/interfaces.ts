export interface HighlightState {
  alkali: boolean;
  alkaline: boolean;
  lant: boolean;
  actinoid: boolean;
  transition: boolean;
  postTransition: boolean;
  metalloid: boolean;
  nonMetal: boolean;
  nobleGas: boolean;
}

export interface Atom {
  name: string;
  homepage: string;
  description: string;
  category: string;
  number: number;
  symbol: string;
  pd: string;
}
