export function relu(n: number): number{
    if(n<0){
        return 0;
    }
    return n;
}

export function distancia(point1: Array<number>, point2: Array<number>): number {
    return Math.sqrt(
        point1.reduce((acum, curr, idx) => {
            return acum + Math.pow(curr - point2[idx], 2);
        }, 0)
    );
}