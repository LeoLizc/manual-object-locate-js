import { distancia } from "./utils.js";
import Item from "./item.js";

let dimenciones = {
    height: 500,
    width: 500,
};
let minDif = 180;

function sensibilityHandler(ev) {
    // console.log(ev);
    minDif = ev.target.value;
    // document.getElementById('labelS').value = minDif;
    document.getElementById("labelS").innerHTML = minDif;
}

window.onload = () => {
    loadVideo();
    document.getElementById("sens").onchange = sensibilityHandler;
};

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
    let color = [0, 255, 0];

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
        let prom = {
            coord: [0, 0],
            cont: 0,
        };
        const items = [];
        for (let i = 0; i < frame.length; i += 4) {
            // if(!mejor){
            //     mejor = {
            //         coord: idx2XY(i/4),
            //         dist: distancia(color, [frame[i], frame[i+1], frame[i+2]])
            //     };
            // }else{
            //     let dist = distancia(color, [frame[i], frame[i+1], frame[i+2]]);
            //     if(dist < mejor.dist){
            //         mejor = {
            //             coord: idx2XY(i/4),
            //             dist: dist
            //         };
            //     }
            // }
            // console.log('hi');
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
                // frame[i] = 0;
                // frame[i+1] = 0;
                // frame[i+2] = 255;
                // console.log('a');
            }
        }
        // ctx.putImageData(data, 0, 0);

        prom.coord = prom.coord.map((val, idx) => {
            return val / prom.cont;
        });
        // console.log(prom);
        ctx.beginPath();
        ctx.fillStyle = ctx.strokeStyle = "red";
        ctx.ellipse(...prom.coord, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        console.log(items);
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
