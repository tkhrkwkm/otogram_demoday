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
  if(this.pos >= ScoreX - 1) return RAF(animeStop);
  
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
  
};
/*------------------------------------------------------------------------------
RAF(requestAnimationFrame)
------------------------------------------------------------------------------*/
function animePlay(timestamp) {
  if(AnimeID != 0) CAF(AnimeID);
  March.play(timestamp);
  AnimeID = RAF(animePlay);
}
function animeStop(timestamp) {
  if(AnimeID != 0) CAF(AnimeID);
  $(".play").each(function() {
    $('.play').text('Play');
  });
  March.x = 0;
  March.pos = -1;
}
/*------------------------------------------------------------------------------
Load
------------------------------------------------------------------------------*/
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function buttonSet(){
  $('.play').on('click', function(){
    
    if($(this).text() == 'Stop') return RAF(animeStop);
    
    //setScore
    var json = $(this).next().text();
    var obj = JSON.parse(json);
    Score = clone(obj);
    Tempo = Score.tempo;
    
    $(".play").each(function() {
      $('.play').text('Play');
    });
    March.x = 0;
    March.pos = -1;
    
    $(this).text('Stop');
    RAF(animePlay);
  });
}
window.addEventListener('load', function(){
  
  //show or hide PlayBtn
  $("ul.timbres li").each(function() {
    var json = $(this).find('.json').text();
    var obj = JSON.parse(json);
    var len = obj.notes.length;
    var flag = false;
    for(var i=0;i<len;i++){
      if(obj.notes[i] != '') flag = true;
    }
    if(!flag) $(this).find('.set').hide();
  });

  //Sound
  for (var i = 1; i <= SoundNum; i++) {
    var tmp = '0';
    tmp += i.toString();
    var file = '/sounds/sound' + tmp.substr(-2) + '.mp3';
    Sound[i-1] = new SoundClass(file);
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
    }
 ).catch(
    function(err){console.log(err)}
 );
});
