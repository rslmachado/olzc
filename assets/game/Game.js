var GameStep = {
	SETUP: "setup",
	STEP1: "step1",
	STEP2: "step2",
	STEP3: "step3",
	STEP_ACTION: "action",
	GAMEOVER: "gameOver"
};

var Game = function(qtd_players, target){
	Game.currentStep = "";

	board = target.find(".board");

	/*
	ScreenManager.init({
		target: board,
		onResize: updateScreen,
		updateOnInit: true
	});
	*/

	PlayersManager.init({
		target: board
	});
	
	CardManager.init({
		board: board,
		deck: board.find(".deck"),
		discard: board.find(".discard")
	});

	
	function updateScreen(offset, center, timer = .5){
		var obj = $(".deck");
		TweenLite.set(obj, {top: (center.y - obj.height()/2) +"px", left: (center.x - obj.width()/2 - 100 * Game.scale) +"px"});

		var obj = $(".discard");
		TweenLite.set(obj, {top: (center.y - obj.height()/2) +"px", left: (center.x - obj.width()/2 + 100 * Game.scale) +"px"});

		CardManager.updateCardsPos(timer);
		PlayersManager.allocatePlayers();
	}

	ScreenManager.onResize(updateScreen);
	updateScreen(ScreenManager.offset(), ScreenManager.center(), 0);

	function setup(){
		Game.currentStep = GameStep.SETUP;
			
		CardManager.prepareDeck(PlayersManager.players.length);
			
		for (var i = 0; i < PlayersManager.players.length; i++)
			setTimeout(dealCards, 1200 * i, PlayersManager.players[i]);

		PlayersManager.index(Math.trunc(Math.random() * PlayersManager.numPlayers()));
		setTimeout(stepOne, 1300 * i);
	}

	function dealCards(player, callback){
		if(player.cards.length < 6){
			player.addCard(CardManager.draw());
			setTimeout(dealCards, 200, player);
		}else
			callback && callback();
	}

	function discardCard(card){
		if(card == null){
			gameOver();
		}else{
			CardManager.discard(card);
		}
	}

	function nextTurn(){
		PlayersManager.next();
		stepOne(); 
	}

	function stepOne(){
		//console.log("stepOne");
		if(Game.currentStep == GameStep.GAMEOVER) return;	
		
		Game.currentStep = GameStep.STEP1;
		PlayersManager.currentPlayer().doStepOne();
	}

	function stepTwo(){
		//console.log("stepTwo");
		if(Game.currentStep == GameStep.GAMEOVER) return;
		
		Game.currentStep = GameStep.STEP2;
		var p = PlayersManager.currentPlayer();
		
		if(p.getCardsWithoutChicken().length == 0)
			gameOver();
		else
			p.doStepTwo();
	}

	function stepThree(){
		//console.log("stepThree");
		if(Game.currentStep == GameStep.GAMEOVER) return;

		Game.currentStep = GameStep.STEP3;
		PlayersManager.currentPlayer().doStepThree();
	}

	function addPlayerEvent(player){
		player.addEventListener(PlayerEvent.DISCARD, onDiscardCard);
		player.addEventListener(PlayerEvent.PLAY, onPlayCard);
		player.addEventListener(PlayerEvent.DRAW, onDrawCard);
		player.addEventListener(PlayerEvent.DONE, onDone);
	}

	var newGame = function(qtd_players = 3){
		var playerTypes = [PlayerType.EASY, PlayerType.MEDIUM, PlayerType.HARD];
		addPlayerEvent(PlayersManager.addPlayer(PlayerType.PLAYER));
		for(var p = 1; p < qtd_players; p++)
			addPlayerEvent(PlayersManager.addPlayer(playerTypes[Math.trunc(Math.random() * playerTypes.length)]));
		//setup();

		return { setup:setup };
	}

	var gameOver = function(){
		console.log("Fim de jogo");
		Game.currentStep = GameStep.GAMEOVER;
		
		var finalPlayers = [];
		for (var pp = PlayersManager.players, i = 0, j = pp.length, p = pp[i]; i < j; p = pp[++i]){
			p.showCards(true);
			p.openCards(true);

			var cards = p.getCardsOnlyChicken().sort( function(a, b){ return a.value - b.value; });
			if(cards.length > 0)
				finalPlayers.push({player:p, lowCard:cards[0].value, qtd:cards.length});
		}

		finalPlayers.sort( function(a, b){ return a.qtd == b.qtd ? (a.lowCard - b.lowCard) : (a.qtd - b.qtd); });

		console.log("======", finalPlayers);

		/*
		container.addChild(new GameOver(finalPlayers[0].player.type == PlayerType.PLAYER));
		*/
	}

	//Players Actions
	function onDone(evt) {
		if(Game.currentStep == GameStep.STEP1)
			stepTwo();
		else if(Game.currentStep == GameStep.STEP2)
			stepThree();
		else if(Game.currentStep == GameStep.STEP_ACTION)
			nextTurn();
	}
	
	function onPlayCard(evt, c, p){
		//console.log("PlayCard", c.type);
		Game.currentStep = GameStep.STEP_ACTION;
		discardCard(c);

		var p = PlayersManager.currentPlayer();

		if(p.getCardsWithoutChicken().length == 0)
			gameOver();
		else
			ActionManager.doAction(c.type);
	}
	
	function onDiscardCard(evt, card){
		discardCard(card);
	}
	
	function onDrawCard(evt){
		if(CardManager.deckIsEmpty())
			return;
		
		var card = CardManager.draw();
		var p = evt.data.player;
	
		p.addCard(card);
		
		//Se o deck estiver vazio, encerra o jogo
		if(CardManager.deckIsEmpty())
			gameOver();
	}

	return newGame(qtd_players);
};