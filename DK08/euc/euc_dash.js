//euc
//faces-main face
face[0] = {
  offms: 10000, //5 sec timeout
  spd:[],
  init: function(){
    this.spd[0]=-1;
    this.spd[1]=-1;
    this.amp=-1;
    this.temp=-1;
    this.batt=-1;
    this.trpN=-1;
    this.conn="OFF";
    this.lock=2;
    this.run=true;
	this.refRate=250;
  },
  show : function(o){
  if (!this.run) return;
//connected  
  if (euc.conn=="READY") {
	//speed 1
    if (euc.spd[0]!=this.spd[0]){
      this.spd[0]=euc.spd[0];
 	  g.setColor(euc.spdC);
	  g.fillRect(0,43,175,175);
      g.setColor((euc.spdC!=col("yellow")&&euc.spdC!=col("white"))?0:15);
	  g.setFontVector(130);
      g.drawString(euc.spd[0],(99-(g.stringWidth(euc.spd[0]))/2),55); 
      this.spd[0]=euc.spd[0];
      g.flip();
	}
	//Amp
    if ((euc.amp|0)!=this.amp) {
      this.amp=(euc.amp|0);
	  g.setColor(euc.ampC);
	  g.fillRect(60,0,119,40); //amp   
      g.setColor((euc.ampC!=col("yellow")&&euc.ampC!=col("white"))?0:15);
      g.setFont("7x11Numeric7Seg",3);
      g.drawString(euc.amp,(93-(g.stringWidth(euc.amp|0)/2)),3); 
      g.flip();
    }
	//Temp
    if (euc.temp!=this.temp) {
      this.temp=euc.temp;
	  g.setColor(euc.tmpC);
	  g.fillRect(0,0,58,40); //temp
      g.setColor((euc.tmpC!=col("yellow")&&euc.tmpC!=col("white"))?0:15);
      g.setFont("7x11Numeric7Seg",3);
      g.drawString(euc.temp,5,3); //temp
      g.flip();
    }
	//Battery
    if (euc.batt!=this.batt) {
   	  this.batt=euc.batt;
	  g.setColor(euc.batC);
	  g.fillRect(121,0,175,40); //batt	
      g.setColor((euc.batC!=col("yellow")&&euc.batC!=col("white"))?0:15);
      g.setFont("7x11Numeric7Seg",3);
      g.drawString(euc.batt,175-(g.stringWidth(euc.batt)+3),3); //fixed bat
      g.flip();
    }
//off	
  } else if (euc.conn=="OFF")  {
    if (euc.lock!=this.lock){
      this.lock=euc.lock;
      g.setColor(col("gray"));
      g.fillRect(0,0,58,40); //temp
      g.fillRect(60,0,119,40); //amp   
	  g.fillRect(121,0,175,40); //batt	
	  g.setColor(col("black"));
      g.fillRect(0,43,175,175);
      g.setColor(col("white"));
      g.setFontVector(18);
      g.drawString("TOP.SPEED",42,60);
      g.setFont("7x11Numeric7Seg",5);
      g.drawString(euc.spdTop,(120-(g.stringWidth(euc.sptTop)))/2,90); 
      g.flip();
	  if (euc.conn=="OFF" && euc.lock==1){
        this.clear(); //if (set.def.cli) console.log("faceEUCexited");
      }
    }
//rest
  } else  {
    if (euc.conn!=this.conn) {
      this.conn=euc.conn;
      g.setColor(col("blue"));
      g.fillRect(0,43,175,175);
      g.fillRect(0,0,58,40); //temp
      g.fillRect(60,0,119,40); //amp   
	  g.fillRect(121,0,175,40); //batt	
	  g.setColor(col("black"));
      g.setFont("Vector",40);
      g.drawString(euc.conn,(40+(100-g.stringWidth(euc.conn))/2),85);
      g.setFont("7x11Numeric7Seg",3);
      g.drawString(euc.temp,5,3); //temp
      g.drawString(euc.batt,175-(g.stringWidth(euc.batt)+3),3);
      g.flip();
	  if (euc.conn=="WAIT"){this.spd[0]=-1;this.spd[1]=-1;this.amp=-1;this.temp=-1;this.batt=-1;this.trpN=-1;this.conn="OFF";this.lock=2;this.run=true;}
    }
  }
//refresh 
  this.tid=setTimeout(function(t){
      t.tid=-1;
      t.show();
    },this.refRate,this);
  },
  tid:-1,
  run:false,
  clear : function(){
	if (face.appPrev!="euc" || face.appCurr!="euc" || face.pageCurr!=0) g.clear();
    this.run=false;
    if (this.tid>=0) clearTimeout(this.tid);
    this.tid=-1;
    return true;
  },
  off: function(){
    this.clear();
  } 
};
//loop face
face[1] = {
  offms:1000,
  init: function(){
  return true;
  },
  show : function(){
    face.go("main",0);
    return true;
  },
  clear: function(){
  return true;
  },
};	
//settings face
face[5] = {
  offms: 5000,
  init: function(){
    g.setColor(col("gray"));
    g.fillRect(0,0,84,75); //left up
    g.fillRect(0,80,84,155); //left mid
    g.fillRect(0,160,84,175); //left dn
    g.fillRect(120,0,175,175); //right-riding mode      
    g.setColor(col("black"));
    g.setFont("Vector",24);
	g.drawString("RING",58-(g.stringWidth("RING")/2),9); 
	g.drawString("LIGHT",58-(g.stringWidth("LIGHT")/2),41); 
//    g.drawString("AUTO",58-(g.stringWidth("AUTO")/2),90);
//    g.drawString("LOCK",58-(g.stringWidth("LOCK")/2),122);
	g.drawString("TRIP",58-(g.stringWidth("TRIP")/2),170); 
	g.drawString("RESET",58-(g.stringWidth("RESET")/2),202); 
	//rdmd
 	g.drawString("IS",180-(g.stringWidth("IS")/2),105);
    g.setFont("Vector",35);
    g.drawString("EUC",180-(g.stringWidth("EUC")/2),60); 
	g.drawString("OFF",180-(g.stringWidth("OFF")/2),140);
	//g.setFont("Vector",80);
    //g.drawString(euc.rdmd,180-(g.stringWidth(euc.rdmd)/2),80); //fixed bat
	g.flip();
    this.rdmd=-1;
    this.alck=-1;
	this.run=true;
  },
  show : function(){
    if (!this.run) return; 
//autolock
    if (euc.alck != this.alck) {
	  this.alck=euc.alck;
      if (this.alck==1) g.setColor(col("blue"));
      else g.setColor(col("gray"));
      g.fillRect(0,80,84,155); //left mid
      g.setColor(col("black"));
 	  g.setFont("Vector",24);
      g.drawString("AUTO",58-(g.stringWidth("AUTO")/2),90);
      g.drawString("LOCK",58-(g.stringWidth("LOCK")/2),122);
      g.flip();
    }
//ride mode    
    if (euc.conn=="READY") {  
	if (euc.rdmd != this.rdmd) {
	  this.rdmd=euc.rdmd;	
      g.setColor(col("lblue"));
      g.fillRect(120,0,175,175); //right-riding mode     
      g.setColor(col("black"));
      g.setFont("Vector",88);
      g.drawString(euc.rdmd,180-(g.stringWidth(euc.rdmd)/2),73);  
      g.setFont("Vector",35);
      if (9>euc.rdmd) {
      g.drawString(euc.rdmd+1,180-(g.stringWidth(euc.rdmd+1)/2),32);  
      }
      if (euc.rdmd>0) {
      g.drawString(euc.rdmd-1,180-(g.stringWidth(euc.rdmd-1)/2),166); 
      }
      g.setFont("Vector",20);
      if (8>euc.rdmd) {
      g.drawString(euc.rdmd+2,180-(g.stringWidth(euc.rdmd+2)/2),7); 
      }
      if (euc.rdmd>1) {
      g.drawString(euc.rdmd-2,180-(g.stringWidth(euc.rdmd-2)/2),208); 
      }
      g.flip();
    }
    }
//loop
    this.tid=setTimeout(function(t,o){
      t.tid=-1;
      t.show();
    },100,this);
  },
  tid:-1,
  run:false,
  clear : function(){
    g.clear();
    this.run=false;
    if (this.tid>=0) clearTimeout(this.tid);
    this.tid=-1;
    return true;
  },
  off: function(){
    this.clear();
  }
};

