navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var RAF = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var CAF = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
var AudioContext = window.AudioContext||window.webkitAudioContext;
var AC = new AudioContext();

var Sound = [];
var Score = {};
var March = null;
var SoundNum = 1;//音数
var SoundDiff = [16,14,12,11,9,7,5,4,2,0,-1,-3];//音階
var ScoreX = 4 * 8;//1小節 * 8分音符
var ScoreY = SoundDiff.length + 1;
var Timbre = 0;
var Tempo = 120;
var AnimeID = 0;
var MouseX = 0;
var MouseY = 0;

var Song = [];
//カノン進行
Song[0] = {"notes":[[2,0,5],[],[],[],[5,3,1],[],[],[],[4,2,7],[],[],[],[7,5,3],[],[],[],[6,4,9],[],[],[],[9,7,5],[],[],[],[6,4,9],[],[],[],[5,3,8],[],[],[]],"tempo":120};
//王道進行
Song[1] = {"notes":[[4,2,0],[],[],[],[5,3,1],[],[],[],[7,5,3,1],[],[],[],[4,2],[],[],[],[2,4,0],[],[],[],[5,3,1],[],[],[],[7,5,3,1],[],[],[],[4,2],[],[],[]],"tempo":120};
//小室進行 
Song[2] = {"notes":[[4,2,7],[],[],[],[6,4,2],[],[],[],[5,3,8],[],[],[],[7,2,5],[],[],[],[4,2,7],[],[],[],[6,4,2],[],[],[],[5,3,8],[],[],[],[7,2,5],[],[],[]],"tempo":120};
/*------------------------------------------------------------------------------
Canvas
------------------------------------------------------------------------------*/
var Canvas = document.getElementById('Canvas');
var Layer = Canvas.getContext('2d');
Canvas.width = 30 * ScoreX;
Canvas.height = 15 * ScoreY;
Canvas.style.background = 'rgba(255,255,255,1)';
Canvas.style.border = 'solid 1px #000';


Canvas.addEventListener("contextmenu", mouseClickListener);
Canvas.addEventListener("click", mouseClickListener);
function mouseClickListener(e) {
  e.preventDefault();
  
  var g = toGrid(MouseX, MouseY);
  if(g){
    var gridX = g[0];
    var gridY = g[1];
    //console.log(gridX, gridY)
    
    //半音
    if (e.shiftKey) gridY |= 0x80;
    if (e.ctrlKey) gridY |= 0x40;
    
    var note = (Timbre << 8) | gridY;//複数の音色対応
    var notes = Score.notes[gridX];
    
    //Score削除
    if (e.button == 2) {
      for (var i = notes.length - 1; i >= 0; i--) {
        if ((notes[i] & 0x3F) == gridY) {
          notes.splice(i, 1);
          Score.notes[gridX] = notes;
          break;
        }
      }
      return;
    }
    
    if (notes.indexOf(note) != -1) return;//同じ音階はNG
    
    //Score記録
    notes.push(note);
    
    //音を出す
    Sound[Timbre].play(gridY);
  }
}
Canvas.addEventListener("mousemove", function(e) {
  
  var rect = event.target.getBoundingClientRect() ;
  MouseX = e.clientX - rect.left;
  MouseY = e.clientY - rect.top;
　
});
function toGrid(MouseX, MouseY) {
  var gridLeft   = 0;
  var gridTop    = 0;
  var gridRight  = Canvas.width;
  var gridBottom = Canvas.height;
  
  var gridX = Math.floor((MouseX - gridLeft) / 30);
  var gridY = Math.floor((MouseY - gridTop) / 15);
  
  if (gridY > ScoreY - 2) return false;
  return [gridX, gridY];
}

/*------------------------------------------------------------------------------
drawScore
------------------------------------------------------------------------------*/
function drawScore(timeStamp) {
  
  Layer.clearRect(0, 0, Canvas.width, Canvas.height);
  
  var g = toGrid(MouseX, MouseY);
  var gridX = g[0];
  var gridY = g[1];
  
  var x = gridX * 30;
  var y = gridY * 15;
  
  //縦線
  for(var i=1;i<ScoreX;i++){
    Layer.beginPath();
    Layer.lineWidth = 2;
    if(i%8==0) Layer.lineWidth = 4;
    Layer.strokeStyle = '#000';
    if(i%2==1) Layer.strokeStyle = '#CCC';
    Layer.moveTo(i*30, 0);
    Layer.lineTo(i*30, 30*ScoreY);
    Layer.stroke();
  }

  //横線
  for(var i=1;i<ScoreY;i++){
    Layer.beginPath();
    Layer.lineWidth = 2;
    Layer.strokeStyle = '#000';
    if(i%2==1) Layer.strokeStyle = '#CCC';
    if(i==SoundDiff.indexOf(12)+1||i==SoundDiff.indexOf(0)+1) Layer.strokeStyle = '#F00';
    Layer.moveTo(0, i*15);
    Layer.lineTo(30*ScoreX, i*15);
    Layer.stroke();
  }
  
  //赤枠
  Layer.beginPath();
  Layer.lineWidth = 2;
  Layer.strokeStyle = '#F00';
  Layer.rect(x, y, 30, 30);
  Layer.stroke();

  //音符
  var len = Score.notes.length;
  for (var i = 0; i < len; i++) {
    var b = Score.notes[i];
    for (var j = 0; j < b.length; j++) {
      //console.log(b[j]);
      
      //var timbre = b[j] >> 8;//音色
      var scale  = b[j] & 0x0F;//音階
      
      var x = i * 30;
      var y = scale * 15;
      
      
      //半音
      if ((b[j] & 0x80) != 0){
        Layer.font= '20px Gothic';
        Layer.fillStyle = '#000';
        Layer.fillText('#',x+8,y+23);
        Layer.fillStyle = 'rgba(0,255,255,0.5)';
        Layer.fillRect(x,y,30,30);
      }else if ((b[j] & 0x40) != 0){
        Layer.font= '20px Gothic';
        Layer.fillStyle = '#000';
        Layer.fillText('♭',x+5,y+23);
        Layer.fillStyle = 'rgba(0,255,255,0.5)';
        Layer.fillRect(x,y,30,30);
      }else{
        Layer.fillStyle = 'rgba(0,0,255,0.5)';
        Layer.fillRect(x,y,30,30);
      }
    }
  }
  
}

/*------------------------------------------------------------------------------
RAF(requestAnimationFrame)
------------------------------------------------------------------------------*/
function animeDisplay(timestamp) {
  drawScore();
  RAF(animeDisplay);
}
function animePlay(timestamp) {
  March.play(timestamp);
  AnimeID = RAF(animePlay);
}
function animeStop(timestamp) {
  if (AnimeID != 0) CAF(AnimeID);
  March.x = 0;
  March.pos = -1;
}

/*------------------------------------------------------------------------------
SoundClass
------------------------------------------------------------------------------*/
function SoundClass(path) {
  this.path = path;
  this.buffer = null;
  this.diff = SoundDiff;
}
SoundClass.prototype.play = function(scale) {
  
  var tmpscale = scale & 0x0F;//音階
  var semitone = this.diff[tmpscale];
  var semitoneRatio = Math.pow(2, 1/12);
  
  //半音
  if ((scale & 0x80) != 0) semitone++;
  else if ((scale & 0x40) != 0) semitone--;
  
  
  var source = AC.createBufferSource();
  source.buffer = this.buffer;
  source.playbackRate.value = Math.pow(semitoneRatio, semitone);
  source.connect(AC.destination);
  source.start(0);
};
SoundClass.prototype.playChord = function(noteList) {
  
  for (var i = 0; i < noteList.length; i++) {
    var scale = noteList[i] & 0x0F;//音階
    var semitone = this.diff[scale];
    var semitoneRatio = Math.pow(2, 1/12);
    
    //半音
    if ((noteList[i] & 0x80) != 0) semitone++;
    else if ((noteList[i] & 0x40) != 0) semitone--;
    
    var source = AC.createBufferSource();
    source.buffer = this.buffer;
    source.playbackRate.value = Math.pow(semitoneRatio, semitone);
    source.connect(AC.destination);
    source.start(0);
  }
};
SoundClass.prototype.load = function() {
  var filepath = this.path;
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();
    request.open('GET', filepath, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      AC.decodeAudioData(
        request.response,
        function(buffer) {
          resolve(buffer);
        },
        function(error) {
          reject('decodeAudioData error:' + error);
        }
     );
    };
    request.onerror = function() {
      reject('BufferLoader: XHR error');
    };
    request.send();
  });
};

/*------------------------------------------------------------------------------
MarchClass
------------------------------------------------------------------------------*/
function MarchClass() {
  this.x = 0;
  this.pos = -1;
}
MarchClass.prototype.play = function(timeStamp) {
  
  //小節END
  if(this.pos >= ScoreX - 1) RAF(animeStop);
  
  function scheduleAndPlay(notes) {
    var dic = {};
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      
      var timbre = note >> 8;//音色
      var scale = note & 0xFF;//音階
      //console.log(note, timbre, scale)
      
      if  (!dic[timbre]) dic[timbre] = [scale];
      else dic[timbre].push(scale);
      //console.log(dic[num])
    }
    //console.log(dic)
    for (var i in dic) {
      //Sound[i].playChord(dic[i]);
      Sound[Timbre].playChord(dic[i]);
    }
  }
  
  
  var step = Tempo / 60;
  var nextBar = (this.pos + 1) * 30;
  
  this.x += step;
  
  if (this.x >= nextBar) {
    this.pos++;
    scheduleAndPlay(Score.notes[this.pos]);
  }
  
  //進行赤枠
  Layer.fillStyle = 'rgba(255,0,0,0.5)';
  Layer.fillRect(this.x,0,30,240);
};

/*------------------------------------------------------------------------------
Load
------------------------------------------------------------------------------*/
function buttonSet(){
  
  $('#Play').on('click', function(){
    RAF(animePlay);
  });
  $('#Stop').on('click', function(){
    RAF(animeStop);
  });
  $('#Clear').on('click', function(){
    RAF(animeStop);
    clear();
  });
  $('#Score').on('click', function(){
    var json = JSON.stringify(Score);
    console.log(json);
  });
  $('#Timbre').change(function() {
    Timbre = $(this).val();
  });
  $('#Code').change(function() {
    var SongNum = $(this).val();
    if(SongNum) Score = clone(Song[SongNum]);
    else clear();
  });
  $('#Tempo').change(function() {
    Score.tempo = Tempo = $(this).val();
  });
  $('form').on('submit', function(e){
    e.preventDefault();
    var json = JSON.stringify(Score);
    $('#timbre_json').val(json);
    $(this)[0].submit();
  });
  
}
function clear() {
  var arr = [];
  for (var i = 0; i < ScoreX; i++) arr[i] = [];
  Score.notes = arr;
  $('#Code').prop('selectedIndex', 0);
}
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function init(){
  RAF(animeDisplay);
}
window.addEventListener('load', function(){
  //Sound
  for (var i = 1; i <= SoundNum; i++) {
    var tmp = '0';
    tmp += i.toString();
    var file = '/sounds/sound' + tmp.substr(-2) + '.mp3';
    Sound[i-1] = new SoundClass(file);
  }
  
  //Score
  var arr = [];
  for (var i = 0; i < ScoreX; i++) arr[i] = [];
  Score.notes = arr;
  Score.tempo = Tempo = 120;
  $('#Tempo').val(Tempo);
  
  //setScore
  if($('#timbre_json').val()){
    var setScore = JSON.parse($('#timbre_json').val());
    Score = clone(setScore);
    Tempo =  Score.tempo;
    $('#Tempo').val(Tempo);
  }
  
  
  
  //March
  March = new MarchClass();
  
  //Button
  buttonSet();

  //Promise
  Promise.all(
    Sound.map(function(sc){
      //console.log(sc);
      return sc.load();
    })
 ).then(
    function(val){
      //console.log(val);
      val.map(function(buffer,i) { Sound[i].buffer = buffer });
      init();
    }
 ).catch(
    function(err){console.log(err)}
 );
});






/*==============================================================================
Pitch Detection
==============================================================================*/
var analyser = null;
var mediaStreamSource = null;
var localMediaStream = null;
var isLive = false;

var rafID = null;
var buflen = 1024;
var buf = new Float32Array(buflen);
var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/*------------------------------------------------------------------------------
Pitch Detection
------------------------------------------------------------------------------*/
function autoCorrelate(buf, sampleRate) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var MIN_SAMPLES = 0;
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;
	
	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		return sampleRate/best_offset;
	}
	return -1;
}

function noteFromPitch(frequency) {
	var noteNum = 12 * (Math.log(frequency / 440)/Math.log(2));
	return Math.round(noteNum) + 69;
}

function updatePitch(time) {
	analyser.getFloatTimeDomainData(buf);
	var ac = autoCorrelate(buf, AC.sampleRate);
	
 	if (ac == -1) {
	 	$('#Pitch').text("--");
		$('#Note').text("--");
 	} else {
	 	var pitch = ac;
	 	$('#Pitch').text(Math.round(pitch)) ;
	 	var note =  noteFromPitch(pitch);
		$('#Note').text(noteStrings[note%12]);
	}

	rafID = RAF(updatePitch);
}



/*------------------------------------------------------------------------------
LiveInputClass
------------------------------------------------------------------------------*/
var LiveInput = null;
var LiveInputID = 0;
var LiveScale = [];
var sourceNode = null;
/*--------------------------------------------------------*/
function scaleFromNote(note) {
	switch (note){
    case 'C':
    case 'C#':
    case 'Cb':
      return 9;
      break;
    case 'D':
    case 'D#':
    case 'Db':
      return 8;
      break;
    case 'E':
    case 'E#':
    case 'Eb':
      return 7;
      break;
    case 'F':
    case 'F#':
    case 'Fb':
      return 6;
      break;
    case 'G':
    case 'G#':
    case 'Gb':
      return 5;
      break;
    case 'A':
    case 'A#':
    case 'Ab':
      return 4;
      break;
    case 'B':
    case 'B#':
    case 'Bb':
      return 3;
      break;
    default:
      return 0;
      break;
  }
}
function averageFromScale(arr) {
  
  //重複を削除したリスト
  var obj = arr.reduce(function(a, b) {
      a[b] = a[b] ? a[b] + 1 : 1;
      return a;
  }, {});
  //console.log(obj);
  
  //obj(連想配列)のソート
  var sortObj = associative_sort(obj);
  //console.log(sortObj);
  
  return sortObj[0][0];
  
  function associative_sort(a){
    var x=[];
    for(key in a){
      x.push([key,a[key]]);
    }
    x.sort(function(m,n){
      return n[1]-m[1];
    });
    return x;
  }
}
/*--------------------------------------------------------*/
function LiveInputClass() {
  this.x = 0;
  this.pos = 0;
}
LiveInputClass.prototype.play = function(timeStamp) {
  
  analyser.getFloatTimeDomainData(buf);
	var ac = autoCorrelate(buf, AC.sampleRate);
	
	var step = Tempo / 60;
	var interval = (this.pos + 1) * 30 - 1;
	
 	if(ac == -1){
	 	$('#Pitch').text("--");
		$('#Note').text("--");
 	}else{
    var pitch = Math.round(ac);
    $('#Pitch').text(pitch) ;
    var note =  noteStrings[noteFromPitch(pitch)%12];
		$('#Note').text(note);
		
		//進行赤線
    this.x += step;
    Layer.fillStyle = 'rgba(255,0,0,0.5)';
    Layer.fillRect(this.x,0,5,240);
    
		LiveScale.push(scaleFromNote(note));
		//LiveScale.push(pitch);
		
		if (this.x >= interval) {
		  var scale = averageFromScale(LiveScale);
		  //console.log(scale)
		  Score.notes[this.pos].push(scale);
      this.pos++;
      LiveScale = [];
    }
	}
};
/*--------------------------------------------------------*/
function animeLiveInputPlay(timestamp) {
  LiveInput.play(timestamp);
  LiveInputID = RAF(animeLiveInputPlay);
  
}
function animeLiveInputStop(timestamp) {
  if (LiveInputID != 0) CAF(LiveInputID);
  LiveInput.x = 0;
  LiveInput.pos = -1;
  
  localMediaStream.stop();
  analyser = null;
  mediaStreamSource = null;
  localMediaStream = null;
  
  $('#Live').text('Live Input')
  $('#Pitch').text("--");
	$('#Note').text("--");
	isLive = false;
	
  
	LiveScale = [];
}

/*------------------------------------------------------------------------------
#Live
------------------------------------------------------------------------------*/
$('#Live').on('click', function() {
  if (navigator.getUserMedia) {
    
    if(isLive){
      RAF(animeLiveInputStop);
      return;
    }
	  
	  navigator.getUserMedia (
			// constraints
			{
				audio: {
          "mandatory": {
              "googEchoCancellation": "false",
              "googAutoGainControl" : "false",
              "googNoiseSuppression": "false",
              "googHighpassFilter"  : "false"
          },
          "optional": []
        }
			},
			// successCallback
			function(stream) {
			  localMediaStream = stream;
        analyser = AC.createAnalyser();
        analyser.fftSize = 2048;
      	mediaStreamSource = AC.createMediaStreamSource(localMediaStream);
      	mediaStreamSource.connect(analyser);
      	//updatePitch();
      	
      	$('#Live').text('Stop');
      	isLive = true;
      	
      	LiveInput = new LiveInputClass();
      	RAF(animeLiveInputPlay);
			},
			// errorCallback
			function(err) {
				console.log(err);
			}
		);
	}else{
	  console.log("getUserMedia not supported");
	}
});

$('#C').on('click', function() {
	if(sourceNode){
	  sourceNode.stop();
	  sourceNode = null;
	  return;
	}
	
	sourceNode = AC.createOscillator();
	sourceNode.frequency.value = 261.62;
	sourceNode.connect(AC.destination);
	sourceNode.start();
});