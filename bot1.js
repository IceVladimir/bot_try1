
const express = require('express')
const app = express(), port=3001
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { CharacterAI } = require("node_characterai");
const accounts = Array("35ffa2332d6523a45833a1fd3a73bb6f2b2febdd", "a74fcf11914d2f24b71bf2de303188d1c883dce0", "a11d77cad2f24263277cca8ac9315eeaa01700fd", "27ecfe97bc56402020659909c776172763dcb1f3");

const arr_of_puppets = new Map();
const {v4 : uuidv4} = require('uuid')

async function StartClients() {
	var os = require('os-utils');
	//while (os.freemem() >= 4000){
	for (let i = 0; i < 50; i++){
		arr_of_puppets.set(uuidv4(), [new CharacterAI(), false, false]);
	}
	console.log(arr_of_puppets);
}

function getEmptyClient() {
	for (var entry of arr_of_puppets.entries()) {
		var key = entry[0],
        value = entry[1];
		if (value[1] == false){
			return key
		}
	}
    return false
}

app.get('/', (req, res) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
})

app.get('/usage', (req, res) => {
	var os = require('os-utils');
	res.json([os.freemem()]);
    
})

app.post('/', function(req, res) {
(async () => {
  var os = require('os-utils');
 if (os.freemem() <= 700.0){
	res.send({
		'Answer': "{servers are overloaded, please wait}",
		'Token': req.body.token,
		'Account': req.body.account,
	});
	return;
  }
  
  var account = accounts[Math.floor(Math.random()*accounts.length)];
  var client_key = getEmptyClient()
  
  if (client_key == false){
	  res.send({
		'Answer': "{servers are overloaded, please wait}",
		'Token': req.body.token,
		'Account': req.body.account,
	});
	return;
  }
  arr_of_puppets.get(client_key)[1] = true
  
  if (arr_of_puppets.get(client_key)[2] == false){
	await arr_of_puppets.get(client_key)[0].authenticate(account);
	arr_of_puppets.get(client_key)[2] = true
  }
  
  
  var characterId;
  
  if (req.body.variant == 1){
	  characterId = "mXzyPFgxh0IMoydznW110YnhiHF6ITNfiKAGklhsrjU";
  }else if (req.body.variant == 2){  
	  characterId = "roCAnDLY3GUGRwUS1iR_GncjvxvntJtdGFsDZGtPMBo";
  }else if (req.body.variant == 3){  
	  characterId = "5g8yBVUX2cJ7dxUTjEG8oSUUU4uzg-gn4Dy-Y57XSno";
  }
  
  try {
	  
  const character = await arr_of_puppets.get(client_key)[0].fetchCharacter(characterId);
  var dm;
  var new_token = {};
  
  if(req.body.token != ""){
	  dm = await character.DM(req.body.token);
  }else{
	  dm = await character.createDM(); 
  }	
  
  response = await dm.sendMessage(req.body.msg);
  new_token = response["chatId"]
  if (response.content) response = response.content
  if (response == "Error or Violent content") {
	  arr_of_puppets.get(client_key)[2] = false;
	  arr_of_puppets.get(client_key)[0].unauthenticate();
  }
  arr_of_puppets.get(client_key)[1] = false
  } catch (err) {
	  arr_of_puppets.get(client_key)[1] = false;
	  arr_of_puppets.get(client_key)[2] = false;
	  arr_of_puppets.get(client_key)[0].unauthenticate();
  }
 
  res.send({
    'Answer': response,
	'Token': new_token,
	'Account': account,
  });

})();
});
app.listen(port, () =>{
	console.log('server started on ' + process.env.DOMAIN + ":" + port)
	StartClients();
})

/*
(async () => {
  // Authenticating as a guest (use `.authenticateWithToken()` to use an account)
  await characterAI.authenticate("35ffa2332d6523a45833a1fd3a73bb6f2b2febdd").then(async() => {
	   console.log("Logged in");
	   // start coding in here!
  });
  
  const character = await characterAI.fetchCharacter("mXzyPFgxh0IMoydznW110YnhiHF6ITNfiKAGklhsrjU");
  const dm = await character.DM(); 

// send it a message
  const message = await dm.sendMessage("hello");

// get the text content
  const content = message.content;

  console.log(message);	
})();
*/