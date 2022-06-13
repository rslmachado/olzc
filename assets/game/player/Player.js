function Player(name, type){
	var _id = name;
	var _type = type ? type : PlayerType.PLAYER;
	var _cards = [];
	var _selectedCards = [];
	var _playing = true;
	var _showingCards = false;
	var _openCards = false;
	var _actived = false;
	var _rotation = 0;
	var _toRad = Math.PI / 180;
	var _gameObject = $("<div class=\"player\" \
									style=\"background-color: rgb(" + getColor() + ", " + getColor() + ", " + getColor() + ");\" \
									id=\"" + name + "\"> \
									<div style=\"position:absolute; border:solid 1px; height:25px; width:25px;\" >" + name + "</div> \
							</div> \
						");
	var _dimensions = {
		height: _gameObject.height(),
		width: _gameObject.width(),
		cX: 0,
		cY: 0
	};

	TweenLite.set(_gameObject, {scale: Game.scale });

	var _ai;
		
	var _addCard = function(card){
		_cards.push(card);
		if(_type == PlayerType.PLAYER){
			card.show();
			card.addEventListener("click", _clickManager, { player: this });
		}else
			card.hide();

		_updateCardsPos();
	};

	var _removeCard = function(c){
		if(c == null) return c;

		_removeFrom(_cards, c);
		_removeFrom(_selectedCards, c);	

		c.removeEventListener("click", _clickManager);

		_updateCardsPos();
		return c;
	}

	var _discard = function(c){
		_gameObject.trigger( PlayerEvent.DISCARD, [c]);
		return _removeCard(c);
	}

	var _playCard = function(c){
		_gameObject.trigger( PlayerEvent.PLAY, [c]);
		return _removeCard(c);
	}

	var _clickManager = function(evt){
		var c = evt.data.card;
		var p = evt.data.player;

		if(p.type == PlayerType.PLAYER)
			if(!p.actived())
				p.openCards(!p.openCards());
			else if(Game.currentStep == GameStep.STEP2)
				p.discardStepTwoCard(c);
			else if(Game.currentStep == GameStep.STEP3)
				p.discardStepThreeCard(c);
	};

	var _doStepOne = function(){
		if(_type == PlayerType.PLAYER)
			_setOpenCards(true);

		for(var i = _cards.length; i < 6; i++)
			_ai.addAction(_ai.draw, 200, 200);

		_ai.addAction(_ai.done);
	}
		
	var _doStepTwo = function(){
		//console.log("doStepTwo");
		if(_type != PlayerType.PLAYER){
			_ai.addAction(_ai.discard);
			_ai.addAction(_ai.done);
		}
	}
		
	var _doStepThree = function(){
		//console.log("doStepThree");
		if(_type != PlayerType.PLAYER){
			_ai.addAction(_ai.play);
		}
	}

	var _getCardsWithoutChicken = function(){
		var chickens = [];
		var cards = _cards.slice();
		
		for(i = 0, j = _cards.length, c = _cards[i]; i < j; c = _cards[++i])
			if(c.type == CardType.CHICKEN)
				_removeFrom(cards, c);				
		return cards;
	}

	var _getCardsOnlyChicken = function(){
		var chickens = [];
		var cards = _cards.slice();
		
		for(i = 0, j = _cards.length, c = _cards[i]; i < j; c = _cards[++i])
			if(c.type != CardType.CHICKEN)
				_removeFrom(cards, c);				
		return cards;
	}

	var _discardStepTwoCard = function(c){
		if(_openCards){
			if(c.type != CardType.CHICKEN){
				_discard(c);
				_ai.done();
			}
		}else
			_setOpenCards(true);
	}

	var _discardStepThreeCard = function(c){
		if(_openCards){
			if(c.type != CardType.CHICKEN){
				_playCard(c);
			}
		}else
			_setOpenCards(true);
	}

	var _setOpenCards = function(value){
		if(value != null){
			_openCards = value;
			_updateCardsPos();
		}
		return _openCards;
	}

	var _setShowCards = function(value = true){
		for(var i = 0; i < _cards.length; i++){
			if(value)
				_cards[i].show();
			else
				_cards[i].hide();
		}
		_showingCards = value;
	}

	function _updateCardsPos(fast = false){
		var totalTwist = _openCards ? 15 : 30;
 		var totalPos = _cards.length * (_openCards ? 14 : 10);
 		var scalingFactor = 1.5;
 		var twistPerCard = totalTwist / _cards.length;
		var posPerCard = totalPos / _cards.length;
		var startTwist = _rotation - ((totalTwist-twistPerCard) / 2);
		var startPos = -1 * ((totalPos-posPerCard) / 2);
		var rotationAngle = _rotation * _toRad;

		var objX = _gameObject.position().left + _dimensions.width/2;
     	var objY = _gameObject.position().top + _dimensions.height/2;
		var radiusX = 50 * Game.scale * (_openCards ? 1.2 : 1);
		var radiusY = 135 * Game.scale * (_openCards ? 2.5 : 1);

		for (var i = 0; i<_cards.length; i++) {
			var twistForThisCard = startTwist + (i * twistPerCard);
			var posForThisCard = startPos + (i * posPerCard);
			var r = (posForThisCard - 90) * _toRad;
			var c = _cards[i];

			var px = radiusX * Math.sin(r) * (_selectedCards.indexOf(c) >= 0 ? scalingFactor : 1);
			var py = radiusY * Math.cos(r);

			var objXt = objX - px * Math.sin(rotationAngle) + py * Math.cos(rotationAngle);
			var objYt = objY + py * Math.sin(rotationAngle) + px * Math.cos(rotationAngle);

			c.rotation(twistForThisCard, false);
			c.gameObject.parent().append(c.gameObject);

			TweenLite.to(c.gameObject, (fast ? .4 : 1), {rotation: twistForThisCard, top: (objYt - c.dimensions.height/2 - c.dimensions.cY/2) +"px", left: (objXt - c.dimensions.width/2 - c.dimensions.cX/2) +"px"});
		}
	}

	var _setRotation = function(value){
		if(value != null){
			TweenLite.set(_gameObject, {rotation: (_rotation = value) });

			var rad = _rotation * Math.PI / 180,
			    sin = Math.sin(rad),
			    cos = Math.cos(rad);
			    w = _gameObject.width() * Game.scale;
			    h = _gameObject.height() * Game.scale;

			_dimensions.width = Math.round(Math.abs(w * cos) + Math.abs(h * sin));
			_dimensions.height = Math.round(Math.abs(w * sin) + Math.abs(h * cos));
			_dimensions.cY = Math.round(h - _dimensions.height + (_gameObject.height() - _dimensions.height)/2);
			_dimensions.cX = Math.round(w - _dimensions.width + (_gameObject.width() - _dimensions.width)/2);
		}
		return _rotation;
	};

	var _removeFrom = function(target, obj){
		if(target.indexOf(obj) > -1)
			target.splice(target.indexOf(obj), 1);
	}

	var _addEventListener = function(evt, func){ _gameObject.on(evt, { player: this}, func); }
	var _removeEventListener = function(evt, func){ _gameObject.off(evt, func); }
	var _dispatchEvent = function(evt, args){ _gameObject.trigger(evt, args); }

	function getColor() { return (175 + Math.floor(Math.random() * 80)); };
		
	var player = {
		id: _id,
		updateCardsPos: _updateCardsPos,
		gameObject: _gameObject,
		cards: _cards,
		addCard: _addCard,
		removeCard: _removeCard,
		dimensions: _dimensions,
		type: _type,
		ai: _ai,
		selectedCards: _selectedCards,
		
		doStepOne: _doStepOne,
		doStepTwo: _doStepTwo,
		doStepThree: _doStepThree,

		playCard: _playCard,
		discard: _discard,

		discardStepTwoCard: _discardStepTwoCard,
		discardStepThreeCard: _discardStepThreeCard,
		getCardsWithoutChicken: _getCardsWithoutChicken,
		getCardsOnlyChicken: _getCardsOnlyChicken,

		addEventListener: _addEventListener,
		removeEventListener: _removeEventListener,
		dispatchEvent: _dispatchEvent,

		rotation: _setRotation,
		openCards: _setOpenCards,
		showCards: _setShowCards,
		
		width: function(){ return _dimensions.width; },
		height: function(){ return _dimensions.height; },
		
		current: function(value) { console.log(); },
		actived: function(value){ 
			if(value != null)
				_actived = value;
			return _actived; 
		},
		isSelectCard: function(c){
			return _selectedCards.indexOf(c) > -1;
		},
		hasSelectCard: function(){
			return _selectedCards.length > 0;
		},
		selectCard: function(c){
			if(_selectedCards.indexOf(c) > -1) return;
			
			_selectedCards.push(c);
			_updateCardsPos(true);
		},
		deselectCard: function(c){
			_removeFrom(_selectedCards, c);
			_updateCardsPos(true);
		}
	}

	player.ai = _ai = new AIManager(player);

	return player;
};