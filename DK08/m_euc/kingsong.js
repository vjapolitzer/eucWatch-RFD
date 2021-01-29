//kingsong euc module 
//m_euc

if (!global.euc){
//vars
global.euc= {
  spd: ["0","0"], 
  spdC:col("black"),
  spdTop:["0","0"],
  amp: "0", 
  ampC: col("black"), 
  batt: "0", 
  batC: col("lgreen"), 
  temp: "0.0", 
  tmpC: col("lgreen"), 
  trpC: col("black"), 
  trpN: "0.0", 
  trpL: "0.0", 
  trpT: "0.0", 
  trpR: "0.0",
  aver:"0.0",
  rdmd:0,
  time:"0",
  lock: -1,
  alrm: 0,
  conn: "OFF",
  alck: 0,
  far: 83,
  near: 65,
  type: "14s",
  mac:{0:"64:69:4e:75:89:4d public"},
  go:0,
  busy:0
};
//alerts
euc.alert = {
  spd: 23,
  temp: 60,
  batt: 20,
  ampH: 18,
  ampL: -6,
  on: false,
};
euc.tmp = {
  spd: ["0","0"], 
  amp: "0", 
  temp: "0", 
  count:0,
  batt: "0", 
  trpN: "0",
  cmd: false,
  loop:-1,
  reconnect:-1,
  rssi:"",
};euc.def={};
euc.type=function(type){
	switch (type) {
      case "S18":	   
	   euc.def.maxCurr=45;
	   euc.def.critTemp=65;
	   euc.def.warnTemp=50;
	   euc.def.battVolt=84;
	   euc.def.battWarn=25;
	   euc.def.battIR=10;
	   break;
	  case "14D":
	   euc.def.maxCurr=35;
	   euc.def.critTemp=65;
	   euc.def.warnTemp=50;
	   euc.def.battVolt=67;
	   euc.def.battWarn=40;
	   euc.def.battIR=22;
	   break;
	  case "14S":
	   euc.def.maxCurr=40;
	   euc.def.critTemp=65;
	   euc.def.warnTemp=50;
	   euc.def.battVolt=67;
	   euc.def.battWarn=25;
	   euc.def.battIR=11;
	   break;
	  case "16S":
	   euc.def.maxCurr=40;
	   euc.def.critTemp=65;
	   euc.def.warnTemp=50;
	   euc.def.battVolt=67;
	   euc.def.battWarn=25;
	   euc.def.battIR=11;
	   break;
	  case "16X":
	   euc.def.maxCurr=45;
	   euc.def.critTemp=65;
	   euc.def.warnTemp=50;
	   euc.def.battVolt=84;
	   euc.def.battWarn=25;
	   euc.def.battIR=10;
	   break;
	  default:
	   euc.def.maxCurr=40; //maximum current draw
	   euc.def.critTemp=65; //critical internal temperature
	   euc.def.warnTemp=50; //Hight internal temperature
	   euc.def.battVolt=67; //battery pack max voltage
	   euc.def.battWarn=25; //remaining battery percentage warning -- 
	   euc.def.battIR=20; //internal resistance in 1/100 ohms -- 
	}
};
}
euc.con=function(mac){
var euc_al;
var euc_al_s;
var euc_al_a;
var euc_al_t;
var euc_al_b;


if ( global["\xFF"].BLE_GATTS!="undefined") {
	if (set.def.cli) print("ble allready connected"); 
	if (global["\xFF"].BLE_GATTS.connected) global["\xFF"].BLE_GATTS.disconnect();
	return;
}
NRF.connect(mac,{minInterval:7.5, maxInterval:7.5})
.then(function(g) {
   return g.getPrimaryService(0xffe0);
}).then(function(s) {
  return s.getCharacteristic(0xffe1);
}).then(function(c) {
  euc.tmp.characteristic=c;
  c.on('characteristicvaluechanged', function(event) {
    this.KSdata = event.target.value.buffer;
    if (euc.busy) return;
    if (this.KSdata[16]==169) {
        euc.spd=((decode2byte(this.KSdata[4],this.KSdata[5])/100)+"").split("."); 
        this.cur=decode2byte(this.KSdata[10], this.KSdata[11]);
        if (this.curr > 32767) this.cur = this.cur - 65536;
        euc.amp=this.cur/100;
        euc.volt=((decode2byte(this.KSdata[2],this.KSdata[3])/100)+"");
        euc.temp=((decode2byte(this.KSdata[12],this.KSdata[13])/100)+"");
        euc.trpT=((decode4byte(this.KSdata[6],this.KSdata[7],this.KSdata[8],this.KSdata[9])/1000.0));
        euc.rmode=this.KSdata[14];
    }else if  (this.KSdata[16]==185){
        euc.trpL=(decode4byte(this.KSdata[2], this.KSdata[3], this.KSdata[4], this.KSdata[5]) / 1000.0);
        euc.time=(decode2byte(this.KSdata[6], this.KSdata[7]) / 100.0);
        euc.spdTop=(decode2byte(this.KSdata[8], this.KSdata[9]) / 100.0);
    }else if (euc.conn=="OFF"){
      euc.busy=1;
	  if (set.def.cli) console.log("EUCstartOff");
	  clearInterval(euc.tmp.loop);
	  euc.tmp.loop=-1;
	  euc.lock=1;
      digitalPulse(D6,1,120);
	  c.writeValue(euc.cmd("lock")).then(function() {
	  global["\xFF"].BLE_GATTS.disconnect();
      //euc.busy=0;
      return;
	  });
	}
  });
c.startNotifications(); 
return  c;
}).then(function(c) {
//connected ****************************
  console.log("EUC connected"); 
  euc.conn="READY"; //connected
  digitalPulse(D6,1,[90,40,150,40,90]);
  euc.ch=c;
  euc.busy=1;
  setTimeout(function(){euc.wri(c,"unlock");},200);
  setTimeout(function(){euc.wri(c,"init");euc.busy=0;},400);
//on disconnect
  global["\u00ff"].BLE_GATTS.device.on('gattserverdisconnected', function(reason) {
    if (set.def.cli) console.log("EUC Disconnected :",reason);
    if (euc.conn!="OFF") {  
	 if (set.def.cli) console.log("EUC restarting");
     euc.conn="WAIT"; 
     setTimeout(() => {  euc.con(euc.mac[euc.go]); }, 1500);
    }else {
	  if (set.def.cli) console.log("Destroy euc (reason):",reason);
      if (euc.tmp.loop!==-1) clearInterval(euc.tmp.loop);
	  global["\xFF"].bleHdl=[];
	  global.BluetoothDevice=undefined;
	  global.BluetoothRemoteGATTServer=undefined;
	  global.BluetoothRemoteGATTService=undefined;
	  global.BluetoothRemoteGATTCharacteristic=undefined;
	  global.Promise=undefined;
	  global.Error=undefined;
    }
  });
//reconect
}).catch(function(err)  {
  if (set.def.cli) console.log("EUC", err);
//  global.error.push("EUC :"+err);
  clearInterval(euc.tmp.loop);euc.tmp.loop=-1;
  if (euc.conn!="OFF") {
    if (set.def.cli) console.log("not off");
    if ( err==="Connection Timeout"  )  {
	  if (typeof global["\xFF"].timers[euc.tmp.reconnect] !== "undefined") clearTimeout(euc.tmp.reconnect); 
	  if (set.def.cli) console.log("retrying :timeout");
	  euc.conn="LOST";
	  if (euc.lock==1) digitalPulse(D6,1,250);
	  else digitalPulse(D6,1,[250,200,250,200,250]);
	  euc.tmp.reconnect=setTimeout(() => {
	    euc.con(euc.mac[euc.go]); 
	  }, 10000);
	}else if ( err==="Disconnected"|| err==="Not connected")  {
	  if (typeof global["\xFF"].timers[euc.tmp.reconnect]  !== "undefined") clearTimeout(euc.tmp.reconnect); 
      if (set.def.cli) console.log("retrying :",err);
      euc.conn="FAR";
	  if (euc.lock==1) digitalPulse(D6,1,100);
	  else digitalPulse(D6,1,[100,150,100]);
      euc.tmp.reconnect=setTimeout(() => {
	    euc.con(euc.mac[euc.go]); 
      }, 5000);
    }
  } else {
	  if (euc.tmp.loop!=-1) {
		clearInterval(euc.tmp.loop);
		euc.tmp.loop=-1;
	  }
      if (euc.tmp.loop!==-1) clearInterval(euc.tmp.loop);
	  global["\xFF"].bleHdl=[];
      global.BluetoothDevice=undefined;
	  global.BluetoothRemoteGATTServer=undefined;
	  global.BluetoothRemoteGATTService=undefined;
	  global.BluetoothRemoteGATTCharacteristic=undefined;
	  global.Promise=undefined;
	  global.Error=undefined;
  }
});
};

euc.cmd=function(no){
	switch (no) {
      case "init":
   	  return [0xAA,0x55,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x9B,0x14,0x5A,0x5A]; 
      case "lightsOn": //lights on
	  return [0xAA,0x55,0x12,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x73,0x14,0x5A,0x5A];  
      case "lightsOff": //lights off
	  return [0xAA,0x55,0x13,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x73,0x14,0x5A,0x5A];  
	  case "lightsAuto": //lights auto
	  return [0xAA,0x55,0x14,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x73,0x14,0x5A,0x5A]; 
	  case "lock": //lock
	  return [0xAA,0x55,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x5d,0x14,0x5A,0x5A]; 
	  case "unlock": //unlock
	  return [0xAA,0x55,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x37,0x37,0x33,0x35,0x32,0x35,0x5d,0x14,0x5A,0x5A]; 
	  case 22: //unlock
	  return [0xAA,0x55,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x33,0x34,0x35,0x39,0x36,0x30,0x5d,0x14,0x5A,0x5A]; 	  
    }
};

euc.wri= function(ch,n) {
  ch.writeValue(euc.cmd(n));
};
//euc.con(euc.mac[euc.go]);
//euc.wri(euc.ch,"lightsOn")
//euc.ch.writeValue([0xAA,0x55,0x9B,0x14,0x5A,0x5A]) 
//euc.ch.writeValue([65, 84, 43, 85, 76, 75, 84, 69, 0]) 

decode2byte=function(byte1, byte2){//converts big endian 2 byte value to int
    this.val = (byte1 & 0xFF) + (byte2 << 8);
    return this.val;
};
decode4byte=function(byte1,byte2,byte3,byte4){
    this.val = (byte1 << 16) + (byte2 << 24) + byte3 + (byte4 << 8);
    return this.val;
};

euc.tgl=function(){ 
  if (euc.conn!="OFF" ) {
    digitalPulse(D6,1,[90,60,90]);  
	if (euc.tmp.reconnect>=0 ||  euc.conn=="WAIT" || euc.conn=="ON") {
    clearTimeout(euc.tmp.reconnect); euc.tmp.reconnect=-1;
    }
  	euc.conn="OFF";
	face.go("euc",0);
  }else {
    digitalPulse(D6,1,100);   
	//euc.mac=(require("Storage").readJSON("setting.json",1)||{}).euc_mac;
	//euc.go=(require("Storage").readJSON("setting.json",1)||{}).euc_go;
	if(!euc.mac) {face.appCurr="euc";face.go('w_scan',0,'ffe0');}
	else {
	if (euc.conn == "OFF") euc.tmp.count=22; else euc.tmp.count=0;  //unlock
	euc.conn="ON";
	euc.con(euc.mac[euc.go]); 
	face.go("euc",0);
	}
  } 

};