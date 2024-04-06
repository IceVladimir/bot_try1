
const express = require('express')
const app = express(), port=3001
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const CharacterAI = require("node_characterai");
//const characterAI = new CharacterAI();	
const arr_of_puppets = new Map();
const {v4 : uuidv4} = require('uuid')

app.get('/', (req, res) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
})

app.post('/', function(req, res) {
(async () => {
  var select_uuid = uuidv4();
  arr_of_puppets.set(select_uuid, new CharacterAI());
  await arr_of_puppets.get(select_uuid).authenticateWithToken("35ffa2332d6523a45833a1fd3a73bb6f2b2febdd");
  
  
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
  });

})();
});
app.listen(port, () =>{
	console.log('server started on ' + process.env.DOMAIN + ":" + port)
})