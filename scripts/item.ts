import { relu } from "./utils.js";

export default class Item<Object> {
    static minDistance: number = 20;

    private pixels: Array<{ x: number; y: number }>;
    private x: number = 0;
    private y: number = 0;

    private width: number = 0;
    private height: number = 0;
    
    constructor();
    constructor(x?: number, y?: number) {
        this.pixels = [];
        if(x && y) this.addPixel(x, y);
    }


    public addPixel(x: number, y: number): void {
        if (this.pixels.length <= 0) {
            this.y = y;
            this.x = x;
            this.height = this.width = 0;
        } else {
            if (x < this.x) {
                this.width += this.x - x;
                this.x = x;
            } else if (x > this.x + this.width) {
                this.width = x - this.x;
            }

            if (y < this.y) {
                this.height += this.y - y;
                this.y = y;
            } else if (y > this.y + this.height) {
                this.height = y - this.y;
            }
        }

        this.pixels.push({ x, y });
    }

    public estaDentro(x: number, y: number): boolean {
        return (
            x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height
        );
    }

    public estaCerca(x: number, y: number): boolean {
        // if(!this.estaDentro(x, y)){
        const distanciaX: number = relu(
            Math.abs(x - this.x - this.width / 2) - this.width / 2
        );
        const distanciaY: number = relu(
            Math.abs(y - this.y - this.height / 2) - this.height / 2
        );
        return (
            Math.sqrt(Math.pow(distanciaX, 2) + Math.pow(distanciaY, 2)) <=
            Item.minDistance
        );
        // }
        // return true;
    }
}
