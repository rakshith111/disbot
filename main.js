const Discord = require('discord.js');	
const { orderBy } = require('natural-orderby')
const { token } = require('./config.json');
const client = new Discord.Client()    
client.once('ready', () => {
	console.log('Ready!');
});
var dict = {};
var fs = require('fs');
const prefix="!";

const CsvReadableStream = require('csv-reader');
client.on('message',async msg=>{
    if(msg.author.bot) return
    if(msg.content === '!set help'){
         client.channels.cache.get(msg.channel.id).send("Type \n !set  <main vc's id>  <vc's catagory id>")
          return
    }
    const args = msg.content.slice(prefix.length).split(/ +/);
    if(msg.content.startsWith(prefix))
    console.log(args.length)
    switch(args[0]){
        case 'set': if(args.length === 3){
                        console.log("worik")
                            if(args[1].length  && args[2].length === 18 ){
                                dict[`${args[1]}`] =args[2];
                                fs.readFile('./id.json', 'utf8', (err, fileContents) => {
                                    if (err) {
                                      console.error(err)
                                      return
                                    }
                                    try {   
                                    var data = JSON.parse(fileContents) // this data contains both the ids till here $use this to count and create new instances
                                    dat=Object.assign(data,dict) //merging the prev data from file and the data from user
                                    console.log(dat)
                                    //writing the merged data to the same file
                                    fs.writeFile("id.json", JSON.stringify(dat), err => {
                                        if (err) throw err; 
                                        console.log(" Written"); // Success
                                    });
                                    } catch(err) {
                                      console.error(err)
                                    
                                    }
                                  })
                            }
                            else{
                                client.channels.cache.get(msg.channel.id).send("Enter the correct id's")

                            }
                    }
                    else{
                        client.channels.cache.get(msg.channel.id).send("Enter the correct id's")
                    }

                    break;
    }
})



//generates a storage to store the names in an array 
var c = new Boolean(false); // flag
function gen(nam){
    names = new Array();
    names[0]=nam;               
    for(let i=0; i<20 ; i++){
        names[1+i]=nam+" " +(1+i);

    }
    names.sort();
    c=false;
}
// check() checks if the vc's ids are valid this should be  performed whenever the voicestateupdate is called
function check(){
    fs.readFile('./id.json', 'utf8', (err, fileContents) => {
    if (err) {
      console.error(err)
      return
    }
    try {   
    var data = JSON.parse(fileContents) // this data contains both the ids till here $use this to count and create new instances
    var keys = Object.keys(data);
    for(var i =0 ; i<keys.length;i++){
    if(client.channels.cache.get(keys[i]) === undefined){
      console.log("key removed")
      delete data[keys[i]];   // removes the maincatagory id if id doesnt exists
    }}
    console.log(data)
    fs.writeFile("id.json", JSON.stringify(data), err => {
        if (err) throw err; 
        console.log(" Written"); // Success
        });

    } catch(err) {
      console.error(err)
    
    }
  })
  } 

//these should be a class objs
const mainCategory = '875292443917037610';
const mainChannel = '875331035112566804';
const temporaryChannels = new Set();
var temp_main=mainChannel;;
client.on('voiceStateUpdate', async (oldVoiceState, newVoiceState) => {
    check()
    try {
        const {channelID: oldChannelId, channel: oldChannel} = oldVoiceState;
        const {channelID: newChannelId, guild, member} = newVoiceState;
        var nam = client.channels.cache.get(mainChannel)
        if (c) gen(nam.name); // generates a name arr once
        names=orderBy(names)

        if (newChannelId === temp_main && names.length >=1  ) {
             
            const channel = await guild.channels.create(
                names[1],
                {type: 'voice', parent: mainCategory}
            );
            temporaryChannels.add(channel.id);
            temp_main=channel.id;
            names.splice(names.indexOf(names[1]),1)   
            names=orderBy(names)
         
            //await newVoiceState.setChannel(channel); //moves user to new channel
        }
        // Remove empty temporary channels
        if ( temporaryChannels.has(oldChannelId) && oldChannelId !== newChannelId && oldChannel.members.size === 0 ) {
            var n = client.channels.cache.get(oldChannelId);
            names.push(n.name)
            names=orderBy(names)
            await oldChannel.delete();
            temporaryChannels.delete(oldChannelId);
        }
    } catch (error) {
        // Handle any errors
        console.error(error);
    }
});


 client.login(token);
