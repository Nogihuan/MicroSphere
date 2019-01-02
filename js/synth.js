//<<<<<<<<<<<< INIZIO CODICE CONTROLLER >>>>>>>>>>>>>>>>
//variabili

//La nota più bassa registrata dall'accordo, va da 0 a 12
var ROOTNOTE;
//la scala scelta dall'inclinazione del polso tra quelle suggerite dall'applicazione
var CURRENTSCALE;
//Ultima nota suonata: HA VALORI DA 0 A 20 per il momento
var CURRENTNOTE;
//le scale che vengono valutate per esserre proposte
var MAJORMODESCALE;
//Le tre scale che si possono suoanre
var SCALESTOPLAY; // array
//variabili per acquisire e memorizzare gli accordi
var currentAcquiredNotes;
//capire se mi può servire realmente
var lastAcquiredNotes; //last of 30 sec
//Tiene conto di quante acquisizioni di note ho fatto
var numberOfRec;
//IMPORTANTISSIMA , MI SERVE PER CAMBIARE TONALITà
var currentDiff;
//Valore attualmente suonata in valore midi
var currentMidiNote;


//Inializza tutti i valori
function initialValues(){

  MAJORMODESCALE = new Map();
  BRIGHTNESS = new Map();
  CURRENTSCALE = new Set();
  SCALESTOPLAY = new Array();
  currentAcquiredNotes = new Set();
  lastAcquiredNotes = {}

  //scale dei modi maggiori
  var lyd = new Set([ 0, 2, 4, 6, 7, 9, 11 ]);
  var ion = new Set([ 0, 2, 4, 5, 7, 9, 11 ]);
  var mix = new Set([ 0, 2, 4, 5, 7, 9, 10 ]);
  var dor = new Set([ 0, 2, 3, 5, 7, 9, 10 ]);
  var aol = new Set([ 0, 2, 3, 5, 7, 8, 10 ]);
  var phr = new Set([ 0, 1, 3, 5, 7, 8, 10 ]);
  var loc = new Set([ 0, 1, 3, 5, 6, 8, 10 ]);

  MAJORMODESCALE.set('LYD',lyd);
  MAJORMODESCALE.set('ION',ion);
  MAJORMODESCALE.set('MIX',mix);
  MAJORMODESCALE.set('DOR',dor);
  MAJORMODESCALE.set('AOL',aol);
  MAJORMODESCALE.set('PHR',phr);
  MAJORMODESCALE.set('LOC',loc);

  BRIGHTNESS.set('LYD',6);
  BRIGHTNESS.set('ION',5);
  BRIGHTNESS.set('MIX',4);
  BRIGHTNESS.set('DOR',3);
  BRIGHTNESS.set('AOL',2);
  BRIGHTNESS.set('PHR',1);
  BRIGHTNESS.set('LOC',0);

  numberOfRec = 0;
  currentRec = 0;
  CURRENTSCALE = ion;
  SCALESTOPLAY = CURRENTSCALE;
  ROOTNOTE = 0; //Corrisponde a un do
  CURRENTNOTE = 0; //nessuna nota suonata ancora
}

initialValues();


//questa funzione viene  chiamata da microbit quando si deve suonare una nota!
//se currentnote appartiene a currentscale ritorna true
function noteIsOnScale(){
  if(CURRENTSCALE.has(findNote(CURRENTNOTE))){
    return true;}}

//suona la nota se noteIsOnScale
function playIfyouCan(){
   //suona note dal C3 al C5
  if(noteIsOnScale()){
    currentMidiNote =  ROOTNOTE + CURRENTNOTE + 36;//midi
    console.log("I play note : " + currentMidiNote);
    noteOn(currentMidiNote);}
}

/*
//oscillatore da sostituire con il synth
function oscillatorStart(){
  var note =  ROOTNOTE + CURRENTNOTE + 60;//midi
  console.log(note);
  var c = new AudioContext();
  o = c.createOscillator();
  g = c.createGain();
  g.connect(c.destination);
  o.connect(g);
  now = c.currentTime;
  g.gain.setValueAtTime(0,now);
  g.gain.linearRampToValueAtTime(1,now+0.1);
  g.gain.linearRampToValueAtTime(0,now+0.5);
  note =  262 * Math.pow(2,(note-60)/12);//frequenza
  o.frequency.value = note;
  o.start();
}*/

//questa funzione raccoglie tutte le note midi proveniente dall'accordo
function acquireNote(note){
  currentAcquiredNotes.add(note);
  if(currentAcquiredNotes.size>3){
    //currentAcquiredNotes.forEach(function(el){console.log("notes acquired : " + el )})
    var tmp = new Array();
    currentAcquiredNotes.forEach(function(n){tmp.push(findNote(n))});// faccio il modulo
    tmp.length > 3 // devono essere 4 note diverse, se preme c3 e c4 è come se avesse premuto una nota.
    ? startNewRec(tmp) : console.log("mancano ancora delle note");
  }
}


//tmp ha il modulo 12 delle note acuisite alla rec numberOfRec
function startNewRec(tmp){
  numberOfRec++;
  findRootNote(); // trova la root e le cancella l'ultima rec
  lastAcquiredNotes = {numberOfRec:tmp}
  tmp = compareScale(tmp, numberOfRec)} // confronta le note acquisite con le scale e cancella il set

//prende la nota più bassa dell'accordo e la fa diventare ROOT
//LA ROOTNOTE HA VA DA 0 A 12
//quindi quando acquisisco le note non posso fare subito module 12 perchè mi serve sapere chi è la più bassa
//MI SALVA currentDiff
function findRootNote(){
  var lowest = 0;
  currentAcquiredNotes.forEach(function(note){
    lowest == 0 ? lowest = note
    :( note<lowest ? lowest=note
         :lowest=lowest)})
  currentAcquiredNotes.clear();
  lowest = findNote(lowest); //trova il modulo
  lowest!=ROOTNOTE ? currentDiff= ROOTNOTE-lowest :currentDiff = 0
  ROOTNOTE = lowest;
  console.log("LA ROOT  E' :" + ROOTNOTE + "La CURRENT DIFF E' " + currentDiff);
}

//trova l'ottava della nota
function findOctave(note){
  octave=0;
  if(note<12){octave=0};
  if(note>=12 && note<24){octave=1};
  if(note>=24 &&note<36){octave=2};
  if(note>=36 &&note<48){octave=3};
  if(note>=48 &&note<60){octave=4};
  if(note>=60 &&note<72){octave=5};
  if(note>=72 &&note<84){octave=6};
  if(note>=84 &&note<96){octave=7};
  if(note==108){octave=8};
  return octave;
}

//ritorna la nota modulo 12 dalle note midi
function findNote(note){
  var octave = findOctave(note);
  var module12Note = note-octave*12;
  return module12Note;
}
//CAMBIA UNA SCALA QUANDO VIENE CHIAMATA //verificare se è giusto X*D
function setTonality(currentScale){
    var scale = new Set();
    let newNote
    for(let i of currentScale){
          newNote = i+currentDiff;
          newNote >= 0 & newNote < 12 ? scale.add(newNote)
          : newNote<0 ? scale.add(newNote+11) : scale.add(newNote-11)
          }
   return scale;
}


//METTE SU SCALESTOPLAY LE SCALE CAMBIATE DI TONALITA'
//viene chiamata da setRec()per trovare la migliore scala per quella rec di note
function compareScale(tmpScale, rec){
  var sugScales = new Array(); // MI SERVE SOLO PER TENERE TRACCIA DEL MODO, POI è INUTILE
  var setScale = new Set();
  tmpScale.forEach(function (el){console.log("valori di tmp  "  +  el)});
  for (const [mode, scale] of MAJORMODESCALE){
    setScale  = setTonality(scale);
    //for(let v of setScale ){
    //console.log("note della scala : " + mode + " dopo set tonaliy :" + v);}
    var comNotes = new Set(tmpScale.filter(x => setScale .has(x)));
    //comNotes.forEach(function (el){console.log("valori di comNotes" +  el)});

    //aggiunge tutte le scale con più di tre note in comune con l'accordo midi
  console.log("NUMERO INTERSEZIONI : " + comNotes.size + " CON LA SCALA :" + mode)
    if(comNotes.size>3){
      // compatibilità più alte stanno in posizioni più alte
      if(sugScales[comNotes.size-4] == null){
          sugScales[comNotes.size-4] = mode; SCALESTOPLAY[comNotes.size-4] = setScale;
          console.log("IMPOSTO LA SCALA : " + sugScales[comNotes.size-4] + " nella posizione " +  comNotes.size-4);
          console.log("SCALESTOPLAY è un set : " + SCALESTOPLAY[comNotes.size-4])}
      else{
           var br1 = BRIGHTNESS.get(mode);
           var br2 = BRIGHTNESS.get(sugScales[comNotes.size-4]);
           console.log("BRIGHTNESS di  " + mode + " e' : "  + br1 + " BRIGHTNESS di "+ sugScales[comNotes.size-4]+ " e' " + br2)
           let j=0; var move =false;
           while(sugScales[comNotes.size-4+j]!=null){j++; move=true};
           if(move){while(j>0){console.log("devo spostare la scala : " + sugScales[comNotes.size-4+j]);
                              sugScales[comNotes.size-4+j+1] = sugScales[comNotes.size+j-4]; j--}};
           br1<br2 ?  (sugScales[comNotes.size-4] = sugScales[comNotes.size-4+1],
                        sugScales[comNotes.size-4+1] = mode, SCALESTOPLAY[comNotes.size-4+1]= setScale) // le più scure nelle posizioni più prossime allo 0
                   :  (sugScales[comNotes.size-4] = mode , SCALESTOPLAY[comNotes.size-4]= setScale )}
    }//fine primo if
  }//fine for
  //console.log di verifica, si possono cancellare
  var size = sugScales.length;
  for(let k=0 ; k < size; k++){
    console.log("ECCOTI LE SCALE ORDINATE di sugg " + k + " e' : " +  sugScales[k]);
    console.log("ECCOTI LE SCALE ORDINATE di Scaleto play " + k + " e' : " +  SCALESTOPLAY[k]);
  }

  console.log("Le playable Scale sono  : " + SCALESTOPLAY.length);
  if(size < 1){
    console.log("there are no scale for this chord")}
  return sugScales //sono i modi delle scale suonabili ordinate su un array in base alle note in comune
}


// MIDI ACCESS
navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}
function getMIDIMessage(message) {
    var command = message.data[0];
    var note = message.data[1];
    console.log(message);
    var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

    switch (command) {
        case 144: // noteOn
            if (velocity > 0) {
              console.log("acquired");
              acquireNote(note);
            break;
      }
  }
}
function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values())
        input.onmidimessage = getMIDIMessage;
    }


//FINE CODICE CONTOLLER


// <<<<<<<<<<< CODICE DI MICROBIT >>>>>>>>>>>>>>>

//Variable
var microBit;
var ACCEL_SRV = 'e95d0753-251d-470a-a062-fa1922dfa9a8'
var ACCEL_DATA = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'
var ACCEL_PERIOD = 'e95dfb24-251d-470a-a062-fa1922dfa9a8'
var BTN_SRV = 'e95d9882-251d-470a-a062-fa1922dfa9a8'
var BTN_A_STATE = 'e95dda90-251d-470a-a062-fa1922dfa9a8'
var BTN_B_STATE = 'e95dda91-251d-470a-a062-fa1922dfa9a8'
var pol = 1; //posizione del polso
var van = 0; //valore nota
var con; //contour melodico
var ctr = 0; //un semplice counter



class uBit {

  constructor() {
    this.accelerometer = {
      x: 0,
      y: 0,
      z: 0
    };

    this.buttonA = 0;
    this.buttonACallBack=function(){};

    this.buttonB = 0;
    this.buttonBCallBack=function(){};

    this.connected = false;

    this.onConnectCallback=function(){};
    this.onDisconnectCallback=function(){};

    this.onBLENotifyCallback=function(){};
  }

//SERIE DI FUNZIONI
  getAccelerometer() {
      return this.accelerometer;
  }

  getButtonA() {
    return this.buttonA;//QUI NO
  }

  setButtonACallback(callbackFunction){//QUI NO
    this.buttonACallBack=callbackFunction;
  }

  getButtonB() {
    return this.buttonB;
  }

  setButtonBCallback(callbackFunction){
    this.buttonBCallBack=callbackFunction;
  }

  onConnect(callbackFunction){
    this.onConnectCallback=callbackFunction;

  }

  onDisconnect(callbackFunction){
    this.onDisconnectCallback=callbackFunction;
  }

  onBleNotify(callbackFunction){
  this.onBLENotifyCallback=callbackFunction;
}


 onButtonA(){//QUI NO
    this.buttonACallBack();
 }

  onButtonB(){
    this.buttonBCallBack();
  }


  characteristic_updated(event) {

    this.onBLENotifyCallback();

    if (event.target.uuid == BTN_A_STATE) {
      console.log("BTN_A_STATE"+ event.target.value.getInt8());
      this.buttonA = event.target.value.getInt8();
      if (this.buttonA){
        this.onButtonA();
      }
    }
   if (event.target.uuid == BTN_B_STATE) {
      console.log("BTN_B_STATE" + event.target.value.getInt8());
      this.buttonB = event.target.value.getInt8();
      if (this.buttonB){
        this.onButtonB();
      }
    }

    //ACCELEROMETER CHARACTERISTIC
    if (event.target.uuid == ACCEL_DATA) {
      this.accelerometer.x = event.target.value.getInt16(0, true);
      this.accelerometer.y = event.target.value.getInt16(2, true);
      this.accelerometer.z = event.target.value.getInt16(4, true);
    }
  }

  searchDevice() {
    filters: []
    var options = {};
    options.acceptAllDevices = true;
    options.optionalServices = [ACCEL_SRV];
    options.service = [BTN_SRV];
    options.service = [BTN_A_STATE];
    options.service= [BTN_B_STATE];

    console.log('Requesting Bluetooth Device...');
    console.log('with ' + JSON.stringify(options));

    navigator.bluetooth.requestDevice(options)
    .then(device => {
      console.log('> Name:             ' + device.name);
      console.log('> Id:               ' + device.id);
      device.addEventListener('gattserverdisconnected', this.onDisconnectCallback);
      // Attempts to connect to remote GATT Server.
      return device.gatt.connect();

    })
    .then(server => {
      // Note that we could also get all services that match a specific UUID by
      // passing it to getPrimaryServices().
      this.onConnectCallback();
      console.log('Getting Services...');
      return server.getPrimaryServices();
    })
    .then(services => {
      console.log('Getting Characteristics...');
      let queue = Promise.resolve();
      services.forEach(service => {
        queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
          console.log('> Service: ' + service.uuid);
          characteristics.forEach(characteristic => {
            console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
              getSupportedProperties(characteristic));
            if (getSupportedProperties(characteristic).includes('NOTIFY')) {
              characteristic.startNotifications().catch(err => console.log('startNotifications', err));
              characteristic.addEventListener('characteristicvaluechanged',
                this.characteristic_updated.bind(this));
            }
          });
        }));
      });
      return queue;
    }
  )
    .catch(error => {
      console.log('Argh! ' + error);
    });
  }

}

/* Utils */

function isWebBluetoothEnabled() {
  if (navigator.bluetooth) {
    return true;
  } else {
    ChromeSamples.setStatus('Web Bluetooth API is not available.\n' +
      'Please make sure the "Experimental Web Platform features" flag is enabled.');
    return false;
  }
}

function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}

function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

microBit=new uBit();

microBit.onConnect(function(){
  console.log("connected");
  microBit.setButtonACallback(function(){
    console.log("buttonA pressed");
  });

  microBit.setButtonBCallback(function(){
    console.log("buttonB pressed");
  });
});

microBit.onDisconnect(function(){
  console.log("disconnected");
  //document.getElementById("connected").innerHTML="false";
});

function searchDevice(){
  microBit.searchDevice();
};

var changed; //totalmente inutile, ma al momento
var acX = 0;
var acY = 0;
var acZ = 0;


microBit.onBleNotify(function(){

  document.getElementById("acc_X").innerHTML=microBit.getAccelerometer().x;
  document.getElementById("acc_Y").innerHTML=microBit.getAccelerometer().y;
  document.getElementById("acc_Z").innerHTML=microBit.getAccelerometer().z;

  acX = microBit.getAccelerometer().x;
  acY = microBit.getAccelerometer().y;
  acZ = microBit.getAccelerometer().z;

  if( acZ<0 && acY<=1024 && acY>330 ){
     pol = 1;
     SCALESTOPLAY[0]!=null ?
        (SCALESTOPLAY != CURRENTSCALE ?
          (CURRENTSCALE = SCALESTOPLAY[0])
          :changed = false)
     :changed = false}//console.log(" su polso :" + pol + " non ci sono scale" )}

  if( acZ<0 && acY<=330 && acY>=-360){
     pol = 2;
    SCALESTOPLAY[1]!=null ?
       (SCALESTOPLAY != CURRENTSCALE ?
          (CURRENTSCALE = SCALESTOPLAY[1])
          :changed = false)
     :changed = false}//console.log(" su polso :" + pol + " non ci sono scale" )}

  if( acZ<0 && acY<-360 && acY>=-1024){
     pol = 3;
     SCALESTOPLAY[2]!=null ?
        (SCALESTOPLAY != CURRENTSCALE ?
          (CURRENTSCALE = SCALESTOPLAY[2])
          :changed = false)
     : changed = false}

//c3 a E4
     if( acZ<0 && acX>=-1024 && acX<-931 ){
         van = 0;
         con = van - ctr;
         ctr = van;}
    else if( acZ<0 && acX>=-931 && acX<-846 ){
         van = 1;
         con = van - ctr;
         ctr = van;}
    else if( acZ<0 && acX>=-846 && acX<-761 ){
         van = 2;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-761 && acX<-676 ){
         van = 3;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-676 && acX<-591 ){
         van = 4;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-591 && acX<-506 ){
         van = 5;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-506 && acX<-421 ){
         van = 6;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-421 && acX<-336 ){
         van = 7;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-336 && acX<-251 ){
         van = 8;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-251 && acX<-166 ){
         van = 9;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=-81 && acX<4){
         van = 10;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=4 && acX<89 ){
         van = 11;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=89 && acX<174 ){
         van = 12;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=174 && acX<259 ){
         van = 13;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=259 && acX<344){
         van = 14;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=344 && acX<429 ){
         van = 15;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=429 && acX<514){
         van = 16;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=514 && acX<599 ){
         van = 17;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=599 && acX<684 ){
         van = 18;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=684 && acX<769 ){
         van = 19;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=769 && acX<854 ){
         van = 20;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=854 && acX<939 ){
         van = 21;
         con = van - ctr;
         ctr = van;}
     else if( acZ<0 && acX>=939 && acX<1024 ){
         van = 22;
         con = van - ctr;
         ctr = van;}

    van!=CURRENTNOTE ? (console.log ("I stop note : " + currentMidiNote), noteOff(currentMidiNote), CURRENTNOTE = van, playIfyouCan())
                :changed = false;
})

//<<<<<<<<<<< FINE CODICE MICROBIT >>>>>>>>>>>>>
// <<<<<<<<<< INIZIO COIDCE SYNTH >>>>>>>>>>>>>>>>

var c = new AudioContext();

//All the oscillators active now
var activeOscillators = new Array();


var currentModFrequency = 2.1; // Hz * 10 = 2.1
var currentModOsc1 = 1.5;


var currentOsc1Detune = 0;
var currentOsc1Mix = 50.0;

var currentFilterCutoff= 8;

var currentFilterQ = 7;
var currentFilterMod = 21;
var currentFilterEnv = 56;

//valori dell'envelope di oscillatori + filtro
var currentEnvA = 2;
var currentEnvD = 15;
var currentEnvS = 68;
var currentEnvR = 5;

// valori dell'envelope del filtro
var currentFilterEnvA = 5;
var currentFilterEnvD = 6;
var currentFilterEnvS = 5;
var currentFilterEnvR = 7;

//mix di riverbero e distorsione tra due gain
var currentRev = 0;
var currentDist = 0;

var currentDelay = 0.0;
var currentGainDelay = 5;
var currentDistortion = 0;// è il valore curve di distortion


var effectChain;
var distortion;
var distortionGain;
var masterGain;
var revWetGain;
var revDryGain;
var convolver;
var compressor;
var delay;
var gainDelay;
var preDelayGain;
var analyser;


initAudio2();

//tutti i tasti
var allKeys = document.getElementsByTagName("li");
var wavePicker = document.querySelector("select[name='waveform']");
var modwavePicker = document.querySelector("select[name='modwaveform']");
var sineTerms = new Float32Array([0, 0, 1, 0, 1]);
var cosineTerms = new Float32Array(sineTerms.length);
var customWaveform ;

//When playing a note
function noteOn( note, velocity ) {
	if (activeOscillators[note] == null) {
		 activeOscillators[note] = new playNote(note, velocity/127.0);}
/*
 //visualizzare la nota che stai suonando
document.querySelectorAll(" .white ").forEach(function(key){ if(key){allKeys.item(note).classList.add("whiteActive");}});
    document.querySelectorAll(" .black ").forEach(function(key){ if(key){allKeys.item(note).classList.add("blackActive");}});*/
	}
function noteOff( note ) {
	if (activeOscillators[note] != null) {
		// Shut off the note playing and clear it
		stopNote(note);
		activeOscillators[note] = null;}
 /*
    //visulizzare la nota che stai suonando
    document.querySelectorAll(" .white ").forEach(function(key){ if(key){allKeys.item(note).classList.remove("whiteActive");}});
    document.querySelectorAll(" .black ").forEach(function(key){ if(key){allKeys.item(note).classList.remove("blackActive");}});
  }*/
}


function filterFrequencyFromCutoff( pitch, cutoff ) {
    var nyquist = 0.5 * c.sampleRate;
    var filterFrequency = Math.pow(2, (9 * cutoff) - 1) * pitch;
    if (filterFrequency > nyquist)
        filterFrequency = nyquist;
	return filterFrequency;
}

//change MIDI in frequency
function frequencyFromNoteNumber( note ) {
	return  65 * Math.pow(2,(note-36)/12);//frequenza
}

//choose the type of wave
function chooseOscillatorType(){
  let type1 = wavePicker.options[wavePicker.selectedIndex].value;
  return type1;
}
function chooseModType(){
  let type2 = modwavePicker.options[wavePicker.selectedIndex].value;
  return type2;
}


//FUNZIONE PRINCIPALE_: crea gli oscillatori, i modulatori, i filtri e li collega
function playNote(note, v){

   //creo un primo oscillatore e gli do parametri freq e gain iniziale
   this.oscillator1 = c.createOscillator();
   this.oscillator1.frequency.value = frequencyFromNoteNumber( note );

  //tipo di wave
  let type =  chooseOscillatorType();
  if (type == "custom") {
    customWaveform = c.createPeriodicWave(cosineTerms, sineTerms);
    this.oscillator1.setPeriodicWave(customWaveform);}
  else {
    this.oscillator1.type = type;
    }

  //gain a cui collego l'oscillatore
   this.osc1Gain = c.createGain();
 	 this.osc1Gain.gain.value = 0.005 * currentOsc1Mix;
 //this.osc1Gain.gain.value = 0.05 + (0.33 * velocity);
	 this.oscillator1.connect( this.osc1Gain);


  // creo un secondo oscillatore, in funzione di modulatore, a cui do una frequenza iniziale
	this.modOsc = c.createOscillator();
	this.modOsc.type = chooseModType();
	this.modOsc.frequency.value = currentModFrequency ;
  //collego il modulatore a un gain e collego il modulatore al primo oscillatore così che varia il suo gain in base alla frequenza
	this.modOsc1Gain = c.createGain();
	this.modOsc.connect( this.modOsc1Gain );
	this.modOsc1Gain.gain.value = currentModOsc1;
	this.modOsc1Gain.connect( this.oscillator1.frequency );


  // creo due filtri biquadro con parametri tipo, q factor, frequenza,
	this.filter1 = c.createBiquadFilter();
	this.filter1.type = "peaking";
	this.filter1.Q.value = currentFilterQ;
	this.filter1.frequency.value = Math.pow(2, currentFilterCutoff);
	//filterFrequencyFromCutoff( this.originalFrequency, currentFilterCutoff );
  //console.log( "filter frequency: " + this.filter1.frequency.value);
	this.filter2 = c.createBiquadFilter();
	this.filter2.type = "lowpass";
	this.filter2.Q.value = currentFilterQ;
	this.filter2.frequency.value = Math.pow(2, currentFilterCutoff);



	this.osc1Gain.connect( this.filter2 );
  this.filter1.connect( this.filter2 );

	// per collegare il modulatore al filtro creo un altro gain , gli collego il modulatore e lo collego a entrmbi i filtri
	this.modFilterGain = c.createGain();
	this.modOsc.connect( this.modFilterGain );
	this.modFilterGain.gain.value = currentFilterMod*24;
//	console.log("modFilterGain=" + currentFilterMod*24);
  this.modFilterGain.connect( this.filter1.detune );	// filter vibrato
	this.modFilterGain.connect( this.filter2.detune );	// filter vibrato

	// crepo l'envelope dell'attacco all'oscillatore
	this.envelope = c.createGain();
	this.filter2.connect( this.envelope );
	this.envelope.connect( effectChain );

	// set up the volume and filter envelopes
	var now = c.currentTime;
	var envAttackEnd = now + (currentEnvA/20.0);

	this.envelope.gain.value = 0.0;
	this.envelope.gain.setValueAtTime( 0.0, now );
	this.envelope.gain.linearRampToValueAtTime( 1.0, envAttackEnd );
	this.envelope.gain.setTargetAtTime( (currentEnvS/100.0), envAttackEnd, (currentEnvD/100.0)+0.001 );


	var filterAttackLevel = currentFilterEnv*72;  // Range: 0-7200: 6-octave range
	var filterSustainLevel = filterAttackLevel* currentFilterEnvS / 100.0; // range: 0-7200
	var filterAttackEnd = (currentFilterEnvA/20.0);
	if (!filterAttackEnd)
				filterAttackEnd=0.05;
	this.filter1.detune.setValueAtTime( 0, now );
	this.filter1.detune.linearRampToValueAtTime( filterAttackLevel, now+filterAttackEnd );
	this.filter2.detune.setValueAtTime( 0, now );
	this.filter2.detune.linearRampToValueAtTime( filterAttackLevel, now+filterAttackEnd );
	this.filter1.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, (currentFilterEnvD/100.0) );
	this.filter2.detune.setTargetAtTime( filterSustainLevel, now+filterAttackEnd, (currentFilterEnvD/100.0) );

	this.oscillator1.start(0);
	this.modOsc.start(0);
}
function stopNote(note){
  var now =  c.currentTime;
	var release = now + (currentEnvR/10.0);
  var initFilter = filterFrequencyFromCutoff( this.originalFrequency, currentFilterCutoff/100 * (1.0-(currentFilterEnv/100.0)) );

  activeOscillators[note].envelope.gain.cancelScheduledValues(now);
  activeOscillators[note].envelope.gain.setValueAtTime( activeOscillators[note].envelope.gain.value, now );  // this is necessary because of the linear ramp
  activeOscillators[note].envelope.gain.setTargetAtTime(0.0, now, (currentEnvR/100));

  activeOscillators[note].filter1.detune.cancelScheduledValues(now);
  activeOscillators[note].filter1.detune.setTargetAtTime( 0, now, (currentFilterEnvR/100.0) );
  activeOscillators[note].filter2.detune.cancelScheduledValues(now);
  activeOscillators[note].filter2.detune.setTargetAtTime( 0, now, (currentFilterEnvR/100.0) );

  delay.delayTime.cancelScheduledValues(now);
  delay.delayTime.setTargetAtTime(0, now, currentDelay );
 // activeOscillators[note].stop();

}



//CONTROLLI EFFETTI
function makeDistortionCurve(value) {
  var k = typeof value === 'number' ? value : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  currentDistortion= curve;
  return curve;
};

//funzione che cambia i valori della dist
var mixDist = function( value ) {
	// equal-power crossfade
	var gain1 = Math.cos(value * 0.5*Math.PI);
	var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);
	preDelayGain.gain.value = gain1;
	distortionGain.gain.value = gain2;
}

//funzione che cambia i valori del riverbero sui gain
var mixRev = function( value ) {
	// equal-power crossfade
	var gain1 = Math.cos(value * 0.5*Math.PI);
	var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);
	revDryGain.gain.value = gain1;
	revWetGain.gain.value = gain2;
}

//chiamato ogni volta che viene modificato il riverbero
function changeValue(string){
  var value = parseFloat(string) / 100.0;
  currentRev = value;
	mixRev(value);
}

function changeDist(string){
   var value = parseFloat(string) / 100.0;
   currentDist = value;
   mixDist(value)
}


//master
document.querySelector("#masterGain").oninput = function(){
  currentVol = this.value;
  masterGain.gain.value = currentVol;
}

//time delay
document.querySelector("#timeDelay").oninput = function(){
  currentDelay = this.value;
  delay.delayTime.value = currentDelay;
}

//gain of delay
document.querySelector("#gDelay").oninput = function(){
  currentGainDelay = this.value;
  gainDelay.gain.value = currentGainDelay;
}

//distortion curve
document.querySelector("#distortionCurve").oninput = function(){
    var value = parseInt(this.value) * 5;
    currentDistortion = makeDistortionCurve(value);
    distortion.curve = currentDistortion;
  }

function oversample(type){
  distortion.oversample = type;
}


//set filters Q value
playNote.prototype.setFilterQ = function( value ) {
  currentFilterQ  = value;
	this.filter1.Q.value = value;
	this.filter2.Q.value = value;
}
document.querySelector("#qFactor").oninput = function(){
    currentFilterQ = this.value;
	  for (var i=0; i<255; i++) {
		if (activeOscillators[i] != null) {
			activeOscillators[i].setFilterQ( currentFilterQ );
      }
    }
 }

//set filter cuffOff
playNote.prototype.setFilterCutoff = function( value ) {
	this.filter1.frequency.value = value;
	this.filter2.frequency.value = value;
}
document.querySelector("#cutOffFilter").oninput = function(){
    var filterCutoff = Math.pow(2, this.value);
    for (var i=0; i<255; i++) {
		if (activeOscillators[i] != null) {
			activeOscillators[i].setFilterCutoff( filterCutoff );
      }
    }
  }

//set modulator frequency
playNote.prototype.updateModOsc1 = function( value ) {
	this.modOsc.frequency.value = value/10;
}
document.querySelector("#freqMod").oninput = function(){
    currentModFrequency = this.value;
    for (var i=0; i<255; i++) {
		if (activeOscillators[i] != null) {
			activeOscillators[i].updateModOsc1( currentModFrequency );
      }
   }
}

/*
playNote.prototype.updateOsc1Mix = function( value ) {

	this.osc1Gain.gain.value = 0.005 * value;

}
*/

/*
playNote.prototype.setFilterMod = function( value ) {

	this.modFilterGain.gain.value = currentFilterMod*24;

//	console.log( "filterMod.gain=" + currentFilterMod*24);

}*/
function getImpulse(impulseUrl) {
  ajaxRequest = new XMLHttpRequest();
  ajaxRequest.open('GET', impulseUrl, true);
  ajaxRequest.responseType = 'arraybuffer';

  ajaxRequest.onload = function() {
    var impulseData = ajaxRequest.response;

    context.decodeAudioData(impulseData, function(buffer) {
        myImpulseBuffer = buffer;
        convolver.buffer = myImpulseBuffer;
        convolver.loop = true;
	      convolver.normalize = true;
      },
      function(e){"Error with decoding audio data" + e.err});
  }
  ajaxRequest.send();
}


// crea effectChain, delay, distortion, convolver, masterGain, compressor
function initAudio2() {

  analyser = c.createAnalyser();
  analyser.ffsize=1024;

	// effetti
	effectChain = c.createGain();
	distortion =  c.createWaveShaper();
  distortion.curve = makeDistortionCurve(0);
  distortion.oversample = "none";

  distortionGain = c.createGain();
  distortionGain.gain.value = 0.3;

  //delay
  delay = c.createDelay();
  preDelayGain = c.createGain();
  gainDelay = c.createGain();
  delay.delayTime.value= 0.0;
  gainDelay.gain.value = 0.0;
  preDelayGain.gain.value = 0.5

  //riverbero che non funge
  convolver = c.createConvolver();
  revWetGain = c.createGain();
	revDryGain = c.createGain();
  revWetGain.gain.value = 0.0;
  revDryGain.gain.value = 1.57;
  getImpulse(' https://crossorigin.me/https://www.dropbox.com/s/5lk5wxavxfoev0x/02-6%20Hall%201-00.wav?dl=0');


  masterGain = c.createGain();
  masterGain.gain.setValueAtTime(1, c.currentTime);
  compressor = c.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-30, c.currentTime);
  compressor.knee.setValueAtTime(40, c.currentTime);
  compressor.ratio.setValueAtTime(12, c.currentTime);
  compressor.attack.setValueAtTime(0, c.currentTime);
  compressor.release.setValueAtTime(0.25, c.currentTime);

  //connessioni
  effectChain.connect( distortion);
  effectChain.connect(preDelayGain);
  distortion.connect( distortionGain);
  distortionGain.connect(delay);
  preDelayGain.connect(delay);
  delay.connect(gainDelay);
  gainDelay.connect(delay);
  delay.connect( convolver );
  delay.connect( revDryGain );
  convolver.connect(revWetGain);
  revWetGain.connect( masterGain);
  revDryGain.connect( masterGain);
  masterGain.connect( compressor );
  compressor.connect(analyser);
  compressor.connect(	c .destination );
}


/*
//PLAY WITH CLICK
document.querySelectorAll(" .white ").forEach(function(key){ key.onmousedown = function(key){ notes = Number(key.target.getAttribute("data-key"));
    playNote(notes);}});
document.querySelectorAll(" .black ").forEach(function(key){ key.onmousedown = function(key){ notes = Number(key.target.getAttribute("data-key"));
    playNote(notes);}});
document.querySelectorAll(" .white ").forEach(function(key){ key.onmouseup = function(key){ notes = Number(key.target.getAttribute("data-key"));
    stopNote(notes);}});
document.querySelectorAll(" .black ").forEach(function(key){ key.onmouseup = function(key){ notes = Number(key.target.getAttribute("data-key"));
    stopNote(notes);}});

//PLAY FROM COMPUTER KEYBOARD
document.onkeypress = function (keyPressed){
  switch(keyPressed.key){
     case "a":
        if(!keyPressed.repeat){
          allKeys.item(0).classList.toggle("whiteActive");
          noteOn(48,127);
        }
        break;
     case "w":
      if(!keyPressed.repeat){
          allKeys.item(1).classList.toggle("blackActive");
          noteOn(49,127);
         }
        break;
      case "s":
        if(!keyPressed.repeat){
          allKeys.item(2).classList.toggle("whiteActive");
          noteOn(50,127);
        }
        break;
     case "e":
        if(!keyPressed.repeat){
          allKeys.item(3).classList.toggle("blackActive");
          noteOn(51,127);
         }
        break;
      case "d":
        if(!keyPressed.repeat){
          allKeys.item(4).classList.toggle("whiteActive");
          noteOn(52,127);
        }
        break;
     case "f":
        if(!keyPressed.repeat){
          allKeys.item(5).classList.toggle("whiteActive");
          noteOn(53,127);
        }
        break;
      case "t":
        if(!keyPressed.repeat){
          allKeys.item(6).classList.toggle("blackActive");
         noteOn(54,127);
        }
        break;
     case "g":
        if(!keyPressed.repeat){
          allKeys.item(7).classList.toggle("whiteActive");
          noteOn(55,127);
        }
        break;
     case "y":
        if(!keyPressed.repeat){
          allKeys.item(8).classList.toggle("blackActive");
          noteOn(56,127);
        }
        break;
     case "h":
        if(!keyPressed.repeat){
          allKeys.item(9).classList.toggle("whiteActive");
          noteOn(57,127);
        }
        break;
     case "u":
        if(!keyPressed.repeat){
          allKeys.item(10).classList.toggle("blackActive");
         noteOn(58,127);
        }
        break;
     case "j":
        if(!keyPressed.repeat){
          allKeys.item(11).classList.toggle("whiteActive");
          noteOn(59,127);
        }
        break;
     case "k":
        if(!keyPressed.repeat){
          allKeys.item(12).classList.toggle("whiteActive");
         noteOn(60,127);
        }
        break;
     case "o":
        if(!keyPressed.repeat){
          allKeys.item(13).classList.toggle("blackActive");
          noteOn(61,127);
          break;
        }
     case "l":
        if(!keyPressed.repeat){
          allKeys.item(14).classList.toggle("whiteActive");
          noteOn(62,127);
          break;
        }
  }
}
document.onkeyup = function (keyPressed){
  switch(keyPressed.key){
     case "a":
        if(!keyPressed.repeat){
          allKeys.item(0).classList.toggle("whiteActive");
          noteOff(48);
        }
        break;
     case "w":
      if(!keyPressed.repeat){
          allKeys.item(1).classList.toggle("blackActive");
          noteOff(49);
         }
        break;
      case "s":
        if(!keyPressed.repeat){
          allKeys.item(2).classList.toggle("whiteActive");
          noteOff(50);
        }
        break;
     case "e":
        if(!keyPressed.repeat){
          allKeys.item(3).classList.toggle("blackActive");
          noteOff(51);
         }
        break;
      case "d":
        if(!keyPressed.repeat){
          allKeys.item(4).classList.toggle("whiteActive");
          noteOff(52);
        }
        break;
     case "f":
        if(!keyPressed.repeat){
          allKeys.item(5).classList.toggle("whiteActive");
          noteOff(53);
        }
        break;
      case "t":
        if(!keyPressed.repeat){
          allKeys.item(6).classList.toggle("blackActive");
         noteOff(54);
        }
        break;
     case "g":
        if(!keyPressed.repeat){
          allKeys.item(7).classList.toggle("whiteActive");
          noteOff(55);
        }
        break;
     case "y":
        if(!keyPressed.repeat){
          allKeys.item(8).classList.toggle("blackActive");
          noteOff(56);
        }
        break;
     case "h":
        if(!keyPressed.repeat){
          allKeys.item(9).classList.toggle("whiteActive");
          noteOff(57);
        }
        break;
     case "u":
        if(!keyPressed.repeat){
          allKeys.item(10).classList.toggle("blackActive");
         noteOff(58);
        }
        break;
     case "j":
        if(!keyPressed.repeat){
          allKeys.item(11).classList.toggle("whiteActive");
          noteOff(59);
        }
        break;
     case "k":
        if(!keyPressed.repeat){
          allKeys.item(12).classList.toggle("whiteActive");
         noteOff(60);
        }
        break;
     case "o":
        if(!keyPressed.repeat){
          allKeys.item(13).classList.toggle("blackActive");
          noteOff(61);
          break;
        }
     case "l":
        if(!keyPressed.repeat){
          allKeys.item(14).classList.toggle("whiteActive");
          noteOff(62);
          break;
        }
  }
}*/
