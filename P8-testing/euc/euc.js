global.euc= {
	is:{run:0,reconnect:0,busy:0,chrg:0,night:1,day:[7,19],buzz:0},
	state: "OFF",
	proxy: 0,
	log:{
		trip:[0,0,0],//hour/day/month
		ampL:[],batL:[],almL:[]
	},
	temp:{},
	updateDash:function(slot){require('Storage').write('eucSlot'+slot+'.json', euc.dash);},
	off:function(err){if (set.def.cli) console.log("EUC off, not connected",err);},
	wri:function(err){if (set.def.cli) console.log("EUC write, not connected",err);},
	tgl:function(){ 
		face.off();
		if (this.is.reconnect) {clearTimeout(this.is.reconnect); this.is.reconnect=0;}
		if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
		if (this.state!="OFF" ) {
			buzzer([90,60,90]); 
			//log
			if (this.log.trip[0]&& 0<euc.dash.info.trip.totl-this.log.trip[0] ) 
				set.write("logDaySlot"+set.def.dash.slot,Date().getHours(),(euc.dash.info.trip.totl-this.log.trip[0])+((set.read("logDaySlot"+set.def.dash.slot,Date().getHours()))?set.read("logDaySlot"+set.def.dash.slot,Date().getHours()):0));
			this.log.trip[0]=0;
			set.def.dash.accE=0;
			this.mac=0;
			this.state="OFF";
			acc.off();
			this.wri("end");
			setTimeout(()=>{
				//print("log");
				if (this.log.trip[1]&& 0<euc.dash.info.trip.totl-this.log.trip[1] ) {
					//print("week");
					set.write("logWeekSlot"+set.def.dash.slot,Date().getDay(),(euc.dash.info.trip.totl-this.log.trip[1])+( (set.read("logWeekSlot"+set.def.dash.slot,Date().getDay()))?set.read("logWeekSlot"+set.def.dash.slot,Date().getDay()):0));
				}
				if (this.log.trip[2]&& 0<euc.dash.info.trip.totl-this.log.trip[2] ) {
					set.write("logYearSlot"+set.def.dash.slot,Date().getMonth(),(euc.dash.info.trip.totl-this.log.trip[2])+( (set.read("logYearSlot"+set.def.dash.slot,Date().getMonth()))?set.read("logYearSlot"+set.def.dash.slot,Date().getMonth()):0));	
				}
				euc.updateDash(require("Storage").readJSON("dash.json",1).slot);
				this.log.trip=[0,0,0];
				if (face.appCurr!=="dashOff") face.go('dashOff',0);
				if (set.def.acc) acc.on(1);
			},1000);
			
			return;
		}else {
			buzzer(100); 
			this.log.trip=[0,0,0];
			NRF.setTxPower(4);
			this.mac=(this.mac)?this.mac:set.read("dash","slot"+set.read("dash","slot")+"Mac");
			if(!this.mac) {
				face.go('dashScan',0);return;
			}else {
				euc.temp={count:0,loop:0,last:0,rota:0};
				eval(require('Storage').read('euc'+require("Storage").readJSON("dash.json",1)["slot"+require("Storage").readJSON("dash.json",1).slot+"Maker"]));
				if (set.def.prxy&&require('Storage').read('proxy'+euc.dash.info.get.makr)){
					eval(require('Storage').read('proxy'+euc.dash.info.get.makr));
				}	
				this.state="ON";
				if (euc.dash.info.get.makr!=="Kingsong"||euc.dash.info.get.makr!=="inmotionV11") euc.dash.info.trip.topS=0;
				this.conn(this.mac);
				face.go(set.dash[set.def.dash.face],0);
				this.state="ON";
				if (set.def.acc) acc.off();
				setTimeout(()=>{set.def.dash.accE=1;acc.on(2); },1000);
				if (euc.dash.opt.tpms&&global.tpms&&!tpms.def.int) {tpms.euc={}; setTimeout(()=>{tpms.scan(); },10000);}//tpms
				return;
			}
		}
	} 
};

//init
if (Boolean(require("Storage").read('eucSlot'+require("Storage").readJSON("dash.json",1).slot+'.json'))) { 
	euc.dash=require("Storage").readJSON('eucSlot'+require("Storage").readJSON("dash.json",1).slot+'.json',1);
}else 
	euc.dash=require("Storage").readJSON("eucSlot.json",1);
set.def.dash.slot=require("Storage").readJSON("dash.json",1).slot;
//more
setTimeout(()=>{if (require('Storage').read('tpms')) eval(require('Storage').read('tpms'));},2000);

