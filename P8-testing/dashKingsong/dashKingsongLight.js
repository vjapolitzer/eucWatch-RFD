//kingsong  set light
face[0] = {
	offms: (set.def.off[face.appCurr])?set.def.off[face.appCurr]:5000,
	g:w.gfx,
	init: function(val){
		this.led=val
		this.last=10;
		if (euc.state!=="READY") {face.go(set.dash[set.def.dash.face],0);return;}
		this.g.setColor(0,0);
		this.g.fillRect(0,98,239,99);
        this.g.flip();	
		this.g.fillRect(120,0,121,195);
        this.g.flip();
		this.g.setColor(0,0);
		this.g.fillRect(0,196,239,239);
		this.g.setColor(1,15);
		this.g.setFont("Vector",22);
		this.g.drawString("HEAD LIGHT",120-(this.g.stringWidth("HEAD LIGHT")/2),212); 
		this.g.flip(); 
		this.run=true;
	},
	show : function(){
		if (euc.state!=="READY") {face.go(set.dash[set.def.dash.face],0);return;}
		if (!this.run) return; 
		if ( this.last!=euc.dash.opt.lght[this.led]) {
            this.last=euc.dash.opt.lght[this.led];
			this.btn((euc.dash.opt.lght[this.led]===1)?1:0,"ON",28,60,35,4,1,0,0,119,97,"",30,60,50);
			this.btn((euc.dash.opt.lght[this.led]===3)?1:0,"AUTO",28,185,35,4,1,122,0,239,97,"",30,185,50);		
			this.btn((euc.dash.opt.lght.city)?1:0,"eucWatch",18,60,115,12,1,0,100,119,195,"CITY",25,60,150);
			this.btn((euc.dash.opt.lght[this.led]===2)?1:0,"OFF",25,185,136,6,1,122,100,239,195,"",25,185,155);	
		}
		this.tid=setTimeout(function(t,o){
		  t.tid=-1;
		  t.show();
        },100,this);
	},
    btn: function(bt,txt1,size1,x1,y1,clr1,clr0,rx1,ry1,rx2,ry2,txt2,size2,x2,y2){
			this.g.setColor(0,(bt)?clr1:clr0);
			this.g.fillRect(rx1,ry1,rx2,ry2);
			this.g.setColor(1,15);
			this.g.setFont("Vector",size1);	
			this.g.drawString(txt1,x1-(this.g.stringWidth(txt1)/2),y1); 
   			if (txt2){this.g.setFont("Vector",size2);	
            this.g.drawString(txt2,x2-(this.g.stringWidth(txt2)/2),y2);}
			this.g.flip();
    },
    ntfy: function(txt1,txt0,size,clr,bt){
            this.g.setColor(0,clr);
			this.g.fillRect(0,198,239,239);
			this.g.setColor(1,15);
			this.g.setFont("Vector",size);
     		this.g.drawString((bt)?txt1:txt0,120-(this.g.stringWidth((bt)?txt1:txt0)/2),214); 
			this.g.flip();
			if (this.ntid) clearTimeout(this.ntid);
			this.ntid=setTimeout(function(t){
                t.ntid=0;
				t.g.setColor(0,0);
				t.g.fillRect(0,196,239,239);
				t.g.setColor(1,15);
				t.g.setFont("Vector",22);
		        t.g.drawString("HEAD LIGHT",120-(t.g.stringWidth("HEAD LIGHT")/2),212); 
				t.g.flip();
			},1000,this);
    },
	tid:-1,
	run:false,
	clear : function(){
		//this.g.clear();
		this.run=false;
		if (this.tid>=0) clearTimeout(this.tid);this.tid=-1;
   		if (this.ntid) clearTimeout(this.ntid);this.ntid=0;
		return true;
	},
	off: function(){
		this.g.off();
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
		face.go("dashKingsong",0);
		return true;
	},
	clear: function(){
		return true;
	},
};	
//touch
touchHandler[0]=function(e,x,y){ 
	face.off();
	switch (e) {
      case 5: case 12: //tap event
		if ( x<=120 && y<100 ) { //lights on
			if (euc.dash.opt.lght[face[0].led]==1) {buzzer(40);return;}
			//euc.dash.opt.lght[face[0].led]=1;
			euc.dash.opt.lght.city=0;
			buzzer([30,50,30]);
			euc.wri("setLights",1);
			face[0].ntfy("HEAD LIGHT ON","NO ACTION",19,1,1);
		}else if ( 120<=x && y<=100 ) { //lights Auto
			if (euc.dash.opt.lght[face[0].led]==3) {buzzer(40);return;}
			//euc.dash.opt.lght[face[0].led]=3;
			euc.dash.opt.lght.city=0;
			buzzer([30,50,30]);	
			euc.wri("setLights",3);
			face[0].ntfy("HEAD LIGHT AUTO","NO ACTION",19,1,1);
		}else if ( x<=120 && 100<=y ) { //lights City
			euc.dash.opt.lght.city=1-euc.dash.opt.lght.city;
			face[0].btn((euc.dash.opt.lght.city)?1:0,"eucWatch",18,60,115,12,1,0,100,119,195,"CITY",25,60,150);
			buzzer([30,50,30]);	
			//euc.wri("setLights",0);
			face[0].ntfy("HEAD LIGHT CITY","NO ACTION",19,1,euc.dash.opt.lght.city);
		}else if  (120<=x && 100<=y ) { //lights Off
			if (euc.dash.opt.lght[face[0].led]==2) {buzzer(40);return;}
			//euc.dash.opt.lght[face[0].led]=2;
			euc.dash.opt.lght.city=0;
			buzzer([30,50,30]);	
			euc.wri("setLights",2);
			face[0].ntfy("HEAD LIGHT OFF","NO ACTION",19,1,1);
		}else buzzer(40);
		break;
	case 1: //slide down event
		//face.go("main",0);
		face.go(set.dash[set.def.dash.face],0);
		return;	 
	case 2: //slide up event
		if ( 200<=y && x<=50) { //toggles full/current brightness on a left down corner swipe up. 
			if (w.gfx.bri.lv!==7) {this.bri=w.gfx.bri.lv;w.gfx.bri.set(7);}
			else w.gfx.bri.set(this.bri);
			buzzer([30,50,30]);
		}else //if (y>100) {
			if (Boolean(require("Storage").read("settings"))) {face.go("settings",0);return;}  
		//} else {buzzer(40);}
		break;
	case 3: //slide left event
		face.go("dashKingsong",0);
		return;
	case 4: //slide right event (back action)
		face.go("dashKingsong",0);
		return;
  }
};
