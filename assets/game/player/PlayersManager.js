var PlayersManager = (function(){
	var _players = [];
	var _index = 0;
	var _target;
	var _templates = {
		3:[
			function(obj){ 
				obj.rotation(0);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.offset().height - obj.height() - obj.dimensions.cY) +"px", left: (ScreenManager.center().x - obj.width()/2 - obj.dimensions.cX) +"px"});},
			function(obj){ 
				obj.rotation(90);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.center().y - obj.height()/2 - obj.dimensions.cY)+"px", left: (-obj.dimensions.cX)+"px"});},
			function(obj){ 
				obj.rotation(-90);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.center().y - obj.height()/2 - obj.dimensions.cY) +"px", left: (ScreenManager.offset().width - obj.width() - obj.dimensions.cX) + "px"});}
		],
		4:[
			function(obj){ 
				obj.rotation(0);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.offset().height - obj.height() - obj.dimensions.cY) +"px", left: (ScreenManager.center().x - obj.width()/2 - obj.dimensions.cX) +"px"});},
			function(obj){ 
				obj.rotation(90);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.center().y - obj.height()/2 - obj.dimensions.cY)+"px", left: (-obj.dimensions.cX)+"px"});},
			function(obj){ 
				obj.rotation(180);
				TweenLite.set(obj.gameObject, {top: (-obj.dimensions.cY) +"px", left: (ScreenManager.center().x - obj.width()/2 - obj.dimensions.cX) + "px"});},
			function(obj){ 
				obj.rotation(-90);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.center().y - obj.height()/2 - obj.dimensions.cY) +"px", left: (ScreenManager.offset().width - obj.width() - obj.dimensions.cX) + "px"});}
		],
		5:[
			function(obj){ 
				obj.rotation(0);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.offset().height - obj.height() - obj.dimensions.cY) +"px", left: (ScreenManager.center().x - obj.width()/2 - obj.dimensions.cX) +"px"});},
			function(obj){ 
				obj.rotation(90);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.center().y - obj.height()/2 - obj.dimensions.cY)+"px", left: (-obj.dimensions.cX)+"px"});},
			function(obj){ 
				obj.rotation(180);
				TweenLite.set(obj.gameObject, {top: (-obj.dimensions.cY) +"px", left: (ScreenManager.center().x - obj.width()/2)/2 - obj.dimensions.cX + "px"});},
			function(obj){ 
				obj.rotation(180);
				TweenLite.set(obj.gameObject, {top: (-obj.dimensions.cY) +"px", left: (ScreenManager.center().x - obj.width()/2)/2*3 - obj.dimensions.cX + "px"});},
			function(obj){ 
				obj.rotation(-90);
				TweenLite.set(obj.gameObject, {top: (ScreenManager.center().y - obj.height()/2 - obj.dimensions.cY) +"px", left: (ScreenManager.offset().width - obj.width() - obj.dimensions.cX) + "px"});}

		]
	};

	var _init = function(options){
		_target = options.target;
	}

	var _allocatePlayers = function() {
		var tpl = _templates[Math.max(_players.length, 3)];
		for (var i = 0; i < _players.length; i++) {
			tpl[i](_players[i]);			
			_players[i].updateCardsPos(true);
		}
	}

	var _addPlayer = function(type) {
		var p = new Player("p" + _players.length, type);
		_players.push(p);

		p.current(p.actived(false));
		_target.append(p.gameObject);
		_allocatePlayers();
		return p;
	}


	var _setIndex = function(index) {
		if(index != null)
			(p = _players[_index = index]).current(p.actived(true));

		return _players[_index];
	}

	var _next = function() {
		(p = _players[_index]).current(p.actived(false));
		_index = ++_index % _players.length;
		(p = _players[_index]).current(p.actived(true));
		return p;
	}

	var _nextPlayerOf = function(p) {
		return _players[(_players.indexOf(p) + 1) % _players.length];
	}
		
	var _previousPlayerOf = function(p) {
		var pos = _players.indexOf(p) - 1;
		return _players[pos < 0 ? _players.length - 1 : pos];
	}

	return {
		init: _init,
		index: _setIndex,
		addPlayer: _addPlayer,
		players: _players,
		next: _next,
		allocatePlayers: _allocatePlayers,
		currentPlayer: function(){ return _players[_index]; },
		numPlayers: function(){ return _players.length; },
		nextPlayer: function() { return _nextPlayerOf(_players[_index]); },
		previousPlayer: function() { return _previousPlayerOf(_players[_index]); },
		nextPlayerOf: _nextPlayerOf,
		previousPlayerOf: _previousPlayerOf
	}
})();