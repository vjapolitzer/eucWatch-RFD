//code by freestyl3r
/*
	//info type:
	NoOp(0),
	Version=1,
	info=2,
	Diagnostic=3,
	live=4,
	bms=5,
	Something1=16,
	stats=17,
	Settings=32,
	control=96;
*/
euc.temp={count:0,loop:0,last:0};
euc.cmd=function(no,val){
	let cmd;
	euc.temp.last=no;
	switch (no) {
		case "live": return  		  [170, 170, 20, 1, 4, 17];
		//case "stats": return  		  [170, 170, 20, 1, 17, 17];
		case "stats": return  		  [170, 170, 20, 1, 17, 4];
		case "drlOn": return          [170, 170, 20, 3, 96, 45, 1, 91];
		case "drlOff": return         [170, 170, 20, 3, 96, 45, 0, 90];
		//case "lightsOn": return       [170, 170, 20, 3, 96, 64, 1, 54];
		case "lightsOn": return       [170, 170, 20, 3, 96, 80, 1, 38];
		//case "lightsOff": return      [170, 170, 20, 3, 96, 64, 0, 55];
		case "lightsOff": return      [170, 170, 20, 3, 96, 80, 00, 39];
		case "fanOn": return          [170, 170, 20, 3, 96, 67, 1, 53];
		case "fanOff": return         [170, 170, 20, 3, 96, 67, 0, 52];
		case "fanQuietOn": return     [170, 170, 20, 3, 96, 56, 1, 78];
		case "fanQuietOff": return    [170, 170, 20, 3, 96, 56, 0, 79];
		case "liftOn": return         [170, 170, 20, 3, 96, 46, 1, 88];
		case "liftOff": return        [170, 170, 20, 3, 96, 46, 0, 89];
		case "lock": return           [170, 170, 20, 3, 96, 49, 1, 71];
		case "unlock": return         [170, 170, 20, 3, 96, 49, 0, 70];
		case "transportOn": return    [170, 170, 20, 3, 96, 50, 1, 68];
		case "transportOff": return   [170, 170, 20, 3, 96, 50, 0, 69];
		case "rideComfort": return    [170, 170, 20, 3, 96, 35, 0, 84];
		case "rideSport": return      [170, 170, 20, 3, 96, 35, 1, 85];
		case "performanceOn": return  [170, 170, 20, 3, 96, 36, 1, 82];
		case "performanceOff": return [170, 170, 20, 3, 96, 36, 0, 83];
		case "remainderReal": return  [170, 170, 20, 3, 96, 61, 1, 75];
		case "remainderEst": return   [170, 170, 20, 3, 96, 61, 0, 74];
		case "lowBatLimitOn": return  [170, 170, 20, 3, 96, 55, 1, 65];
		case "lowBatLimitOff": return [170, 170, 20, 3, 96, 55, 0, 64];
		case "usbOn": return          [170, 170, 20, 3, 96, 60, 1, 74];
		case "usbOff": return         [170, 170, 20, 3, 96, 60, 0, 75];
		case "loadDetectOn": return   [170, 170, 20, 3, 96, 54, 1, 64];
		case "loadDetectOff": return  [170, 170, 20, 3, 96, 54, 0, 65];
		case "mute": return           [170, 170, 20, 3, 96, 44, 0, 91];
		case "unmute": return         [170, 170, 20, 3, 96, 44, 1, 90];
		case "calibration": return    [170, 170, 20, 5, 96, 66, 1, 0, 1, 51];
		case "speedLimit":
			cmd = [170, 170, 20, 4, 96, 33];
			cmd.push((val * 100) & 0xFF);
			cmd.push(((val * 100) >> 8) & 0xFF);
			cmd.push(cmd.reduce(checksum));
			return cmd;
		case "pedalTilt":
			cmd = [170, 170, 20, 4, 96, 34];
			cmd.push((val * 100) & 0xFF);
			cmd.push(((val * 100) >> 8) & 0xFF);
			cmd.push(cmd.reduce(checksum));
			return cmd;
		case "pedalSensitivity":
			cmd = [170, 170, 20, 4, 96, 37, val, 100];
			cmd.push(cmd.reduce(checksum));
			return cmd;
		case "setBrightness": 
			cmd = [170, 170, 20, 3, 96, 43, val];
			cmd.push(cmd.reduce(checksum));
			return cmd;
		case "setVolume":
			cmd = [170, 170, 20, 3, 96, 38, val];
			cmd.push(cmd.reduce(checksum));
			return cmd;
		case "playSound":   
			//cmd = [170, 170, 20, 4, 96, 65, val, 1];
			cmd = [170, 170, 20, 3, 224, 81, 0]; // horn on v11 new firmware 1.4.0
			cmd.push(cmd.reduce(checksum));
			return cmd;
	}
};
//
function checksum(check, val) {
	return (check ^ val) & 0xFF;
}
//
function validateChecksum(buffer) {
	receivedChecksum = buffer[buffer.length - 1];
	array = new Uint8Array(buffer, 0, buffer.length - 1);
	calculatedChecksum = array.reduce(checksum);
	//if (set.bt===2) print("calculated checksum: ", calculatedChecksum);
	//if (set.bt===2) print("message   checksum: ", receivedChecksum);
	return receivedChecksum == calculatedChecksum;
}
//
euc.isProxy=0;
euc.wri=function(i) {if (set.bt===2) console.log("not connected yet"); if (i=="end") euc.off(); return;};
euc.conn=function(mac){
	if (global['\xFF'].BLE_GATTS && global['\xFF'].BLE_GATTS.connected) {
		return global['\xFF'].BLE_GATTS.disconnect();
	}
	//check if proxy
	if (mac.includes("private-resolvable")&&!euc.isProxy ){
		let name=require("Storage").readJSON("dash.json",1)["slot"+require("Storage").readJSON("dash.json",1).slot+"Name"];
		NRF.requestDevice({ timeout:2000, filters: [{ namePrefix: name }] }).then(function(device) { euc.isProxy=1;euc.conn(device.id);}  ).catch(function(err) {print ("error "+err);euc.conn(euc.mac); });
		return;
	}
	euc.isProxy=0;
	if (euc.is.reconnect) {clearTimeout(euc.is.reconnect); euc.is.reconnect=0;}
	NRF.connect(mac,{minInterval:7.5, maxInterval:15})
		.then(function(g) {
			return g.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
		}).then(function(s) {
			euc.serv=s;
			return euc.serv.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e"); // write
		}).then(function(wc) {
			euc.wCha=wc;//write
			print("write packet: ", wc);
			return euc.serv.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");//read
		}).then(function(rc) {
			euc.rCha=rc;
			//read
			euc.rCha.on('characteristicvaluechanged', function(event) {
				if (set.bt===2) print("responce packet: ", event.target.value.buffer);
				if (euc.is.busy) return;
				if ( euc.temp.last === "stats" ) {
					if (set.bt===2) print("this is a stats packet");
					//trip total
					euc.dash.info.trip.totl=event.target.value.getUint32(5, true)/100;
						euc.log.trip.forEach(function(val,pos){ if (!val) euc.log.trip[pos]=euc.dash.info.trip.totl;});
					//time
					euc.dash.info.trip.time=(event.target.value.getUint32(17, true)/60)|0;
					euc.dash.timR=(event.target.value.getUint32(21, true)/60)|0;
					//deb
					if (set.bt===2) print("trip total :", euc.dash.info.trip.totl);
					if (set.bt===2) print("on time :", euc.dash.info.trip.time);
					if (set.bt===2) print("ride time :", euc.dash.timR);

					return;
				}
				
				// masked out temp 031222
				// was event.target.value.buffer[3] != 51
				
				// some packets larger than 74 have valid checksum but drop them for now...
				if (event.target.value.buffer[3] != 69 || !validateChecksum(event.target.value.buffer) || event.target.value.buffer.length != 74) {
					if (set.bt===2) print ("packet dropped: ", event.target.value.buffer);
					return; 
				}
				
				//print ("packet: ",event.target.value.buffer);
				euc.is.alert=0;			
				//volt
				euc.dash.live.volt=event.target.value.getUint16(5, true)/100;
				//batt
				euc.dash.live.bat=Math.round(100*(euc.dash.live.volt*5 - euc.dash.opt.bat.low ) / (euc.dash.opt.bat.hi-euc.dash.opt.bat.low) );
				euc.log.batL.unshift(euc.dash.live.bat);
				if (20<euc.log.batL.unshift) euc.log.batL.pop();
				euc.dash.alrt.bat.cc = (50 <= euc.dash.live.bat)? 0 : (euc.dash.live.bat <= euc.dash.alrt.bat.hapt.low)? 2 : 1;	
				if ( euc.dash.alrt.bat.hapt.en && euc.dash.alrt.bat.cc ==2 )  euc.is.alert ++;
				//trip 
				euc.dash.info.trip.last=event.target.value.getUint16(17, true)/100;
				euc.dash.info.trip.left=(event.target.value.getUint16(19, true))*10; //remain
				//temp
				// was euc.dash.live.tmp=(event.target.value.buffer[22] & 0xff) + 80 - 256;
				// mosfet temp
				euc.dash.live.tmp=(event.target.value.buffer[47] & 0xff) + 80 - 256;
				//euc.dash.live.tmp=32;
				euc.dash.alrt.tmp.cc=(euc.dash.alrt.tmp.hapt.hi - 5 <= euc.dash.live.tmp )? (euc.dash.alrt.tmp.hapt.hi <= euc.dash.live.tmp )?2:1:0;
				if (euc.dash.alrt.tmp.hapt.en && euc.dash.alrt.tmp.cc==2) euc.is.alert++;
				//amp
				euc.dash.live.amp= event.target.value.getInt16(7, true) / 100;
				//log
				euc.log.ampL.unshift(Math.round(euc.dash.live.amp));
				if (20<euc.log.ampL.unshift) euc.log.ampL.pop();
				euc.dash.alrt.amp.cc = ( euc.dash.alrt.amp.hapt.hi <= euc.dash.live.amp || euc.dash.live.amp <= euc.dash.alrt.amp.hapt.low )? 2 : ( euc.dash.live.amp  <= -0.5 || 15 <= euc.dash.live.amp)? 1 : 0;
				if (euc.dash.alrt.amp.hapt.en && euc.dash.alrt.amp.cc==2) {
					if (euc.dash.alrt.amp.hapt.hi<=euc.dash.live.amp)	euc.is.alert =  euc.is.alert + 1 + Math.round( (euc.dash.live.amp - euc.dash.alrt.amp.hapt.hi) / euc.dash.alrt.amp.hapt.step) ;
					else euc.is.alert =  euc.is.alert + 1 + Math.round(-(euc.dash.live.amp - euc.dash.alrt.amp.hapt.low) / euc.dash.alrt.amp.hapt.step) ;
				}
				//alarm
				// was euc.dash.alrt.pwr=event.target.value.buffer[52];
				euc.dash.alrt.pwr=0;
				//log
				euc.log.almL.unshift(euc.dash.alrt.pwr);
				if (20<euc.log.almL.unshift) euc.log.almL.pop();		
				//haptic
				if (euc.dash.alrt.pwr) euc.is.alert=20;
				//speed
				//euc.dash.live.spd=Math.round((event.target.value.getInt16(9, true) / 100)*euc.dash.opt.unit.fact.spd*((set.def.dash.mph)?0.625:1));
				euc.dash.live.spd=event.target.value.getInt16(9, true) / 100;
				if (euc.dash.info.trip.topS < euc.dash.live.spd) euc.dash.info.trip.topS = euc.dash.live.spd;
				if (euc.dash.live.spd<0) euc.dash.live.spd=-euc.dash.live.spd;
				euc.dash.alrt.spd.cc = ( euc.dash.alrt.spd.hapt.hi <= euc.dash.live.spd )? 2 : ( euc.dash.alrt.spd.hapt.low <= euc.dash.live.spd )? 1 : 0 ;	
				if ( euc.dash.alrt.spd.hapt.en && euc.dash.alrt.spd.cc == 2 ) 
					euc.is.alert = 1 + Math.round((euc.dash.live.spd-euc.dash.alrt.spd.hapt.hi) / euc.dash.alrt.spd.hapt.step) ; 	
				//average
				//euc.dash.info.trip.avrS=(event.target.value.getUint16(17, true))/100;
				//euc.dash.info.trip.topS=(event.target.value.getUint16(19, true))/100;
				//haptic
				//euc.new=1;
				if (!euc.is.buzz && euc.is.alert) {  
					if (!w.gfx.isOn&&(euc.dash.alrt.spd.cc||euc.dash.alrt.amp.cc||euc.dash.alrt.pwr)) face.go(set.dash[set.def.dash.face],0);
					//else face.off(6000);
					euc.is.buzz=1;
					if (20 <= euc.is.alert) euc.is.alert = 20;
					var a=[];
					while (5 <= euc.is.alert) {
						a.push(200,500);
						euc.is.alert = euc.is.alert - 5;
					}
					let i;
					for (i = 0; i < euc.is.alert ; i++) {
						a.push(200,150);
					}
					digitalPulse(ew.pin.BUZZ,0,a);  
					setTimeout(() => { euc.is.buzz = 0; }, 3000);
				}
			});
			//on disconnect
			global["\u00ff"].BLE_GATTS.device.on('gattserverdisconnected', euc.off);
			return  rc;
		}).then(function(c) {
			//connected 
			if (set.bt===2) console.log("EUC: Connected"); 
			euc.state="READY"; //connected
			buzzer([90,40,150,40,90]);
			euc.dash.opt.lock.en=0;
			//write function
			euc.wri=function(cmd,value){
				if (euc.state==="OFF"||cmd==="end") {
					euc.is.busy=1;
					if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
					if (global['\xFF'].BLE_GATTS && global['\xFF'].BLE_GATTS.connected) {
						euc.loop=setTimeout(function(){ 
							euc.loop=0;
							if (global['\xFF'].BLE_GATTS && !global['\xFF'].BLE_GATTS.connected)  {euc.off("not connected");return;}
							euc.wCha.writeValue(euc.cmd("lightsOff")).then(function() {
								global["\xFF"].BLE_GATTS.disconnect(); 
							}).catch(euc.off);
						},500);
					}else {
						euc.state="OFF";
						euc.off("not connected");
						euc.is.busy=0;euc.horn=0;
						return;
					}
					
				}else if (cmd==="start") {
					euc.is.busy=0;
					euc.wCha.writeValue(euc.cmd((euc.dash.opt.lght.HL)?"lightsOn":"lightsOff")).then(function() {
						euc.rCha.startNotifications();	
						if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
						euc.loop=setTimeout(function(){ 
							euc.loop=0;
							euc.is.busy=0;
							euc.is.run=1;
							euc.wri("live");
						},300);	
					}).catch(euc.off);
				}else if (cmd==="hornOn") {
					//if (euc.horn) return;
					euc.is.busy=1;euc.horn=1;
					if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
					euc.loop=setTimeout(function(){
						euc.wCha.writeValue(euc.cmd("playSound",24)).then(function() { 
						euc.horn=0;euc.loop=0;
						euc.loop=setTimeout(function(){
							euc.loop=0;
							euc.is.busy=0;
							euc.wri("live");	
						},150);
					});
					},350);
				}else if (cmd==="hornOff") {
					euc.horn=0;					
				} else {
					//if (euc.is.busy) return; 
					euc.wCha.writeValue(euc.cmd(cmd,value)).then(function() {
						if (euc.is.busy) return; 
						if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
						euc.loop=setTimeout(function(){
								euc.loop=0;
								euc.wri("live");	
						},125);
					}).catch(euc.off);
				}
			};
			if (!set.read("dash","slot"+set.read("dash","slot")+"Mac")) {
				euc.dash.info.get.mac=euc.mac; euc.dash.opt.bat.hi=420;
				euc.updateDash(require("Storage").readJSON("dash.json",1).slot);
				set.write("dash","slot"+set.read("dash","slot")+"Mac",euc.mac);
			}			
			setTimeout(() => {euc.wri("start");}, 200);
		//reconnect
		}).catch(euc.off);
};

euc.off=function(err){
	//if (set.bt===2) console.log("EUC:", err);
	//  global.error.push("EUC :"+err);
	if (euc.temp.loop) {clearInterval(euc.temp.loop);euc.temp.loop=0;}
	if (euc.is.reconnect) {clearTimeout(euc.is.reconnect); euc.is.reconnect=0;}
	if (euc.state!="OFF") {
		if (set.bt===2) console.log("EUC: Restarting");
		if ( err==="Connection Timeout"  )  {
			if (set.bt===2) console.log("reason :timeout");
			euc.state="LOST";
			if ( set.def.dash.rtr < euc.is.run) {
				euc.tgl();
				return;
			}
			euc.is.run=euc.is.run+1;
			if (euc.dash.opt.lock.en==1) buzzer(250);
			else  buzzer([250,200,250,200,250]);
			euc.is.reconnect=setTimeout(() => {
				euc.is.reconnect=0;
				if (euc.state=="OFF") return;
				euc.conn(euc.mac); 
			}, 5000);
		}else if ( err==="Disconnected"|| err==="Not connected")  {
			if (set.bt===2) console.log("reason :",err);
			euc.state="FAR";
			euc.is.reconnect=setTimeout(() => {
				euc.is.reconnect=0;
				if (euc.state=="OFF") return;
				euc.conn(euc.mac); 
			}, 1000);
		} else {
			if (set.bt===2) console.log("reason :",err);
			euc.state="RETRY";
			euc.is.reconnect=setTimeout(() => {
				euc.is.reconnect=0;
				if (euc.state=="OFF") return;
				euc.conn(euc.mac); 
			}, 1500);
		}
	} else {
		if (set.bt===2) console.log("EUC OUT:",err);
		if (set.bt===2) console.log("EUC OUT:",err);
		if (euc.loop) {clearTimeout(euc.loop); euc.loop=0;}
		euc.off=function(err){if (set.bt===2) console.log("EUC off, not connected",err);};
		euc.wri=function(err){if (set.def.cli) console.log("EUC write, not connected");};
		euc.conn=function(err){if (set.def.cli) console.log("EUC conn, not connected");};
		euc.cmd=function(err){if (set.def.cli) console.log("EUC cmd, not connected");};
		euc.is.run=0;
		euc.temp=0;
		euc.is.busy=0;
		euc.serv=0;euc.wCha=0;euc.rCha=0;euc.gatt=0;
		global["\xFF"].bleHdl=[];
		NRF.setTxPower(set.def.rfTX);	
		if ( global["\xFF"].BLE_GATTS&&global["\xFF"].BLE_GATTS.connected ) {
			if (set.bt===2) console.log("ble still connected"); 
			global["\xFF"].BLE_GATTS.disconnect();return;
		}
    }
};