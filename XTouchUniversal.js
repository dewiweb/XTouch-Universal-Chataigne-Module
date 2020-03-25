/* Behringer X-Touch Universal Module Script for Chataigne
    Version 1.0
    Author: IniqMyers 3/24/2020
    Thanks to BenKuper, fastest Dev in the West!
*/

/*  X-Touch must be in MCP mode to communicate with this module correctly. Some functions may work correctly in HUI mode, but it is largely incompatible.
        XCtrl mode is on my roadmap, since it unlocks the one feature we cannot get in MCP mode: colored/inverted scribble strips
        To put the X-Touch into MCP mode, power off with power switch, and press and hold the first select button while powering the device back on.
        You will now be in configuration mode, the first encoder pot controls the mode. Turn it until it reads 'MC'.
        Your second encoder controls the interface mode. I programmed this in USB mode, but nothing should prevent it from working in 
        either network MIDI or 5-pin DIN MIDI modes, although I expect most will be using USB mode. Finally choose a backlight level that isn't terrible (it's impossible).
        Power cycle the device once more to leave configuration mode.
*/

/*  You should not need to know how the backend interface of the X-Touch works, but it's possible you want to do something that's not directly supported,
        and the documentation is atrociously scattered so I've included what I have scraped together. Most of this is true for generic MCP devices too.

    **Faders** Sent as pitch bend 14-bit value, channel corresponds to fader strip (1-9)
    Implemented as a normalized float value, must be converted to 14-bit for motors(multiply by 16383 to avoid fader resets on X-Touch)

    **Scribble Strips**Sent as SysEx MIDI message. Two consecutive rows of 56 characters, physically divided into 7x2 character screens on X-Touch
    Accepts any string, Only first 7 characters will show on X-Touch

    **VU Meters** [MidiValue]=Lit LEDs. 
  ***VU meters automatically fall off so you must pulse the value to keep a solid meter***
    Sent as ChannelPressure message
    [0]=NoLED, [1,2]=1Green, [3,4]=2Green, [5,6]=3Green, [7,8]=4Green,
    [9,10]=4Green 1Orange , [11]=4Green 2Orange, [12,13]=4Green 3Orange,
    [14]=4Green 3Orange 1Red(ClipOn), [15]=Clear clip and full meter

 **Encoder Feedback** [MidiValue]_LED#  Numbered clockwise from 1-13. Dash indicates all LED between numbers are lit
 Broken into sets separated by 16 MIDI notes. They vary by how LEDs are used and are for panning/clipping/spread/etc.

    Mode1:[0]_off, [1]_2, [2]_3, [3]_4, [4]_5, [5]_6, [6]_7, [7]_8, [8]_9, [9]_10, [10]_11 [11]_12 [12]_off

    Mode2:[16]_off,[17]_2-7, [18]_3-7, [19]_4-7, [20]_5-7, [21]_6-7, [22]_7,
          [23]_7-8, [24]_7-9, [25]_7-10, [26]_7-11, [27]_7-12, [28]_off

    Mode3:[32]_off, [33]_2, [34]_2-3, [35]_2-4, [36]_2-5, [37]_2-6, [38]_2-7
		  [39]_2-8, [40]_2-9, [41]_2-10, [42]_2-11. [43]_2-12, [44]_off

    Mode4:[48]_off, [49]_7, [50]_6-8, [51]_5-9, [52]_4-10, [53]_3-11, [54]_2-12, [55]_off

    Mode5:[63]_off, [64]_1+13, [65]1-2+13, [66]1+3+13, [67]_1+4+13, [68]_1+5+13
		  [69]_1+6+13, [70]_1+7+13, [71]_1+8+13, [72]_1+9+13, [73]_1+10+13
		  [74]_1+11+13, [75]_1+12+13, [76-80]_1+13

    Mode6:[80]_1+13, [81]_1-7+13, [82]_1+3-7+13, [83]_1+4-7+13, [84]_1+5-7+13
		  [85]_1+6-7+13 [86]_1+7+13, [87]_1+7-8+13, [88]_1+7-9+13, [89]_1+7-10+13,
	      [90]_1+7-11+13, [91]_1+7-13, [92-96]_1+13

    Mode7:[96]_1+13, [97]_1-2+13, [98]1-3+13, [99]_1-4+13, [100]_1-5+13,
		  [101]_1-6+13, [102]_1-7+13, [103]_1-8+13, [104]_1-9+13, [105]_1-10+13
		  [106]_1-11+13, [107]_1-13, [108-112]_1+13

    Mode8:[112]_1+13, [113]_1+7+13, [114]_1+6-8+13, [115]_1+5-9+13, [116]_1+4-10+13
		  [117]_1+3-11+13, [118]_1-13, [119-127]_1+13
*/


//Initialize Script variables
var yearSecs = 31556926;//Number of seconds in a year (365.24 days)
var monthSecs = 2629743;//Number of seconds in a (rounded) month
var daySecs = 86400;//Number of seconds in a day
var hourSecs = 3600;//Number of seconds in an hour
var minuteSecs = 60;//Number of seconds in a minute
var UTCStamp = 0;//Holds UTC TimeUTCStamp for date calculation
var UTCOffset = 0;//Holds UTC Time UTCOffset for local synchronization
var frameTicker = 0;//Used to count frames for clip reset
var counter = 0;//Used for loop iteration
var stripArray = [];//Used to construct SysEx commands for scribble strip updates
var rate = 30;//Update rate in Hz or FPS
//Force Script update rate to 30, as default is 50 and it is not editable when connected to a module
script.setUpdateRate(rate);
function init()
{
   //Synchronize Arrays 1-7
    for(counter=0;counter<8;counter++){
        //Init Motor Fader Positions
        local.sendPitchWheel(counter+1,local.values.strips.getChild('_'+(counter+1)).fader.get()*16383);
        //Pulse VU Meters at current value
        local.sendChannelPressure(counter+1,local.values.strips.getChild('_'+(counter+1)).meter.get()*14+(16*(counter)));
        //Init POT LEDs
        if(((local.values.strips.getChild('_'+(counter+1)).potMode.get()-1)/16==3)||((local.values.strips.getChild('_'+(counter+1)).potMode.get()-1)/16==7)){     
            local.sendCC(0,0x30+index,(local.values.strips.getChild('_'+(counter+1)).potVal.get()*5)+(local.values.strips.getChild('_'+(counter+1)).potMode.getData()));
        }else{
            local.sendCC(0,0x30+counter,(local.values.strips.getChild('_'+(counter+1)).potVal.get()*11)+(local.values.strips.getChild('_'+(counter+1)).potMode.getData()));
        }
       // local.sendCC(0,0x30+(counter), (local.values.strips.getChild('_'+(counter+1)).potVal.get()*12)+local.values.strips.getChild('_'+(counter+1)).potMode.getData());
        //Init Select LEDs
        local.sendNoteOn(1,counter+22,local.values.strips.getChild('_'+(counter+1)).select.getData());
         //Calculate Top Scribble Strip Array
        stripArray[counter]=local.values.strips.getChild('_'+(counter+1)).encName.get();
        if ((stripArray[counter].length)>7){
            stripArray[counter]=stripArray[counter].substring(0,7);
        }else{
            while((stripArray[counter].length)<7){
                stripArray[counter]+=" ";
            }
        } 
    }
    //Synchronize Arrays 8-15
    for(counter=8;counter<16;counter++){
       //Calculate Bottom Sysex
        stripArray[counter]=local.values.strips.getChild('_'+(counter-7)).fdrName.get();
        if ((stripArray[counter].length)>7){
            stripArray[counter]=stripArray[counter].substring(0,7);
        }else{
            while((stripArray[counter].length)<7){
                stripArray[counter]+=" ";
            }
        } 
    }
    //Send Assembled String Array to scribble strips
    local.sendSysex(0x00,0x00,0x66,0x14,0x12,0x00,stripArray);

    //Calculate Clock Values
    UTCOffset = (yearSecs*1970) + (hourSecs*-1)+(minuteSecs*-21) - 39;
    UTCStamp = util.getTimestamp();
    hours = Math.round(Math.floor((((UTCStamp+UTCOffset)%yearSecs)%daySecs)/hourSecs));
    //Output Hours Digits
    local.sendCC(1, 71, 48+Math.round(Math.floor(hours%10)));
    local.sendCC(1, 72, 48+Math.round(Math.floor(hours/10)));
    minutes = Math.round(Math.floor((((UTCStamp+UTCOffset)%yearSecs)%daySecs)%hourSecs/minuteSecs));
    //Output Minutes Digits
    local.sendCC(1, 69, 48+Math.round(Math.floor(minutes%10)));
    local.sendCC(1, 70, 48+Math.round(Math.floor(minutes/10)));
    seconds = Math.round(Math.floor(((((UTCStamp+UTCOffset)%yearSecs)%daySecs)%hourSecs)%minuteSecs));
    //Output Seconds Digits
    local.sendCC(1, 67, 48+Math.round(Math.floor(seconds%10)));
    local.sendCC(1, 68, 48+Math.round(Math.floor(seconds/10)));
}

//Some script parameter has changed
//I think only file path and update rate can even trigger this now
function scriptParameterChanged(param)
{
	
}

function update(deltaTime)
{
    //Get current UTC timestamp
    UTCStamp = util.getTimestamp();
    //Unused calculations for years and days based on UTC stamp
    //var years = Math.round(Math.floor((UTCStamp+UTCOffset)/yearSecs));
	//var days = Math.round(Math.floor(((UTCStamp+UTCOffset)%yearSecs)/daySecs));
   
    //Is calculated 'hours' value different from the displayed one?
    if(hours!=Math.round(Math.floor((((UTCStamp+UTCOffset)%yearSecs)%daySecs)/hourSecs))){
		hours = Math.round(Math.floor((((UTCStamp+UTCOffset)%yearSecs)%daySecs)/hourSecs));
		local.sendCC(1, 71, 48+Math.round(Math.floor(hours%10)));
		local.sendCC(1, 72, 48+Math.round(Math.floor(hours/10)));
	}
    //Is calculated 'minutes' value different form the displayed one?
    if(minutes!=Math.round(Math.floor(((((UTCStamp+UTCOffset)%yearSecs)%daySecs)%hourSecs)/minuteSecs))){
		minutes = Math.round(Math.floor((((UTCStamp+UTCOffset)%yearSecs)%daySecs)%hourSecs/minuteSecs));
		local.sendCC(1, 69, 48+Math.round(Math.floor(minutes%10)));
		local.sendCC(1, 70, 48+Math.round(Math.floor(minutes/10)));
    }
    //Is calculated 'seconds' value different from the displayed one?
	if(seconds!=Math.round(Math.floor(((((UTCStamp+UTCOffset)%yearSecs)%daySecs)%hourSecs)%minuteSecs))){
		
		seconds = Math.round(Math.floor(((((UTCStamp+UTCOffset)%yearSecs)%daySecs)%hourSecs)%minuteSecs));
		local.sendCC(1, 67, 48+Math.round(Math.floor(seconds%10)));
		local.sendCC(1, 68, 48+Math.round(Math.floor(seconds/10)));
	}
    //Advance our frame counter
    frameTicker++;
    //Have we reached our tick threshold?
	if (frameTicker>rate*1.5){
		frameTicker = 0;
		var i;
		//Clear VU Meter 'Clip' LEDs once every 45 updates
		for(i=0;i<8;i++){
			local.sendChannelPressure(1,15+(16*i));
		}
	}
}

//****MODULE SPECIFIC SCRIPTS********** */

function moduleParameterChanged(param)
{
	if(param.isParameter())
	{
        //Did we change the selected strip?
        if(param.name.substring(0,5)=="strip"){
            var i;
            for(i=0;i<8;i++){
                if((param.get()==0)||(i+1!=param.get())){
                    //select[i].set("Off");
                    local.values.strips.getChild('_'+(i+1)).select.set("off");
                }else{
                    // select[i].set("Solid");
                    local.values.strips.getChild('_'+(i+1)).select.set("on");
                }
            }
        }
		//script.log("Module parameter changed : "+param.name+" > "+param.get());
		
	}else 
	{
		//script.log("Module parameter triggered : "+value.name);	
	}
}


function moduleValueChanged(value)
{
	if(value.isParameter())
	{
        if(value.name=="fader"){
            local.sendPitchWheel(parseInt(value.getParent().name.substring(1,2)),value.get()*16383);
        }else{
            if(value.name=="meter"){
                local.sendChannelPressure(1,(value.get()*14)+((parseInt(value.getParent().name.substring(1,2))-1)*16));
                //local.values.strips.getChild('_'+counter).meter.get()*14+(16*(counter-1)
            }else{
                if(value.name=="select"){
                    local.sendNoteOn(1,parseInt(value.getParent().name.substring(1,2))+23,value.getData());
                }else{
                    if(value.name=="potVal"||value.name=="potMode"){
                        index = parseInt(value.getParent().name.substring(1,2))-1;
                        script.log(local.values.strips.getChild('_'+(index+1)).potMode.get()/16);
                        if(((local.values.strips.getChild('_'+(index+1)).potMode.get()-1)/16==3)||((local.values.strips.getChild('_'+(index+1)).potMode.get()-1)/16==7)){
                            
                            local.sendCC(0,0x30+index,(local.values.strips.getChild('_'+(index+1)).potVal.get()*5)+(local.values.strips.getChild('_'+(index+1)).potMode.getData()));
                        }else{
                            local.sendCC(0,0x30+index,(local.values.strips.getChild('_'+(index+1)).potVal.get()*11)+(local.values.strips.getChild('_'+(index+1)).potMode.getData()));
                        }
                        
                    }else{
                        if(value.name=="encName"){
                            // Update display with new encoder name
                            var index = parseInt(value.getParent().name.substring(1,2))-1;
                            var newLabel = value.get();
                            var short = 7-newLabel.length;
                            var i;
                            for (i=0;i<short;i++){
                                newLabel = newLabel+" ";
                            }
                            if(short>0){
                                local.sendSysex(0x00,0x00,0x66,0x14,0x12,((index)*7),newLabel);
                            }else{
                                local.sendSysex(0x00,0x00,0x66,0x14,0x12,((index)*7),newLabel.substring(0,7));
                            }
                                
                        }else{
                            if(value.name=="fdrName"){
                                var index = parseInt(value.getParent().name.substring(1,2))-1;
                                var newLabel = value.get();
                                var short = 7-newLabel.length;
                                var i;
                                for (i=0;i<short;i++){
                                    newLabel = newLabel+" ";
                                }
                                if(short>0){
                                    local.sendSysex(0x00,0x00,0x66,0x14,0x12,((index)*7+56),newLabel);
                                }else{
                                    local.sendSysex(0x00,0x00,0x66,0x14,0x12,((index)*7)+56,newLabel.substring(0,7));
                                }
                            }
                        }
                    }
                }
            }
        } //script.log("Module value changed : "+value.name+" > "+value.get());
	}else 
	{
		//script.log("Module value triggered : "+value.name);	
	}
}


//*****MIDI MODULE SPECIFIC SCRIPTS*****

function noteOnEvent(channel, pitch, velocity)
{
    //Is it a fader touch?
    if(pitch>103 && pitch<112 && local.parameters.flashOnTouched.get()){
		var index = pitch-104;
        local.values.strips.getChild('_'+(index+1)).touch.set(true);
        local.values.strips.getChild('_'+(index+1)).select.set("flash");
	}
    //Is it a 'Select' button?
	if(pitch>23 && pitch<32){
        //Set new selected strip value    
        local.parameters.stripIndex.set(pitch-23);
	}
//	script.log("Note on received "+channel+", "+pitch+", "+velocity);
}

function noteOffEvent(channel, pitch, velocity)
{
    //Is it a fader touch release?
    if(pitch>103 && pitch<112){
		var index = pitch-104;
        //Release touched boolean
        local.values.strips.getChild('_'+(index+1)).touch.set(false);
        //If this strip is selected
        if(local.parameters.stripIndex.get()==index+1){
            //Set light to solid
            local.values.strips.getChild('_'+(index+1)).select.set("on");
		}else{
            //Set Light off
            local.values.strips.getChild('_'+(index+1)).select.set("off");
		}
	}
	//script.log("Note off received "+channel+", "+pitch+", "+velocity);
}

//Upon receiving MIDI Control Change messzge
function ccEvent(channel, number, value)
{	
    //Is it encoder movement?
    if(channel==1 && number > 15 && number <24){
		var index = number-16;
        //If SpinLeft
        if(value>64){
            //Subtract corrected value from potValue
            local.values.strips.getChild('_'+(index+1)).potVal.set(local.values.strips.getChild('_'+(index+1)).potVal.get()-((value-64)/256));
		}else{
            //Add value to potValue
            local.values.strips.getChild('_'+(index+1)).potVal.set(local.values.strips.getChild('_'+(index+1)).potVal.get()+(value/256));
		}
	}
}

//Upon receiving MIDI PitchWheel message (only fader values)
function pitchWheelEvent(channel,value){
    //Is Master fader?
    if(channel==9){
        local.values.main.mainFader.set(value/16383);
    }
    //It's a strip fader
    else{
        //Update strip module with new value
        local.values.strips.getChild('_'+channel).fader.set(value/16383);
    }
}

//Upon receiving System Exclusive Message
function sysExEvent(data)
{
	//script.log("Sysex Message received, "+data.length+" bytes :");
}
