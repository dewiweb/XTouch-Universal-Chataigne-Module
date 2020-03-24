
/* ********** GENERAL SCRIPTING **********************
		All the code outside functions will be executed each time this script is loaded,
			at file load, when hitting the "reload" button or when saving this file
*/
//Here are all the type of parameters you can create
/*
var myTrigger = script.addTrigger("My Trigger", "Trigger description"); 									//This will add a trigger (button)
var myBoolParam = script.addBoolParameter("My Bool Param","Description of my bool param",false); 			//This will add a boolean parameter (toggle), defaut unchecked
var myFloatParam = script.addFloatParameter("My Float Param","Description of my float param",.1,0,1); 		//This will add a float number parameter (slider), default value of 0.1, with a range between 0 and 1
var myIntParam = script.addIntParameter("My Int Param","Description of my int param",2,0,10); 				//This will add an integer number parameter (stepper), default value of 2, with a range between 0 and 10
var myStringParam = script.addStringParameter("My String Param","Description of my string param", "cool");	//This will add a string parameter (text field), default value is "cool"
var myColorParam = script.addColorParameter("My Color Param","Description of my color param",0xff0000ff); 	//This will add a color parameter (color picker), default value of opaque blue (ARGB)
var myP2DParam = script.addPoint2DParameter("My P2D Param","Description of my p2d param"); 					//This will add a point 2d parameter
var myP3DParam = script.addPoint3DParameter("My P3D Param","Description of my p3d param"); 					//This will add a point 3d parameter
var myTargetParam = script.addTargetParameter("My Target Param","Description of my target param"); 			//This will add a target parameter (to reference another parameter)
var myEnumParam = script.addEnumParameter("My Enum Param","Description of my enum param",					//This will add a enum parameter (dropdown with options)
											"Option 1", 1,													//Each pair of values after the first 2 arguments define an option and its linked data
											"Option 2", 5,												    //First argument of an option is the label (string)
											"Option 3", "banana"											//Second argument is the value, it can be whatever you want
											); 	
*/
//you can also declare custom internal variable
//var myValue = 5;




//X-TOUCH Scripting Begins

// **Faders**
//Normalized fader value as float, must be converted to 14-bit for motors(multiply by 16383 to avoid fader resets on X-Touch)
//var faderVals = [];
// **Top Scribble Strips**
//Accepts any string, Only first 7 characters will show on X-Touch
var topStrips = [];
// **Bottom Scribble Strips**
var botStrips = [];
// **VU Meters**
// [0]=NoLED, [1,2]=1Green, [3,4]=2Green, [5,6]=3Green, [7,8]=4Green,
// [9,10]=4Green 1Orange , [11]=4Green 2Orange, [12,13]=4Green 3Orange,
// [14]=4Green 3Orange 1Red(ClipOn), [15]=Clear clip and full meter
var meters = [];
// **Touch-Sensitivity**
var faderTouch = [];
// **SelectButton**
var select = [];
// **EncoderFeedbackValue**
// **Encoder Feedback**
//Mode1:[0]_off, [1]_2, [2]_3, [3]_4, [4]_5, [5]_6, [6]_7, [7]_8, [8]_9, [9]_10, [10]_11 [11]_12 [12]_off
//Mode2:[16]_off,[17]_2-7, [18]_3-7, [19]_4-7, [20]_5-7, [21]_6-7, [22]_7,
//      [23]_7-8, [24]_7-9, [25]_7-10, [26]_7-11, [27]_7-12, [28]_off
//Mode3:[32]_off, [33]_2, [34]_2-3, [35]_2-4, [36]_2-5, [37]_2-6, [38]_2-7
//		[39]_2-8, [40]_2-9, [41]_2-10, [42]_2-11. [43]_2-12, [44]_off
//Mode4:[48]_off, [49]_7, [50]_6-8, [51]_5-9, [52]_4-10, [53]_3-11, [54]_2-12, [55]_off
//Mode5:[63]_off, [64]_1+13, [65]1-2+13, [66]1+3+13, [67]_1+4+13, [68]_1+5+13
//		[69]_1+6+13, [70]_1+7+13, [71]_1+8+13, [72]_1+9+13, [73]_1+10+13
//		[74]_1+11+13, [75]_1+12+13, [76-80]_1+13
//Mode6:[80]_1+13, [81]_1-7+13, [82]_1+3-7+13, [83]_1+4-7+13, [84]_1+5-7+13
//		[85]_1+6-7+13 [86]_1+7+13, [87]_1+7-8+13, [88]_1+7-9+13, [89]_1+7-10+13,
//		[90]_1+7-11+13, [91]_1+7-13, [92-96]_1+13
//Mode7:[96]_1+13, [97]_1-2+13, [98]1-3+13, [99]_1-4+13, [100]_1-5+13,
//		[101]_1-6+13, [102]_1-7+13, [103]_1-8+13, [104]_1-9+13, [105]_1-10+13
//		[106]_1-11+13, [107]_1-13, [108-112]_1+13
//Mode8:[112]_1+13, [113]_1+7+13, [114]_1+6-8+13, [115]_1+5-9+13, [116]_1+4-10+13
//		[117]_1+3-11+13, [118]_1-13, [119-127]_1+13
var pot = [];

//Initialize arrays of script variables
for(counter=0;counter<8;counter++){
	topStrips[counter] = script.addStringParameter("Encoder "+(counter+1)+" Name","Top Text Slot "+(counter+1),"Enc"+(counter+1)+"***");
	pot[counter] = script.addIntParameter("EncoderVal"+(counter+1),"Encoder Feedback State",96,96,107);
	//potMode[counter]=script.addEnumParameter("pot"+(counter+1)+"mode","LED Feedback Mode",
	botStrips[counter] = script.addStringParameter("Fader "+(counter+1)+" Name","Bot Text Slot "+(counter+1),"Fdr"+(counter+1)+"***");
//	meters[counter] = script.addFloatParameter("VU Meter"+(counter+1),"VU"+(counter+1)+" Level (0-14, clip@14,clear@15)",0,0,1);
	//faderVals[counter]  = script.addFloatParameter("Fader "+(counter+1)+" Value","Normalized Fader Value",.5,0,1); 
	faderTouch[counter] = script.addBoolParameter("touched"+(counter+1),"Fader"+(counter+1)+" Touched",false);
	select[counter] = script.addEnumParameter("Select"+(counter+1),"Select"+(counter+1)+" LED State","Off", 0,"Solid", 127,"Flashing", 1);
}


//Initialize Individual variables
flashOnTouched = script.addBoolParameter("FlashOnTouched","Flash Select Button on Fader Touch",true);
//Master Fader
//faderVals[8]  = script.addFloatParameter("Fader 9 Value","Normalized Fader Value",.0,0,1);
//Select Radio
var stripSelect = script.addIntParameter("stripSelect","Selected Fader Strip",0,0,8);
var bank = script.addBoolParameter("Bank2","Secondary Fader Bank",false);
var yearcons = 31556926;
var monthcons = 2629743;
var daycons = 86400;
var hourcons = 3600;
var minutecons = 60;
var stamp = 0;
var offset = 0;
var ticker = 0;
var counter = 0;
/*
 The init() function will allow you to init everything you want after the script has been checked and loaded
 WARNING it also means that if you change values of your parameters by hand and set their values inside the init() function, they will be reset to this value each time the script is reloaded !
*/
function init()
{
	script.log(" :Init");
		
				local.sendSysex(0x00,0x00,0x66,0x14,0x12,0x00,topStrips[0].get().charCodeAt(0),
																   topStrips[0].get().charCodeAt(1),
																   topStrips[0].get().charCodeAt(2),
																   topStrips[0].get().charCodeAt(3),
																   topStrips[0].get().charCodeAt(4),
																   topStrips[0].get().charCodeAt(5),
																   topStrips[0].get().charCodeAt(6),
																   topStrips[1].get().charCodeAt(0),
																   topStrips[1].get().charCodeAt(1),
																   topStrips[1].get().charCodeAt(2),
																   topStrips[1].get().charCodeAt(3),
																   topStrips[1].get().charCodeAt(4),
																   topStrips[1].get().charCodeAt(5),
																   topStrips[1].get().charCodeAt(6),
																   topStrips[2].get().charCodeAt(0),
																   topStrips[2].get().charCodeAt(1),
																   topStrips[2].get().charCodeAt(2),
																   topStrips[2].get().charCodeAt(3),
																   topStrips[2].get().charCodeAt(4),
																   topStrips[2].get().charCodeAt(5),
																   topStrips[2].get().charCodeAt(6),
																   topStrips[3].get().charCodeAt(0),
																   topStrips[3].get().charCodeAt(1),
																   topStrips[3].get().charCodeAt(2),
																   topStrips[3].get().charCodeAt(3),
																   topStrips[3].get().charCodeAt(4),
																   topStrips[3].get().charCodeAt(5),
																   topStrips[3].get().charCodeAt(6),
																   topStrips[4].get().charCodeAt(0),
																   topStrips[4].get().charCodeAt(1),
																   topStrips[4].get().charCodeAt(2),
																   topStrips[4].get().charCodeAt(3),
																   topStrips[4].get().charCodeAt(4),
																   topStrips[4].get().charCodeAt(5),
																   topStrips[4].get().charCodeAt(6),
																   topStrips[5].get().charCodeAt(0),
																   topStrips[5].get().charCodeAt(1),
																   topStrips[5].get().charCodeAt(2),
																   topStrips[5].get().charCodeAt(3),
																   topStrips[5].get().charCodeAt(4),
																   topStrips[5].get().charCodeAt(5),
																   topStrips[5].get().charCodeAt(6),
																   topStrips[6].get().charCodeAt(0),
																   topStrips[6].get().charCodeAt(1),
																   topStrips[6].get().charCodeAt(2),
																   topStrips[6].get().charCodeAt(3),
																   topStrips[6].get().charCodeAt(4),
																   topStrips[6].get().charCodeAt(5),
																   topStrips[6].get().charCodeAt(6),
																   topStrips[7].get().charCodeAt(0),
																   topStrips[7].get().charCodeAt(1),
																   topStrips[7].get().charCodeAt(2),
																   topStrips[7].get().charCodeAt(3),
																   topStrips[7].get().charCodeAt(4),
																   topStrips[7].get().charCodeAt(5),
																   topStrips[7].get().charCodeAt(6));
				
					 local.sendSysex(0x00,0x00,0x66,0x14,0x12,56,botStrips[0].get().charCodeAt(0),
																   botStrips[0].get().charCodeAt(1),
																   botStrips[0].get().charCodeAt(2),
																   botStrips[0].get().charCodeAt(3),
																   botStrips[0].get().charCodeAt(4),
																   botStrips[0].get().charCodeAt(5),
																   botStrips[0].get().charCodeAt(6),
																   botStrips[1].get().charCodeAt(0),
																   botStrips[1].get().charCodeAt(1),
																   botStrips[1].get().charCodeAt(2),
																   botStrips[1].get().charCodeAt(3),
																   botStrips[1].get().charCodeAt(4),
																   botStrips[1].get().charCodeAt(5),
																   botStrips[1].get().charCodeAt(6),
																   botStrips[2].get().charCodeAt(0),
																   botStrips[2].get().charCodeAt(1),
																   botStrips[2].get().charCodeAt(2),
																   botStrips[2].get().charCodeAt(3),
																   botStrips[2].get().charCodeAt(4),
																   botStrips[2].get().charCodeAt(5),
																   botStrips[2].get().charCodeAt(6),
																   botStrips[3].get().charCodeAt(0),
																   botStrips[3].get().charCodeAt(1),
																   botStrips[3].get().charCodeAt(2),
																   botStrips[3].get().charCodeAt(3),
																   botStrips[3].get().charCodeAt(4),
																   botStrips[3].get().charCodeAt(5),
																   botStrips[3].get().charCodeAt(6),
																   botStrips[4].get().charCodeAt(0),
																   botStrips[4].get().charCodeAt(1),
																   botStrips[4].get().charCodeAt(2),
																   botStrips[4].get().charCodeAt(3),
																   botStrips[4].get().charCodeAt(4),
																   botStrips[4].get().charCodeAt(5),
																   botStrips[4].get().charCodeAt(6),
																   botStrips[5].get().charCodeAt(0),
																   botStrips[5].get().charCodeAt(1),
																   botStrips[5].get().charCodeAt(2),
																   botStrips[5].get().charCodeAt(3),
																   botStrips[5].get().charCodeAt(4),
																   botStrips[5].get().charCodeAt(5),
																   botStrips[5].get().charCodeAt(6),
																   botStrips[6].get().charCodeAt(0),
																   botStrips[6].get().charCodeAt(1),
																   botStrips[6].get().charCodeAt(2),
																   botStrips[6].get().charCodeAt(3),
																   botStrips[6].get().charCodeAt(4),
																   botStrips[6].get().charCodeAt(5),
																   botStrips[6].get().charCodeAt(6),
																   botStrips[7].get().charCodeAt(0),
																   botStrips[7].get().charCodeAt(1),
																   botStrips[7].get().charCodeAt(2),
																   botStrips[7].get().charCodeAt(3),
																   botStrips[7].get().charCodeAt(4),
																   botStrips[7].get().charCodeAt(5),
																   botStrips[7].get().charCodeAt(6));
																
			 //Send all faders to bank1 positions
			for(counter=1;counter<9;counter++){
              //  local.sendPitchWheel(counter,faderVals[counter-1].get()*16383);
                local.sendPitchWheel(counter,local.values.strips.getChild('_'+counter).fader.get()*16383);
                local.sendChannelPressure(counter,local.values.strips.getChild('_'+counter).meter.get()*14+(16*(counter-1)));
				local.sendCC(0,0x30+(counter-1), pot[counter-1].get());
			}		
			offset = (yearcons*1970) + (hourcons*-1)+(minutecons*-21) - 39;
			stamp = util.getTimestamp();
			hours = Math.round(Math.floor((((stamp+offset)%yearcons)%daycons)/hourcons));
			local.sendCC(1, 71, 48+Math.round(Math.floor(hours%10)));
			local.sendCC(1, 72, 48+Math.round(Math.floor(hours/10)));
			minutes = Math.round(Math.floor((((stamp+offset)%yearcons)%daycons)%hourcons/minutecons));
			local.sendCC(1, 69, 48+Math.round(Math.floor(minutes%10)));
			local.sendCC(1, 70, 48+Math.round(Math.floor(minutes/10)));
			seconds = Math.round(Math.floor(((((stamp+offset)%yearcons)%daycons)%hourcons)%minutecons));
			local.sendCC(1, 67, 48+Math.round(Math.floor(seconds%10)));
			local.sendCC(1, 68, 48+Math.round(Math.floor(seconds/10)));
	
	//EXAMPLES BELOW		
	//myFloatParam.set(5); //The .set() function set the parameter to this value.
	//myColorParam.set([1,.5,1,1]);	//for a color parameter, you need to pass an array with 3 (RGB) or 4 (RGBA) values.
	//myP2DParam.set([1.5,-5]); // for a Point2D parameter, you need to pass 2 values (XY)
	//myP3DParam.set([1.5,2,-3]); // for a Point3D parameter, you need to pass 3 values (XYZ)
}

/*
 Scome script parameter has changed
*/
function scriptParameterChanged(param)
{		
	
	//Was it fader-related?
	if(param.name.substring(0,5)=="fader"){	
		
		//FaderName?
			if(param.name.substring(6,7)=='N')	{
				
				//Update display with new parameter value	
				var num = parseInt(param.name.substring(5,6));
				for(i=0;i<7;i++){
					local.sendSysex(0x00,0x00,0x66,0x14,0x12,i+((num)*7)+49,param.get().charCodeAt(i));
				}

			}else{
				
				//FaderValue?
				if(param.name.substring(6,7)=='V'){
					
					//Update fader with new parameter value
					local.sendPitchWheel(parseInt(param.name.substring(5,6)),param.get()*16383);
						//16383 to avoid faders resetting back to 0 on X-Touch
				}
				
			}
			
		}else{
			
			//Is encoder related?
			if(param.name.substring(0,3)=="enc"){
				//EncoderValue?
				if(param.name.substring(7,8)=='V'){
					// Update Circle-display with new value
					var num = parseInt(param.name.substring(10,11));
					local.sendCC(0,0x30+(num-1), param.get());
					
				}else{
				//Then EncoderName
					// Update display with new encoder name
					var num = parseInt(param.name.substring(7,8));
					var i;
					for(i=0;i<7;i++){
						local.sendSysex(0x00,0x00,0x66,0x14,0x12,i+((num)*7)-7,param.get().charCodeAt(i));
					}
				}
				
				

			}else{
				
				//Is is a VU Meter?
				if(param.name.substring(0,2)=='vu'){
					
					//Send VU Meter Value
                  
				
				}else{
					
					//Is it a select light?
					if(param.name.substring(0,3)=='sel'){
						var num= parseInt(param.name.substring(6,7));
						local.sendNoteOn(1,num+23,select[num-1].getData());

					}else{
						
						if(param.name.substring(0,3)=='str'){
							var i;
							for(i=0;i<8;i++){
								if((param.get()==0)||(i+1!=param.get())){
									select[i].set("Off");
								}else{
									select[i].set("Solid");
								}
							}

						}
					}
				}
		
			}
		}
}
	//You can use the script.log() function to show an information inside the logger panel. To be able to actuallt see it in the logger panel, you will have to turn on "Log" on this script.
	//script.log("Parameter changed : "+param.name); //All parameters have "name" property
//	if(param.is(myTrigger)) script.log("Trigger !"); //You can check if two variables are the reference to the same parameter or object with the method .is()
	//else if(param.is(myEnumParam)) script.log("Label = "+param.get()+", data = "+param.getData()); //The enum parameter has a special function getData() to get the data associated to the option
	//else script.log("Value is "+param.get()); //All parameters have a get() method that will return their value


/*
 This function, if you declare it, will launch a timer at 50hz, calling this method on each tick
*/

function update(deltaTime)
{
	stamp = util.getTimestamp();
	//var years = Math.round(Math.floor((stamp+offset)/yearcons));
	//var days = Math.round(Math.floor(((stamp+offset)%yearcons)/daycons));
	if(hours!=Math.round(Math.floor((((stamp+offset)%yearcons)%daycons)/hourcons))){
		hours = Math.round(Math.floor((((stamp+offset)%yearcons)%daycons)/hourcons));
		local.sendCC(1, 71, 48+Math.round(Math.floor(hours%10)));
		local.sendCC(1, 72, 48+Math.round(Math.floor(hours/10)));
	}
	if(minutes!=Math.round(Math.floor(((((stamp+offset)%yearcons)%daycons)%hourcons)/minutecons))){
		minutes = Math.round(Math.floor((((stamp+offset)%yearcons)%daycons)%hourcons/minutecons));
		local.sendCC(1, 69, 48+Math.round(Math.floor(minutes%10)));
		local.sendCC(1, 70, 48+Math.round(Math.floor(minutes/10)));
	}
	if(seconds!=Math.round(Math.floor(((((stamp+offset)%yearcons)%daycons)%hourcons)%minutecons))){
		
		seconds = Math.round(Math.floor(((((stamp+offset)%yearcons)%daycons)%hourcons)%minutecons));
		local.sendCC(1, 67, 48+Math.round(Math.floor(seconds%10)));
		local.sendCC(1, 68, 48+Math.round(Math.floor(seconds/10)));
	}

	ticker++;
	if (ticker>45){
		ticker = 0;
		var i;
		//Clear VU Meter 'Clip' LEDs once every 45 updates
		for(i=0;i<8;i++){
			local.sendChannelPressure(1,15+(16*i));
		}
	}
	//script.log("Update : "+util.getTime()+", delta = "+deltaTime); //deltaTime is the time between now and last update() call, util.getTime() will give you a timestamp relative to either the launch time of the software, or the start of the computer.
}




/* ********** MODULE SPECIFIC SCRIPTING **********************

	The "local" variable refers to the object containing the scripts. In this case, the local variable refers to the module.
	It means that you can access any control inside  this module by accessing it through its address.
	For instance, if the module has a float value named "Density", you can access it via local.values.density
	Then you can retrieve its value using local.values.density.get() and change its value using local.values.density.set()
*/

/*
 This function will be called each time a parameter of this module has changed, meaning a parameter or trigger inside the "Parameters" panel of this module
 This function only exists because the script is in a module
*/
function moduleParameterChanged(param)
{
	if(param.isParameter())
	{
		script.log("Module parameter changed : "+param.name+" > "+param.get());
		
	}else 
	{
		script.log("Module parameter triggered : "+value.name);	
	}
}

/*
 This function will be called each time a value of this module has changed, meaning a parameter or trigger inside the "Values" panel of this module
 This function only exists because the script is in a module
*/
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
            }
        }
        
        
        script.log("Module value changed : "+value.name+" > "+value.get());

	}else 
	{
		script.log("Module value triggered : "+value.name);	
	}
}

/* ********** MIDI MODULE SPECIFIC SCRIPTING ********************* */
/*

MIDI Modules have specific methods that can be used to send MIDI events such as noteOn, noteOff, controlChange and sysEx messages from Script.
If you want to send a MIDI event from this script, you can do the following :

local.sendNoteOn(1, 12, 127); //This will send a NoteOn Event on channel 1, pitch 12, velocity 127
local.sendNoteOff(1, 12); //This will send a NoteOff Event on chanenl 1, pitch 12
local.sendCC(3, 20, 65); //This will send a ControlChange on channel 3, number 20, value 65
local.sendSysEx(15,20,115,10); //This will send 4 bytes as a SysEx message
*/

/*
You can intercept MIDI Events with the functions below
*/

function noteOnEvent(channel, pitch, velocity)
{
	if(pitch>103&&pitch<112&&flashOnTouched.get()){
		var index = pitch-104;
		faderTouch[index].set(true);
		select[index].set("Flashing");
	}
	
	if(pitch>23&&pitch<32){
			stripSelect.set(pitch-23);
	}
//	script.log("Note on received "+channel+", "+pitch+", "+velocity);
}

function noteOffEvent(channel, pitch, velocity)
{
	if(pitch>103&&pitch<112){
		var index = pitch-104;
		faderTouch[index].set(false);
		if(stripSelect.get()==index+1){
			select[index].set("Solid");
		}else{
			select[index].set("Off");
		}
	}
	//script.log("Note off received "+channel+", "+pitch+", "+velocity);
}

function ccEvent(channel, number, value)
{	
	if(channel==1 && number > 15 && number <24){
		var index = number-16;
		script.log(index);
		if(value>64){
			pot[index].set(pot[index].get()-(value-64));
		}else{
			pot[index].set(pot[index].get()+value);
		}
	}
}

function pitchWheelEvent(channel,value){
    local.values.strips.getChild('_'+channel).fader.set(value/16383);
    //Depreciate ASAP
    //faderVals[channel-1].set(value/16383);
}

function sysExEvent(data)
{
	//script.log("Sysex Message received, "+data.length+" bytes :");
}
