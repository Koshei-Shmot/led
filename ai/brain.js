(function(global){
  'use strict';

  var IN_DIM=16,HID_DIM=20,OUT_DIM=6;
  var STORAGE_KEY='led-brain-v33';

  var FALLBACK_GENRES={
    phonk:{name:'Фонк',kw:['phonk','фонк','drift','дрифт','cowbell','memphis','kordhell','lxst'],bpm:126,bass:0.48,mid:0.28,high:0.24,crest:3.2,mul:[1.20,0.94,1.06,1.12],rel:[100,110,64,98],hues:[352,278,318],punch:1.38,glide:140},
    trap:{name:'Трэп',kw:['trap','трэп','808','atlanta','metro','travis','carti'],bpm:140,bass:0.46,mid:0.31,high:0.23,crest:3.0,mul:[1.18,1.00,1.08,1.10],rel:[110,115,65,105],hues:[268,354,34],punch:1.32,glide:160},
    edm:{name:'EDM / Клуб',kw:['edm','club','клуб','festival','electro','remix','ремикс'],bpm:128,bass:0.41,mid:0.29,high:0.30,crest:2.8,mul:[1.14,0.98,1.14,1.08],rel:[108,108,66,102],hues:[194,322,46],punch:1.28,glide:150},
    house:{name:'Хаус / Дип',kw:['house','хаус','deep','дип','tech house','tropical'],bpm:122,bass:0.40,mid:0.36,high:0.24,crest:2.4,mul:[1.12,1.06,1.02,1.06],rel:[122,125,75,115],hues:[176,26,204],punch:1.16,glide:220},
    techno:{name:'Техно',kw:['techno','техно','rave','рейв','acid','hardstyle'],bpm:136,bass:0.45,mid:0.25,high:0.30,crest:3.1,mul:[1.22,0.90,1.16,1.14],rel:[92,98,58,90],hues:[216,356,186],punch:1.42,glide:95},
    dnb:{name:'Драм-н-Бейс',kw:['dnb','drum','bass','драм','neuro','liquid','jungle'],bpm:174,bass:0.42,mid:0.27,high:0.31,crest:3.0,mul:[1.16,0.96,1.18,1.12],rel:[88,95,55,88],hues:[136,192,286],punch:1.36,glide:110},
    dubstep:{name:'Дабстеп',kw:['dubstep','дабстеп','wobble','riddim','brostep'],bpm:145,bass:0.47,mid:0.31,high:0.22,crest:3.3,mul:[1.22,1.02,1.05,1.14],rel:[105,105,62,98],hues:[114,274,182],punch:1.40,glide:120},
    hiphop:{name:'Хип-Хоп',kw:['hip','hop','rap','рэп','хип','хоп','beat','бит','drill','дрилл'],bpm:94,bass:0.41,mid:0.39,high:0.20,crest:2.6,mul:[1.12,1.14,0.98,1.06],rel:[125,130,78,115],hues:[258,36,14],punch:1.18,glide:210},
    pop:{name:'Поп',kw:['pop','поп','dance','танц','cover','кавер','radio','hit','хит'],bpm:116,bass:0.30,mid:0.45,high:0.25,crest:2.2,mul:[0.98,1.18,1.05,1.05],rel:[128,138,80,118],hues:[338,184,42],punch:1.05,glide:240},
    rnb:{name:'R&B / Соул',kw:['rnb','r&b','soul','соул','smooth','slow','velvet'],bpm:88,bass:0.35,mid:0.45,high:0.20,crest:2.0,mul:[1.02,1.20,0.96,1.02],rel:[148,155,95,135],hues:[314,28,266],punch:0.92,glide:320},
    rock:{name:'Рок',kw:['rock','рок','punk','панк','guitar','гитар','grunge','альтер'],bpm:130,bass:0.31,mid:0.41,high:0.28,crest:2.7,mul:[1.06,1.12,1.15,1.08],rel:[112,112,70,105],hues:[12,44,214],punch:1.22,glide:160},
    metal:{name:'Метал',kw:['metal','метал','core','кор','thrash','death','heavy','doom'],bpm:156,bass:0.34,mid:0.37,high:0.29,crest:3.1,mul:[1.14,1.08,1.18,1.12],rel:[92,96,58,90],hues:[0,210,32],punch:1.38,glide:100},
    synth:{name:'Синтвейв',kw:['synth','синт','wave','вейв','retro','ретро','cyber','кибер','outrun','80s'],bpm:108,bass:0.35,mid:0.37,high:0.28,crest:2.3,mul:[1.05,1.10,1.08,1.05],rel:[135,140,84,122],hues:[326,186,252],punch:1.06,glide:260},
    lofi:{name:'Лоу-фай',kw:['lofi','lo-fi','лоу','chill','чилл','ambient','эмбиент','sleep','сон','piano','пиано','jazz','джаз'],bpm:82,bass:0.32,mid:0.48,high:0.20,crest:1.9,mul:[0.94,1.16,0.92,1.00],rel:[160,170,105,145],hues:[32,164,344],punch:0.84,glide:380},
    cinematic:{name:'Саундтрек',kw:['ost','soundtrack','саундтрек','epic','эпик','orchestra','оркестр','score'],bpm:96,bass:0.36,mid:0.42,high:0.22,crest:2.5,mul:[1.08,1.15,1.02,1.06],rel:[155,165,95,140],hues:[156,42,224],punch:1.08,glide:340}
  };

  function createSeededWeights(){
    var W1=[],b1=[],W2=[],b2=[],j,i,k;
    for(j=0;j<HID_DIM;j++){
      var row=[];
      for(i=0;i<IN_DIM;i++){
        var s=Math.sin((j+1)*13.37+(i+1)*7.91)*0.22;
        if(j===0&&(i===4||i===5))s=0.85;
        if(j===1&&i===0)s=0.90;
        if(j===2&&(i===13||i===15))s=0.88;
        if(j===3&&(i===3||i===7))s=0.82;
        if(j===4&&i===6)s=0.92;
        if(j===5&&i===2)s=0.85;
        row.push(+s.toFixed(4));
      }
      W1.push(row);
      b1.push(+((Math.cos(j*3.1)*0.12).toFixed(4)));
    }
    for(k=0;k<OUT_DIM;k++){
      var r2=[];
      for(j=0;j<HID_DIM;j++){
        var v=Math.cos((k+1)*5.17+(j+1)*2.73)*0.18;
        if(k===0&&j===0)v=1.15;
        if(k===0&&j===1)v=-0.95;
        if(k===1&&j===2)v=1.05;
        if(k===2&&(j===1||j===2))v=0.75;
        if(k===3&&j===3)v=1.10;
        if(k===4&&j===4)v=1.20;
        if(k===5&&j===5)v=1.10;
        r2.push(+v.toFixed(4));
      }
      W2.push(r2);
      b2.push(k===0?-0.15:0.0);
    }
    return {W1:W1,b1:b1,W2:W2,b2:b2};
  }

  function cloneWeights(src){
    return {
      W1:src.W1.map(function(r){return r.slice();}),
      b1:src.b1.slice(),
      W2:src.W2.map(function(r){return r.slice();}),
      b2:src.b2.slice()
    };
  }

  function validWeights(w){
    return w&&Array.isArray(w.W1)&&w.W1.length===HID_DIM&&Array.isArray(w.W1[0])&&w.W1[0].length===IN_DIM&&
           Array.isArray(w.b1)&&w.b1.length===HID_DIM&&Array.isArray(w.W2)&&w.W2.length===OUT_DIM&&
           Array.isArray(w.W2[0])&&w.W2[0].length===HID_DIM&&Array.isArray(w.b2)&&w.b2.length===OUT_DIM;
  }

  function sigmoid(z){
    if(z<-15)return 0.0000003;
    if(z>15)return 0.9999997;
    return 1/(1+Math.exp(-z));
  }

  function clampW(v){
    if(!isFinite(v))return 0;
    return v<-3.5?-3.5:(v>3.5?3.5:v);
  }

  var baseWeights=createSeededWeights();

  var LedBrain={
    version:'33.0',
    genres:FALLBACK_GENRES,
    genreKeys:Object.keys(FALLBACK_GENRES),
    weights:cloneWeights(baseWeights),
    mem:{xp:0,gen:1,genres:{}},
    lastH:new Array(HID_DIM),

    save:function(){
      try{
        localStorage.setItem(STORAGE_KEY,JSON.stringify({
          xp:this.mem.xp,
          gen:this.mem.gen,
          genres:this.mem.genres,
          weights:this.weights
        }));
      }catch(e){}
    },

    loadLocal:function(){
      try{
        var raw=localStorage.getItem(STORAGE_KEY);
        if(!raw)return false;
        var p=JSON.parse(raw);
        if(!p||typeof p!=='object')return false;
        this.mem.xp=+p.xp||0;
        this.mem.gen=+p.gen||1;
        this.mem.genres=(p.genres&&typeof p.genres==='object')?p.genres:{};
        if(validWeights(p.weights))this.weights=cloneWeights(p.weights);
        return true;
      }catch(e){return false;}
    },

    init:function(genresUrl,weightsUrl,onReady){
      var self=this;
      var hadLocal=this.loadLocal();
      var p1=fetch(genresUrl,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});
      var p2=fetch(weightsUrl,{cache:'no-cache'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;});
      Promise.all([p1,p2]).then(function(res){
        if(res[0]&&typeof res[0]==='object'){
          self.genres=res[0];
          self.genreKeys=Object.keys(res[0]);
        }
        if(res[1]&&validWeights(res[1])){
          baseWeights=cloneWeights(res[1]);
          if(!hadLocal)self.weights=cloneWeights(res[1]);
        }
        if(onReady)onReady();
      });
    },

    getGenre:function(key){
      return this.genres[key]||this.genres.pop||FALLBACK_GENRES.pop;
    },

    detectHint:function(name){
      var low=(name||'').toLowerCase();
      for(var i=0;i<this.genreKeys.length;i++){
        var k=this.genreKeys[i],kws=(this.genres[k]&&this.genres[k].kw)||[];
        for(var j=0;j<kws.length;j++)if(low.indexOf(kws[j])!==-1)return k;
      }
      return '';
    },

    classify:function(bRatio,mRatio,hRatio,crest,bpmVal,hintKey){
      var bestKey='pop',bestScore=999;
      for(var i=0;i<this.genreKeys.length;i++){
        var k=this.genreKeys[i],g=this.genres[k];
        if(!g)continue;
        var dB=(bRatio-g.bass)*2.4,dM=(mRatio-g.mid)*2.1,dH=(hRatio-g.high)*2.0;
        var dC=(crest-g.crest)*0.32,dT=bpmVal>40?((bpmVal-g.bpm)/55):0;
        var dist=dB*dB+dM*dM+dH*dH+dC*dC+dT*dT;
        if(hintKey===k)dist*=0.45;
        if(dist<bestScore){bestScore=dist;bestKey=k;}
      }
      return bestKey;
    },

    forward:function(x){
      var w=this.weights,h=this.lastH,y=new Array(OUT_DIM),j,i,k,sum;
      for(j=0;j<HID_DIM;j++){
        sum=w.b1[j];
        var row1=w.W1[j];
        for(i=0;i<IN_DIM;i++)sum+=row1[i]*(x[i]||0);
        h[j]=Math.tanh(sum);
      }
      for(k=0;k<OUT_DIM;k++){
        sum=w.b2[k];
        var row2=w.W2[k];
        for(j=0;j<HID_DIM;j++)sum+=row2[j]*h[j];
        y[k]=sigmoid(sum);
      }
      return y;
    },

    trainStep:function(x,target,lr){
      if(!x||x.length!==IN_DIM||!target||target.length!==OUT_DIM)return;
      var y=this.forward(x);
      var h=this.lastH,w=this.weights;
      var dZ2=new Array(OUT_DIM),dZ1=new Array(HID_DIM),k,j,i;
      for(k=0;k<OUT_DIM;k++){
        dZ2[k]=(y[k]-target[k])*y[k]*(1-y[k]);
      }
      for(j=0;j<HID_DIM;j++){
        var errH=0;
        for(k=0;k<OUT_DIM;k++)errH+=w.W2[k][j]*dZ2[k];
        dZ1[j]=errH*(1-h[j]*h[j]);
      }
      for(k=0;k<OUT_DIM;k++){
        w.b2[k]=clampW(w.b2[k]-lr*dZ2[k]);
        for(j=0;j<HID_DIM;j++){
          var nw2=w.W2[k][j]-lr*dZ2[k]*h[j];
          w.W2[k][j]=clampW(nw2*0.996+baseWeights.W2[k][j]*0.004);
        }
      }
      for(j=0;j<HID_DIM;j++){
        w.b1[j]=clampW(w.b1[j]-lr*dZ1[j]);
        for(i=0;i<IN_DIM;i++){
          var nw1=w.W1[j][i]-lr*dZ1[j]*(x[i]||0);
          w.W1[j][i]=clampW(nw1*0.996+baseWeights.W1[j][i]*0.004);
        }
      }
    },

    trainAction:function(action,genreKey,lastX,lastY){
      var gMem=this.mem.genres[genreKey]||(this.mem.genres[genreKey]={punch:0,hueShift:0,likes:0});
      this.mem.xp++;
      this.mem.gen=1+Math.floor(this.mem.xp/12);

      if(action==='like'){
        gMem.likes=(gMem.likes||0)+1;
        gMem.punch=Math.max(-0.25,Math.min(0.32,(gMem.punch||0)+0.03));
        if(lastX&&lastY){
          var sharp=lastY.map(function(v){return v>0.5?Math.min(0.98,v+0.08):Math.max(0.02,v-0.08);});
          this.trainStep(lastX,sharp,0.12);
        }
      }else if(action==='drive'||action==='flash'||action==='build'){
        gMem.punch=Math.max(-0.25,Math.min(0.35,(gMem.punch||0)+0.045));
        if(lastX&&lastY){
          this.trainStep(lastX,[lastY[0],0.85,0.96,0.95,0.88,0.85],0.14);
        }
      }else if(action==='soft'||action==='drop'){
        gMem.punch=Math.max(-0.30,Math.min(0.30,(gMem.punch||0)-0.055));
        if(lastX&&lastY){
          this.trainStep(lastX,[Math.min(0.9,lastY[0]+0.15),0.20,0.22,0.18,0.15,0.10],0.14);
        }
      }else if(action==='shift'){
        gMem.hueShift=((gMem.hueShift||0)+48)%360;
        if(lastX&&lastY){
          this.trainStep(lastX,[1-lastY[0],1-lastY[1],lastY[2],lastY[3],lastY[4],lastY[5]],0.15);
        }
      }
      this.save();
    },

    exportData:function(){
      return JSON.stringify({
        version:this.version,
        xp:this.mem.xp,
        gen:this.mem.gen,
        genres:this.mem.genres,
        W1:this.weights.W1,
        b1:this.weights.b1,
        W2:this.weights.W2,
        b2:this.weights.b2
      },null,2);
    },

    importData:function(jsonStr){
      try{
        var p=JSON.parse(jsonStr);
        var wObj=p.weights||p;
        if(!validWeights(wObj))return false;
        this.weights=cloneWeights(wObj);
        if(typeof p.xp==='number')this.mem.xp=p.xp;
        if(typeof p.gen==='number')this.mem.gen=p.gen;
        if(p.genres&&typeof p.genres==='object')this.mem.genres=p.genres;
        this.save();
        return true;
      }catch(e){return false;}
    },

    reset:function(){
      this.weights=cloneWeights(baseWeights);
      this.mem={xp:0,gen:1,genres:{}};
      try{localStorage.removeItem(STORAGE_KEY);}catch(e){}
    }
  };

  global.LedBrain=LedBrain;
})(window);
