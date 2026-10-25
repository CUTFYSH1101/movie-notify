export class City {
  name: string
  theatersCount: number
  versionCount: number

  constructor(name: string, theatersCount: number, versionCount: number) {
    this.name = name
    this.theatersCount = theatersCount
    this.versionCount = versionCount
  }
}