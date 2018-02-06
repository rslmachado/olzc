var CardManager = (function(){
	var index = -1;
	var deck = [];
	var deckDiscard = [];
	var _basedeck = [];
	var _target;
	var _targetDiscard;
	var _board;

	var init = function(obj) {
		_target = obj.deck;
		_targetDiscard = obj.discard;
		_board = obj.board;

	    for(var t in CardType) {
			var qtd = (CardType[t] == CardType.NECROMANCER) ? 5 : 9;
			for (var i = 1; i <= qtd; i++)
				_basedeck.push(new Card(t, i));
		}
		index = _basedeck.length - 1;

		prepareDeck();
	};
	var prepareDeck = function(qtdPlayers) {
		var count, i_tmp;
		var qtd = 6;
		index = _basedeck.length - 1;
		deck = _basedeck.slice(0);
		shuffle(deck);
		
		for(var i=0; i<qtdPlayers; i++) {
			count = 0;
			for (var j=0; j<qtd; j++) {
				i_tmp = (i * qtd);
				if (deck[index - (i_tmp + j)].type == CardType.CHICKEN && ++count == 3) {
					j = count = 0;
					shuffle(deck, i_tmp, deck.length - i_tmp);
				}
			}
		}
		updateCardsPos();

		TweenLite.set(".cardWrapper", {perspective:800});
		TweenLite.set(".card", {transformStyle:"preserve-3d"});
		TweenLite.set(".back", {rotationY:-180});
		TweenLite.set([".back", ".front"], {backfaceVisibility:"hidden"});
	};

	function updateCardsPos(timer = 0){
		for (var i = 0; i < deck.length; i++) {
			_board.append(deck[i].gameObject);
			TweenLite.to(deck[i].gameObject, timer, {rotation:0, top: (_target.position().top - i/3) +"px", left: (_target.position().left + i/4) +"px"});
		}

		for (var i = 0; i < deckDiscard.length; i++) {
			_board.append(deckDiscard[i].gameObject);
			TweenLite.to(deckDiscard[i].gameObject, timer, {top: (_targetDiscard.position().top - i/2) +"px", left: (_targetDiscard.position().left + i/3) +"px"});
		}
	}

	var draw = function() {
		index--;
		return deck.pop();
	}

	var discard = function(card) {
		deckDiscard.push(card);
		card.show();
		_board.append(card.gameObject);
		TweenLite.to(card.gameObject, 1, {rotation: Math.random() * 180, top: (_targetDiscard.position().top - deckDiscard.length/2) +"px", left: (_targetDiscard.position().left + deckDiscard.length/3) +"px"});

		if(deckDiscard.length > 6)
			TweenLite.to(deckDiscard[deckDiscard.length-7].gameObject, 5, { alpha: 0 });
	}

	var shuffle = function(array, start = 0, length = array.length) {
		var temporaryValue, randomIndex, currentIndex = length;
		while (0 !== currentIndex) {
			randomIndex = start + Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[start + currentIndex];
			array[start + currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	return {
		index: index,
		init: init,
		prepareDeck: prepareDeck,
		draw: draw,
		discard: discard,
		updateCardsPos: updateCardsPos,
		deckIsEmpty: function(){ return deck.length == 0; }
	};
})();