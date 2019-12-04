
//8bit music auto builder

var triangleOptions = {
    oscillator: {
        type: 'triangle'
    }
}
  
var squareOptions = {
    oscillator: {
        type: 'square'
    }
}

var squareOptions2 = {
    oscillator: {
        type: 'square6'
    }
}

var pulseOptions = {
    oscillator: {
        type: 'pulse'
    }
}
    
//button
var startButton = document.getElementById('sbutton');
var restartButton = document.getElementById('rsbutton');
//player
var kickPlayer = new Tone.Player({
    "url" : "./audio/kick.wav"
}).toMaster(); //kickPlayer.loop = true;
var snarePlayer = new Tone.Player({
    "url" : "./audio/snare.wav"
}).toMaster(); //snarePlayer.loop = true;
var hhPlayer = new Tone.Player({
    "url" : "./audio/hh.wav"
}).toMaster(); //hhPlayer.loop = true;
//synth
var polySynth = new Tone.PolySynth(6, Tone.Synth, squareOptions2).toMaster();//和弦
//polySynth.set("detune", -1200);
var pulseSynth = new Tone.Synth(pulseOptions).toMaster();//
var squareSynth = new Tone.Synth(squareOptions).toMaster();//方波
var triangleSynth = new Tone.Synth(triangleOptions).toMaster();//三角波
//part
var polyPart = new Tone.Part();
var trianglePart = new Tone.Part();
var squarePart = new Tone.Part();
var pulsePart = new Tone.Part();
var audioCtx = new AudioContext();
var noteArr = ['C', 'C#', 'D', 'D#', 'E', 'F','F#', 'G', 'G#', 'A', 'A#', 'B']; //音符列表
var chordArr = {
    'major': [4,7],
    'minor': [3,7],
    'dim': [3,6]
}
var modeArr = [ //调式列表
    {//大调
        'name': 'Cmajor',
        'note': [0,2,4,5,7,9,11], //根音
        'chord': ['major','minor','minor','major','major','minor','dim'] //和弦
    },
    {//小调
        'name': 'Cminor',
        'note': [0,2,3,5,7,8,10], //根音
        'chord': ['minor','dim','major','minor','minor','major','major'] //和弦
    },
    {//五声
        'name': 'five',
        'note': [0,2,4,7,9], //根音
        'chord': ['major','minor','minor','major','minor'] //和弦
    }
];
var melody = [];
var melody2 = [];
var melody3 = [];
var bass = [];
var bpm = 120;

function start() {
    melody = [];
    melody2 = [];
    melody3 = [];
    bass = [];
    bpm =  Math.round(Math.random()*80) + 80;
    let barNumber = 8;
    let timePerLattice = (60/bpm)/2;
    let rhythm = new Array(barNumber*8);
    let chord = new Array(barNumber);
    let mode = modeArr[Math.floor(Math.random()*modeArr.length)];
    let modeNote = mode.note;
    let modeChord = mode.chord;
    let barNoteArr;
    console.log(mode.name);
    for (var i = 0; i < barNumber*8; i++){
        if (Math.random() < 0.7)
            rhythm[i] = 1;
        else
            rhythm[i] = 0;
    }
    for (var i = 0; i < barNumber; i++){
        chord[i] = Math.floor(Math.random()*modeChord.length);
    }
    for (var i = 0; i < barNumber*8; i++){
        if (i%8 == 0){
            let chordNum = chord[i/8];
            barNoteArr = modeNote.concat();
            let minorSecond = [];
            minorSecond.push(modeNote[chordNum]-1);
            minorSecond.push(modeNote[chordNum]+1);
            minorSecond.push(modeNote[chordNum]-1+chordArr[modeChord[chordNum]][0]);
            minorSecond.push(modeNote[chordNum]+1+chordArr[modeChord[chordNum]][0]);
            minorSecond.push(modeNote[chordNum]-1+chordArr[modeChord[chordNum]][1]);
            minorSecond.push(modeNote[chordNum]+1+chordArr[modeChord[chordNum]][1]);
            for (var j = 0; j < 6; j++){
                if (minorSecond[j] < 0)
                    minorSecond[j] += 12;
                else if (minorSecond[j] > 11)
                    minorSecond[j] -= 12;
                let index = barNoteArr.indexOf(minorSecond[j]);
                if (index > -1)
                    barNoteArr.splice(index,1);
            }
            melody3.push({
                'note': [noteArr[modeNote[chordNum]]+'3', 
                (noteArr[(modeNote[chordNum]+chordArr[modeChord[chordNum]][0])%12])+'3', 
                (noteArr[(modeNote[chordNum]+chordArr[modeChord[chordNum]][1])%12])+'3'],
                'duration': 4*timePerLattice,
                'time': i*timePerLattice,
                'velocity': 0.5
            });
            bass.push({
                'note': noteArr[modeNote[chordNum]]+'2',
                'duration': 8*timePerLattice,
                'time': i*timePerLattice,
                'velocity': 1.5
            });
            melody2.push({
                'note': noteArr[modeNote[chordNum]]+'3',
                'duration': 2*timePerLattice,
                'time': i*timePerLattice,
                'velocity': 0.2
            });
            melody2.push({
                'note': (noteArr[(modeNote[chordNum]+chordArr[modeChord[chordNum]][0])%12])+'3',
                'duration': 2*timePerLattice,
                'time': (i+2)*timePerLattice,
                'velocity': 0.2
            });
            melody2.push({
                'note': (noteArr[(modeNote[chordNum]+chordArr[modeChord[chordNum]][1])%12])+'3',
                'duration': 2*timePerLattice,
                'time': (i+4)*timePerLattice,
                'velocity': 0.2
            });
        }
        if (rhythm[i] == 1){
            melody.push({
                'note': noteArr[barNoteArr[Math.floor(Math.random()*barNoteArr.length)]]+'4',
                'duration': timePerLattice,
                'time': i*timePerLattice,
                'velocity': 2
            });
        }
    }
    console.log(melody);
    console.log(melody3);
    console.log(bass);
    squarePart.removeAll();
    squarePart = new Tone.Part(function (time, note) {
        squareSynth.triggerAttackRelease(note.note, note.duration, time,note.velocity)
    }, melody);
    trianglePart.removeAll();
    trianglePart = new Tone.Part(function (time, note) {
        triangleSynth.triggerAttackRelease(note.note, note.duration, time, note.velocity)
    }, bass);
    pulsePart.removeAll();
    pulsePart = new Tone.Part(function (time, note) {
        pulseSynth.triggerAttackRelease(note.note, note.duration, time,note.velocity)
    }, melody2);
    polyPart.removeAll();
    polyPart = new Tone.Part(function (time, note) {
        polySynth.triggerAttackRelease(note.note, note.duration, time, note.velocity)
    }, melody3);
    Tone.Transport.start('+0.1', 0);
    squarePart.start(0);
    trianglePart.start(0);
    polyPart.start(0);
    //pulsePart.start(0);
    for (var i = 0; i < 64; i++){
        if (i%2 == 0){
            hhPlayer.start('+'+i*timePerLattice);
            hhPlayer.stop('+'+(i+1)*timePerLattice);
        }
        if (i%8 == 0){
            kickPlayer.start('+'+i*timePerLattice);
            kickPlayer.stop('+'+(i+1)*timePerLattice);
        }
        if (i%8 == 4){
            snarePlayer.start('+'+i*timePerLattice);
            snarePlayer.stop('+'+(i+1)*timePerLattice);
        }
    }
    Tone.Transport.stop('+'+Math.ceil(barNumber*8*30/bpm));
}

function restart(){
    let barNumber = 8;
    let timePerLattice = (60/bpm)/2;
    Tone.Transport.start('+0.1', 0);
    squarePart.start(0);
    trianglePart.start(0);
    polyPart.start(0);
    //pulsePart.start(0);
    for (var i = 0; i < 64; i++){
        if (i%2 == 0){
            hhPlayer.start('+'+i*timePerLattice);
            hhPlayer.stop('+'+(i+1)*timePerLattice);
        }
        if (i%8 == 0){
            kickPlayer.start('+'+i*timePerLattice);
            kickPlayer.stop('+'+(i+1)*timePerLattice);
        }
        if (i%8 == 4){
            snarePlayer.start('+'+i*timePerLattice);
            snarePlayer.stop('+'+(i+1)*timePerLattice);
        }
    }
    Tone.Transport.stop('+'+Math.ceil(barNumber*8*30/bpm));
}

function setOpern(player, opern, timePerLattice=0.25){
    for (var i = 0; i < opern.length; i++){
        player.start('+' + opern[i].startTime*timePerLattice);
        player.stop('+' + opern[i].stopTime*timePerLattice);
    }
}






startButton.addEventListener('click', ()=>start())

restartButton.addEventListener('click', ()=>restart())