
const express = require('express')
const app = express(), port=3001
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { CharacterAI } = require("node_characterai");
const accounts = Array("35ffa2332d6523a45833a1fd3a73bb6f2b2febdd", "a74fcf11914d2f24b71bf2de303188d1c883dce0", "a11d77cad2f24263277cca8ac9315eeaa01700fd", "27ecfe97bc56402020659909c776172763dcb1f3");
const {v4 : uuidv4} = require('uuid')

var AccountAuth = new Map();
var AccountChars = new Map();
var ServerStatus = false;

async function StartClients() {
	for (index = 0; index < accounts.length; ++index) {
		let accountID = accounts[index];
		
		let charAI = new CharacterAI();
		await charAI.authenticate(accounts[index])
		AccountAuth.set(accountID, charAI);
		
		let arr_of_chars = Array();
		arr_of_chars.push(await AccountAuth.get(accounts[index]).fetchCharacter("mXzyPFgxh0IMoydznW110YnhiHF6ITNfiKAGklhsrjU"))
		arr_of_chars.push(await AccountAuth.get(accounts[index]).fetchCharacter("roCAnDLY3GUGRwUS1iR_GncjvxvntJtdGFsDZGtPMBo"))
		arr_of_chars.push(await AccountAuth.get(accounts[index]).fetchCharacter("5g8yBVUX2cJ7dxUTjEG8oSUUU4uzg-gn4Dy-Y57XSno"))
		
		AccountChars.set(accountID, arr_of_chars);
	}
	ServerStatus = true;
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
  console.log(ServerStatus)
  if(ServerStatus == false){
	res.send({
		'Answer': "Server starting, please wait!",
		'Token': req.body.token,
		'Account': req.body.account,
  });
  }
	
  if (ServerStatus == true){

  let chat;
  let character;
  let account;
  
  if (req.body.account == ""){
	  account = accounts[Math.floor(Math.random()*accounts.length)];
  }else{
	  account = req.body.account;
  }
  character = AccountChars.get(account)[req.body.variant - 1]
  
  if(req.body.token == ""){
	  chat = await character.createDM();
  }else{
	  chat = await character.DM(req.body.token);
  }
 
  const message = await chat.sendMessage(req.body.msg);
  
  res.send({
    'Answer': message.content,
	'Token': message.chatId,
	'Account': account,
  });
  }
})();
});
app.listen(port, () =>{
	console.log('server started on ' + process.env.DOMAIN + ":" + port)
	StartClients();
})
