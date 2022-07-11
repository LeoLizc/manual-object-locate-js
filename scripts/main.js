import { distancia } from "./utils.js";
import Item from "./item.js";

let color = [0, 255, 0];
let dimenciones = {
    height: 200,
    width: 200,
};
let minDif = 180;

let radius = 2;

let toggle = false;

function sensibilityHandler(ev) {
    // console.log(ev);
    minDif = ev.target.value;
    // document.getElementById('labelS').value = minDif;
    document.getElementById("labelS").innerHTML = minDif;
}

function buttonHandler(evn){
    toggle = !toggle;
}

window.onload = () => {
    loadVideo();
    document.getElementById('lienzo').onclick = onCanvasClick;
    document.getElementById("sens").onchange = sensibilityHandler;
    document.getElementById('boton').onclick = buttonHandler;
};

function onCanvasClick(evn){
    // console.log(evn);
    const data = evn.target.getContext('2d').getImageData(
        0,
        0,
        dimenciones.height,
        dimenciones.width
    ).data;
    const X = Math.min(evn.offsetX, dimenciones.width-1);
    const Y = Math.min(evn.offsetY, dimenciones.height-1);
    const id = XY2Idx(X, Y);

    // console.log(`rgb(${data[id]},${data[id+1]},${data[id+2]})`);
    color = [data[id], data[id+1], data[id+2]];
    document.getElementsByClassName('colored')[0].style['background-color'] = `rgb(${color[0]},${color[1]},${color[2]})`;
}

function loadVideo() {
    var video = document.querySelector("#camera");
    const config = {
        audio: false,
        video: dimenciones,
    };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia(config)
            .then(function (stream) {
                video.srcObject = stream;
                processImage(video);
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
                console.error(err0r);
            });
    }
}

function processImage(video) {
    const canva = document.getElementById("lienzo");
    canva.height = dimenciones.height;
    canva.width = dimenciones.width;
    const ctx = canva.getContext("2d");
    // let cont = 0;

    setInterval(() => {
        ctx.drawImage(video, 0, 0);
        // cont++;

        let data = ctx.getImageData(
            0,
            0,
            dimenciones.height,
            dimenciones.width
        );
        let frame = data.data;

        const [items, prom] = toggle? getItems(frame) : getItemsByExpand(frame);

        // console.log(prom);
        ctx.beginPath();
        ctx.fillStyle = ctx.strokeStyle = "red";
        ctx.ellipse(...prom.coord, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        // console.log(items);
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            ctx.beginPath();
            ctx.rect(item.x, item.y, item.width, item.height);
            ctx.strokeStyle = "purple";
            ctx.stroke();
        }
    }, 50);

    // setInterval(()=>{
    //     console.clear();
    //     console.log('fps:', cont);
    //     cont = 0;
    // }, 1000);
}

function idx2XY(idx) {
    const y = Math.floor(idx / dimenciones.width);
    const x = idx % dimenciones.width;
    return [x, y];
}

function XY2Idx(x, y){
    return (y*dimenciones.width + x)*4;
}

function getItems(frame){
    let prom = {
        coord: [0, 0],
        cont: 0,
    };

    const items = [];
    for (let i = 0; i < frame.length; i += 4) {

        if (
            distancia(color, [frame[i], frame[i + 1], frame[i + 2]]) <
            minDif
        ) {
            // [frame[i], frame[i + 1], frame[i + 2]] = [0, 0, 255];
            let dim = idx2XY(i / 4);
            let nuevo = true;

            for (let index = 0; index < items.length; index++) {
                if (items[index].estaCerca(...dim)) {
                    items[index].addPixel(...dim);
                    nuevo = false;
                }
            }

            if (nuevo) {
                items.push(new Item(...dim));
            }

            prom.coord = prom.coord.map((val, idx) => {
                return val + dim[idx];
            });
            prom.cont++;
        }
    }

    prom.coord = prom.coord.map((val, idx) => {
        return val / prom.cont;
    });

    return [items, prom]
}

function getItemsByExpand(frame){
    const check = Array(frame.length/4).fill(false);

    let prom = {
        coord: [0, 0],
        cont: 0,
    };

    const items = [];
    for (let i = 0; i < frame.length; i += 4) {

        if (!check[i/4] && distancia(color, [frame[i], frame[i + 1], frame[i + 2]]) < minDif) {
            // [frame[i], frame[i + 1], frame[i + 2]] = [0, 0, 255];
            const dim = idx2XY(i / 4);

            // let nuevo = true;

            // for (let index = 0; index < items.length; index++) {
            //     if (items[index].estaCerca(...dim)) {
            //         items[index].addPixel(...dim);
            //         nuevo = false;
            //     }
            // }

            // if (nuevo) {
            //     items.push(new Item(...dim));
            // }

            const item = new Item();

            expand(item, frame, check, dim);
            items.push(item);

            // prom.coord = prom.coord.map((val, idx) => {
            //     return val + dim[idx];
            // });
            // prom.cont++;
        }
    }

    // prom.coord = prom.coord.map((val, idx) => {
    //     return val / prom.cont;
    // });

    return [items, prom];
}

function expand(item, frame, check, pixel){
    let idx = XY2Idx(...pixel);

    if(check[idx/4]){
        return;
    }

    check[idx/4] = true;
    if(distancia(color, [frame[idx], frame[idx + 1], frame[idx + 2]]) > minDif){
        return;
    }

    item.addPixel(...pixel);
    
    //Expand
    for (let i = 1; i <= radius; i++) {
        

        if(pixel[1]-i >= 0)
        for (let x = Math.max(0, pixel[0] - i); x <= Math.min(dimenciones.width-1, pixel[0]+i); x++) {
             expand(item, frame, check, [x, pixel[1]-i]);
        }

        if(pixel[0]+i <= dimenciones.width-1)
        for (let y = Math.max(0, pixel[1] - i + 1); y <= Math.min(dimenciones.height-1, pixel[1]+i); y++) {
             expand(item, frame, check, [pixel[0] + i, y]);
        }
        
        if(pixel[1]+i <= dimenciones.height-1)
        for (let x = Math.max(0, pixel[0] - i); x <= Math.min(dimenciones.width-1, pixel[0]+i - 1); x++) {
             expand(item, frame, check, [x, pixel[1] + i]);
        }

        if(pixel[0]-i >= 0)
        for (let y = Math.max(0, pixel[1] - i+1); y <= Math.min(dimenciones.height-1, pixel[1]+i - 1); y++) {
             expand(item, frame, check, [pixel[0] - i, y]);
        }

    }
}