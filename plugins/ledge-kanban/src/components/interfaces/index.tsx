export interface output {
  resourceClassifiedAs : {
    name: string
  }
}

export interface card {
  members: Array<members>,
  due: string,
  note: string,
  action: Function
}

export interface members {
  image: string
}

export interface bin {
  cards: Array<card>,
  outputs: Array<output>,
  due: string,
  title: string,
  note: string
}
