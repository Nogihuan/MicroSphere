var canvas = document.getElementById("backgroundCanvas");
var ctx = canvas.getContext("2d");

var aWrapper = document.getElementById("aWrapper");

var canvasPotato = document.getElementById("potatoCanvas");
var ctxP = canvasPotato.getContext("2d");

var clearWp=0;
var clearHp=0;

/*DATI DA Jacopo
verticalStep: i-th step / n' step
*/
var iStep = 0; // da -7 a +7
var nStep = 15;
var verticalStep = iStep / nStep;

//Trasparenza iniziale
canvas.style.opacity = 0;
canvas.style.transition = "opacity 2s";

//changing the Pixel Ratio will make the canvas blurry in some devices, yeee
//with this section you force the 1:1 pixel ratio
function setCanvasScalingFactor() {
   return window.devicePixelRatio || 1;
}

function resizeCanvas() {
    //Gets the devicePixelRatio
    var pixelRatio = setCanvasScalingFactor();

    //The viewport is in portrait mode, so var width should be based off viewport WIDTH
    if (window.innerHeight > window.innerWidth) {
        //Makes the canvas 100% of the viewport width
        var width = Math.round(1.0 * window.innerWidth);
    }
  //The viewport is in landscape mode, so var width should be based off viewport HEIGHT
    else {
        //Makes the canvas 100% of the viewport height
        var width = Math.round(1.5 * window.innerHeight);
    }

    //This is done in order to maintain the 1:1 aspect ratio, adjust as needed
    var height =0.5*width;

    //This will be used to downscale the canvas element when devicePixelRatio > 1
    aWrapper.style.width = width + "px";
    aWrapper.style.height = height + "px";

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    canvasPotato.width = width * pixelRatio;
    canvasPotato.height = height * pixelRatio;

    clearWp=canvasPotato.width;
    clearHp=canvasPotato.height;
}

resizeCanvas();

//New Origin Point
x0=Math.round(0.2*canvas.width) +0.5;
y0=Math.round(0.5*canvas.height) +0.5;
var radius = 20;


var start = document.getElementById("startButton");
var reset = document.getElementById("resetButton");

var idCan;
start.onclick = startCanvas;
reset.onclick = resetCanvas;

var xp=0;
var yp=0;

//---------------------------- BACKGROUND
var img = new Image();
img.src = 'img/stars.png';

var CanvasW = canvas.width;
var CanvasH = canvas.height;

var speed = 10;
/* A MALI ESTREMI ESTREMI, ESTREMI RIMEDI
console.log(canvas.width, img.width, canvas.height,img.height)
var scale = Math.min(canvas.width/img.width, canvas.height/img.height);
Width : 1920 pixels
Height: 1080 pixels
*/
var scale = Math.min(canvas.width/1920, canvas.height/1080); ;
var y = 0;

var dx = 0.75;
var imgW;
var imgH;
var x = 0;
var clearX;
var clearY;

function startCanvas() {
    imgW = img.width * scale;
    imgH = img.height * scale;
    if (imgW > CanvasW) {
      x = CanvasW - imgW; }
    if (imgW > CanvasW) { clearX = imgW; }
    else { clearX = CanvasW; }
    if (imgH > CanvasH) { clearY = imgH; }
    else { clearY = CanvasH; }
    //DISEGNA CERCHIO
    drawPotato();

    dissolvenzaCanvas();
    return idCan = setInterval(draw, speed);
}

  function draw() {
      ctx.clearRect(0, 0, clearX, clearY);
      //DISEGNA SFONDO
      if (imgW <= CanvasW) { //QUI NON ENTRA
          if (x > CanvasW) { x = -imgW + x; }
          if (x > 0) {
            ctx.drawImage(img, -imgW + x, y, imgW, imgH); }

          if (x - imgW > 0) {
            ctx.drawImage(img, -imgW * 2 + x, y, imgW, imgH); }

      }

      //void ctx.drawImage(image, dx, dy, dWidth, dHeight);
      else {
          if (x > (CanvasW)) { x = CanvasW - imgW; }
          if (x > (CanvasW-imgW)) {
            ctx.drawImage(img, x - imgW + 1, y, imgW, imgH); }
      }
      ctx.drawImage(img, x, y,imgW, imgH);

      x += dx;

  }



//---------------------------------------

function drawPotato() {
  yp = clearHp * verticalStep; //scaling factor by jacopo
  ctxP.clear(true);
  ctxP.translate(x0,y0);
  ctxP.beginPath(); //This line gave me a major headache.
  ctxP.arc(xp, yp, radius, 0 , 2 * Math.PI);
  ctxP.fillStyle = "white";
  ctxP.fill();
  ctxP.translate(-x0,-y0);
  requestAnimationFrame(drawPotato);
}

function dissolvenzaCanvas() {
    canvas.style.opacity = 1;
    canvasPotato.style.opacity = 1;
}

function resetCanvas(){
  clearInterval(idCan);
  canvas.style.opacity = 0;
  canvasPotato.style.opacity = 0;
}

CanvasRenderingContext2D.prototype.clear =
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }
};
