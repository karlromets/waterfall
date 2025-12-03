export interface Card {
  rank: string;
  suit: string;
  image: string;
}

const RANKS = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
];
const SUITS = ["clubs", "diamonds", "hearts", "spades"];

export class Deck {
  private cards: Card[] = [];
  private currentIndex = 0;
  private cardImages: Record<string, string>;

  constructor(cardImages: Record<string, string>) {
    this.cardImages = cardImages;
    this.buildDeck();
    this.shuffle();
  }

  private buildDeck(): void {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const key = `${rank}-of-${suit}`;
        const imagePath = Object.keys(this.cardImages).find((k) =>
          k.includes(key)
        );
        if (imagePath) {
          this.cards.push({
            rank,
            suit,
            image: this.cardImages[imagePath],
          });
        }
      }
    }
  }

  shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.currentIndex = 0;
  }

  draw(): Card | null {
    if (this.currentIndex >= this.cards.length) {
      return null; // Deck exhausted
    }
    return this.cards[this.currentIndex++];
  }

  get remaining(): number {
    return this.cards.length - this.currentIndex;
  }

  get position(): number {
    return this.currentIndex;
  }

  get total(): number {
    return this.cards.length;
  }

  get isExhausted(): boolean {
    return this.currentIndex >= this.cards.length;
  }

  reset(): void {
    this.shuffle();
  }
}
