var AIManager = function(player) {
	var _player = player;
	var _listAction = [];
	var _delay = 0;
	var _delayDefault = 500;
	var _started = false;

	function start(){
		setTimeout(_doActions, _delay);
	}

	function done(){
		if(_player.type != PlayerType.PLAYER)
			_player.openCards(false);
		_player.dispatchEvent(PlayerEvent.DONE);
	}

	function ready(){
		_player.dispatchEvent(PlayerEvent.READY);
	}

	function draw(){
		_player.dispatchEvent(PlayerEvent.DRAW);
	}

	function discard(){
		var cards = _player.getCardsWithoutChicken();
		_player.discard(cards[Math.trunc(Math.random() * cards.length)]);
	}

	function play(){
		var cards = _player.getCardsWithoutChicken();
		cards.sort( function(a, b){ return a.type == b.type ? (a.value - b.value) : (a.type - b.type); });
		
		var ci = _player.type == PlayerType.EASY ? Math.trunc(Math.random() * cards.length) : 0;
		_player.playCard(cards[ci]);
	}

	function _wait(delayMax = 1000, delayMin = 500){
		_delay = _randomTime(delayMax, delayMin);
	}

	function showCards(){
		_player.openCards(true);
		_player.showCards(true);
	}
		
	function hideCards(){
		_player.openCards(false);
		_player.showCards(false);
	}

	var _addAction = function(func, delayMax = 1000, delayMin = 500, args){
		_listAction.push({method:func, delay:_randomTime(delayMax, delayMin), args:args });
		
		if(_listAction.length == 1)
			start();
	}

	function _doActions(evt) {
		if(Game.currentStep == GameStep.GAMEOVER) 
			return;
		   
		if(_listAction.length > 0){
			_started = true;
			var action = _listAction.shift();
			if(action && action.method){
				action.method.apply(this, action.args);
				_delay = action.delay;
			}
			start();
		}else{
			_delay = _delayDefault;
			_started = false;
		}
	}

	function _passSelectedCardTo(p){
		var cc = _player.selectedCards.slice();
		for(var i = 0, j = cc.length, c = cc[i]; i < j; c = cc[++i]){
			_player.removeCard(c);
			p.addCard(c);
		}
	}

	var _neighbor = function(){
		_addAction(done);
	}

	var _necromancer = function(){
		var s_card = [];
		var cards = _player.cards.slice();
		
		_wait(500, 50);
		_addAction(_necromancerSelect, 500, 100, [cards]);
		_addAction(_necromancerSelect, 700, 100, [cards]);
		_addAction(ready);
	}
	var _necromancerSelect = function(cards){ _player.selectCard(cards.splice(Math.trunc(Math.random() * cards.length), 1)[0]); }

	var _loanshark = function(){
		var players = PlayersManager.players;
		var p = PlayersManager.currentPlayer();
		
		//lista Players
		var ps_tmp = players.slice();
		//remove o player atual da lista
		ps_tmp.splice(players.indexOf(p), 1);
		//seleciona um player
		var p_tmp = ps_tmp[Math.trunc(Math.random() * ps_tmp.length)];
		
		_addAction(p_tmp.selectCard, 700, 500, [p_tmp.cards[Math.trunc(Math.random() * p_tmp.cards.length)]]);
		_addAction(function(p_s){ 
						//TODO
						//Aplicar AI para escolher pior carta
						p_s.selectCard(p_s.cards[Math.trunc(Math.random() * p_s.cards.length)]);
					}, 700, 500, [p]);
		_addAction(function(p_from, p_to){ 
						p_from.ai.passSelectedCardTo(p_to);
						p_to.ai.passSelectedCardTo(p_from);
					}, 1200, 1000, [p, p_tmp]);
		_addAction(ready);
	}

	var _preacher = function(){
		var cards = _player.getCardsWithoutChicken();

		if(cards.length == 0){
			_addAction(showCards, 3000, 2000);
			_addAction(hideCards);
			_addAction(ready);
		}else{
			//cards.sortOn(["type", "value"], Array.DESCENDING);
			var ci = _player.type == PlayerType.EASY ? Math.trunc(Math.random() * cards.length) : 0;
			
			_wait(500, 50);
			_addAction(_player.discard, 1000, 800, [cards[ci]]);
			_addAction(draw, 700, 300);
			_addAction(ready);
		}
	}

	var _randomTime = function(max, min = 0){ return max + (Math.random() * (min - max)); }

	return {
		play: play,
		draw: draw,
		discard: discard,
		done: done,
		ready: ready,
		wait: _wait,
		showCards: showCards,
		hideCards: hideCards,
		addAction: _addAction,

		necromancer: _necromancer,
		neighbor: _neighbor,
		loanshark: _loanshark,
		preacher: _preacher,

		passSelectedCardTo: _passSelectedCardTo
	};

};