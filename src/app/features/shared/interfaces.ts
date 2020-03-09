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
    number: number;
    category: string;
    symbol: string;
    name: string;
    atomic_mass: number;
    phase: string;
    xpos: number;
    ypos: number;
    blurry: boolean;
}
