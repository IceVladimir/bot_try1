const express = require('express')
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
})

app.post('/', function(req, res) {
(async () => {
	const CharacterAI = require("node_characterai_edited2");
	const characterAI = new CharacterAI();	

  await characterAI.authenticateAsGuest();
  //var new_token = await characterAI.getToken1();
  //console.log(new_token);
  //var new_uuid = await characterAI.getUuid1();
  //console.log(new_uuid);
  //await characterAI.setToken("31a41ac3ff76a5eda9d8951b2bc63f5623725744", "1fcd876e-d747-4203-a6f8-29e83ed47820")
  // Place your character's id here
  const characterId = "v3lyisRb7INyd5BUdUKEKS1-MUTBom9dY9qV9-2ioTE";

  const chat = await characterAI.createOrContinueChat(characterId);

  // Send a message
  const response = await chat.sendAndAwaitResponse(req.body.msg, true);

  res.send({
    'Answer': response.text,
  });
})();
});
app.listen(process.env.PORT || 3000)