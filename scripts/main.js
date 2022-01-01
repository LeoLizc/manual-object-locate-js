let dimenciones = {
    height: 500,
    width: 500
};
let minDif = 180;

function sensibilityHandler(ev){
    // console.log(ev);
    minDif = ev.target.value;
    // document.getElementById('labelS').value = minDif;
    document.getElementById('labelS').innerHTML = minDif;
}

window.onload = ()=>{
    loadVideo();
    document.getElementById('sens').onchange = sensibilityHandler;
}

function loadVideo(){
    var video = document.querySelector("#camera");
    config = {
        audio: false,
        video: dimenciones
    };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(config)
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

function processImage(video){
    canva = document.getElementById('lienzo');
    canva.height = dimenciones.height;
    canva.width = dimenciones.width;
    ctx = canva.getContext('2d')
    // let cont = 0;
    let color = [0, 255, 0];

    setInterval(()=>{
        ctx.drawImage(video, 0, 0);
        // cont++;

        let data = ctx.getImageData(0, 0, dimenciones.height, dimenciones.width);
        let frame = data.data; 
        let mejor = {
            coord: [0, 0],
            cont: 0
        };
        for (let i = 0; i < frame.length; i+=4) {
            // if(!mejor){
            //     mejor = {
            //         coord: idx2XY(i/4),
            //         dist: distance(color, [frame[i], frame[i+1], frame[i+2]])
            //     };
            // }else{
            //     let dist = distance(color, [frame[i], frame[i+1], frame[i+2]]);
            //     if(dist < mejor.dist){
            //         mejor = {
            //             coord: idx2XY(i/4),
            //             dist: dist
            //         };
            //     }
            // }
            // console.log('hi');
            if(distance(color,[frame[i], frame[i+1], frame[i+2]])<minDif){
                [frame[i], frame[i+1], frame[i+2]] = [0, 0, 255];
                let dim = idx2XY(i/4);
                mejor.coord = mejor.coord.map((val, idx)=>{
                    return val+dim[idx];
                });
                mejor.cont++;
                // frame[i] = 0;
                // frame[i+1] = 0;
                // frame[i+2] = 255;
                // console.log('a');
            }

        }
        ctx.putImageData(data, 0, 0);

        mejor.coord = mejor.coord.map((val, idx)=>{
            return val/mejor.cont;
        });
        // console.log(mejor);
        ctx.beginPath();
        ctx.fillStyle = ctx.strokeStyle = 'red';
        ctx.ellipse(...mejor.coord, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

    }, 50)
    
    // setInterval(()=>{
    //     console.clear();
    //     console.log('fps:', cont);
    //     cont = 0;
    // }, 1000);
}

function distance(point1, point2){
    return Math.sqrt(point1.reduce((acum, curr, idx)=>{
        return acum + Math.pow(curr-point2[idx], 2)
    }, 0));
}

function idx2XY(idx){
    let y = Math.floor(idx/dimenciones.width);
    let x = idx%dimenciones.width;
    return [x, y];
}