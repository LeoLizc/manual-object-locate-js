import { relu } from "./utils.js";
export default class Item {
    constructor(x, y) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.pixels = [];
        if (x && y)
            this.addPixel(x, y);
    }
    addPixel(x, y) {
        if (this.pixels.length <= 0) {
            this.y = y;
            this.x = x;
            this.height = this.width = 0;
        }
        else {
            if (x < this.x) {
                this.width += this.x - x;
                this.x = x;
            }
            else if (x > this.x + this.width) {
                this.width = x - this.x;
            }
            if (y < this.y) {
                this.height += this.y - y;
                this.y = y;
            }
            else if (y > this.y + this.height) {
                this.height = y - this.y;
            }
        }
        this.pixels.push({ x, y });
    }
    estaDentro(x, y) {
        return (x > this.x &&
            x < this.x + this.width &&
            y > this.y &&
            y < this.y + this.height);
    }
    estaCerca(x, y) {
        // if(!this.estaDentro(x, y)){
        const distanciaX = relu(Math.abs(x - this.x - this.width / 2) - this.width / 2);
        const distanciaY = relu(Math.abs(y - this.y - this.height / 2) - this.height / 2);
        return (Math.sqrt(Math.pow(distanciaX, 2) + Math.pow(distanciaY, 2)) <=
            Item.minDistance);
        // }
        // return true;
    }
}
Item.minDistance = 20;
