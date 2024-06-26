
const express = require('express')
const app = express(), port=3001
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const CharacterAI = require("node_characterai");
//const characterAI = new CharacterAI();	
const arr_of_puppets = new Map();
const {v4 : uuidv4} = require('uuid')
const accounts = Array("35ffa2332d6523a45833a1fd3a73bb6f2b2febdd", "a74fcf11914d2f24b71bf2de303188d1c883dce0", "a11d77cad2f24263277cca8ac9315eeaa01700fd", "27ecfe97bc56402020659909c776172763dcb1f3");
app.get('/', (req, res) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
})

app.get('/usage', (req, res) => {
	var os = require('os-utils');
	res.json([os.freemem()]);
    
})

app.post('/', function(req, res) {
(async () => {
  var select_uuid = uuidv4();
  var os = require('os-utils');
 if (os.freemem() <= 700.0){
	res.send({
		'Answer': "{servers are overloaded, please wait}",
		'Token': req.body.token,
		'Account': req.body.account,
	});
	return;
  }
  
  arr_of_puppets.set(select_uuid, new CharacterAI());
  var account;
  
  
  if(req.body.account != ""){
	account = req.body.account;
  }else{
	account = accounts[Math.floor(Math.random()*accounts.length)];
	
  }
  
  await arr_of_puppets.get(select_uuid).authenticateWithToken(account);
  
  
  var characterId;
  
  if (req.body.variant == 1){
	  characterId = "mXzyPFgxh0IMoydznW110YnhiHF6ITNfiKAGklhsrjU";
  }else{  
	  characterId = "roCAnDLY3GUGRwUS1iR_GncjvxvntJtdGFsDZGtPMBo";
  }

  const chat = await arr_of_puppets.get(select_uuid).createOrContinueChat(characterId);

  var new_token = {};
  
  if(req.body.token != ""){
	await chat.changeToConversationId(req.body.token, true);
	 new_token = req.body.token;
  }else{
	 new_token = await chat.saveAndStartNewChat();
	 new_token = new_token["external_id"]
  }

  // Send a message
  const response = await chat.sendAndAwaitResponse(req.body.msg, true);
	
	
  //console.log(response.text);
  await arr_of_puppets.get(select_uuid).unauthenticate();
  arr_of_puppets.delete(select_uuid)
  res.send({
    'Answer': response.text,
	'Token': new_token,
	'Account': account,
  });

})();
});
app.listen(port, () =>{
	console.log('server started on ' + process.env.DOMAIN + ":" + port)
})