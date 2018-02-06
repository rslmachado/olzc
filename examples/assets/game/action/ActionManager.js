var ActionManager = (function(){
	var _players = [];
	var _playersReady = [];

	//======= FoodTruck
	var actionFoodTruck = function(){
		//console.log("=== actionFoodTruck");
		var p = PlayersManager.currentPlayer();
		PlayersManager.next();
		p.ai.addAction(p.ai.done);
	}

	//======= Neighbor
	var actionNeighbor = function(){
		//console.log("=== actionNeighbor");
		var p = PlayersManager.currentPlayer();
		_players = [p];
		_playersReady = [];
		
		p.addEventListener(PlayerEvent.READY, _onPlayersReady);
		if(p.type == PlayerType.PLAYER){
			for(var i = 0, pp = [PlayersManager.nextPlayer(), PlayersManager.previousPlayer()], j = pp.length; i < j; i++){
				pp[i].ai.wait(500, 50);
				pp[i].ai.addAction(pp[i].ai.showCards);
			}
			
			p.ai.addAction(function(){ $('body').one("click", actionNeighborComplete); });
		}else
			p.ai.neighbor();
	}

	var actionNeighborComplete = function(evt){
		var p = PlayersManager.currentPlayer();
		
		for(var i = 0, pp = [PlayersManager.nextPlayer(), PlayersManager.previousPlayer()], j = pp.length; i < j; i++){
			pp[i].ai.wait(1000);
			pp[i].ai.addAction(pp[i].ai.hideCards);
		}

		p.ai.addAction(p.ai.ready);
	}

	//======= Necromancer
	var actionNecromancer = function(){
		//console.log("=== actionNecromancer");
		_players = PlayersManager.players;
		_playersReady = [];
		
		for(var i = 0, j = _players.length, pp = _players[i]; i < j; pp = _players[++i]){
			pp.addEventListener(PlayerEvent.READY, necromancerReady);	
			if(pp.type == PlayerType.PLAYER){
				pp.actived(true);
				for(var cc = pp.cards, ic = 0, jc = cc.length, c = cc[ic]; ic < jc; c = cc[++ic])
					c.addEventListener("click", actionNecromancerEvent, {player: pp});
			}else
				pp.ai.addAction(pp.ai.necromancer);
		}
	}
		
	var actionNecromancerEvent = function(evt){
		var c = evt.data.card;
		var p = evt.data.player;

		if(p.openCards()){
			if(p.isSelectCard(c))
				p.deselectCard(c);
			else
				p.selectCard(c);
			
			_addPlayerReady(p, p.selectedCards.length == 2);
			
			if(p.selectedCards.length == 2)
				p.ai.ready();
		}else
			p.openCards(true);
	}
		
	var necromancerReady = function(evt){
		var p = evt.data.player;
		_addPlayerReady(p);

		if(isAllPlayerReady()){
			_playersReady = [];

			for(var ppp = PlayersManager.players, i = 0, j = ppp.length, pp = ppp[i]; i < j; pp = ppp[++i]){
				pp.actived(false);
				pp.removeEventListener(PlayerEvent.READY, necromancerReady);
				for(var cc = pp.cards, ic = 0, jc = cc.length, c = cc[ic]; ic < jc; c = cc[++ic])
					c.removeEventListener("click", actionNecromancerEvent);

				pp.addEventListener(PlayerEvent.READY, _onPlayersReady);
				pp.ai.addAction(pp.ai.passSelectedCardTo, 1000, 500, [PlayersManager.nextPlayerOf(pp)]);
				pp.ai.addAction(pp.ai.ready);
			}
		}
	}

	//======= Loanshark
	var actionLoanshark = function(){
		//console.log("=== actionLoanshark");
		var p = PlayersManager.currentPlayer();

		p.addEventListener(PlayerEvent.READY, _onPlayersReady);
		_players = [p];
		_playersReady = [];
					
		if(p.type == PlayerType.PLAYER){
			for(var ppp = PlayersManager.players, i = 0, j = ppp.length, pp = ppp[i]; i < j; pp = ppp[++i])
				for(var cc = pp.cards, ic = 0, jc = cc.length, c = cc[ic]; ic < jc; c = cc[++ic])
					c.addEventListener("click", selectLoansharkEvent, { player: pp });
		}else
			p.ai.loanshark();
	}
					
	var _getSelectedLoansharkPlayer = function(){
		var p = PlayersManager.currentPlayer();
		for(var ppp = PlayersManager.players, i = 0, j = ppp.length, pp = ppp[i]; i < j; pp = ppp[++i])
			if(pp != p && pp.selectedCards.length > 0)
				return pp;
		
		return null;
	}
					
	var selectLoansharkEvent = function(evt) {
		var c = evt.data.card;
		var tp = evt.data.player;
		var p = PlayersManager.currentPlayer();
		
		//Fecha cartas dos players não selecionados
		if(tp != p)
			for(var ppp = PlayersManager.players, i = 0, j = ppp.length, pp = ppp[i]; i < j; pp = ppp[++i])
				if(pp != p && pp != tp)
					pp.openCards(false);
		
		if(tp.openCards()){
			var p_tmp = _getSelectedLoansharkPlayer();
			var c_tmp = null;
			
			if(p == tp){
				if(p.hasSelectCard())
					p.deselectCard(c_tmp = p.selectedCards[0]);
					
				if(c != c_tmp)
					p.selectCard(c);
						
				if(p_tmp && p_tmp.hasSelectCard()){
					for(var ppp = PlayersManager.players, i = 0, j = ppp.length, pp = ppp[i]; i < j; pp = ppp[++i])
						for(var cc = pp.cards, ic = 0, jc = cc.length, c = cc[ic]; ic < jc; c = cc[++ic])
							c.removeEventListener("click", selectLoansharkEvent);

					p.ai.addAction(function(p_from, p_to){ 
										p_from.ai.passSelectedCardTo(p_to);
										p_to.ai.passSelectedCardTo(p_from);
										p_to.openCards(false);
									}, 1500, 500, [p, p_tmp]);
					p.ai.addAction(p.ai.ready);
				}
			}else{
				//descelecionar caso mude de player
				if(p_tmp && p_tmp != tp)
					p_tmp.deselectCard(p_tmp.selectedCards[0]);
				
				if(tp.hasSelectCard())
					tp.deselectCard(c_tmp = tp.selectedCards[0]);
				
				if(c != c_tmp)
					tp.selectCard(c);
						
				if(p.hasSelectCard()){
					for(var ppp = PlayersManager.players, i = 0, j = ppp.length, pp = ppp[i]; i < j; pp = ppp[++i])
						for(var cc = pp.cards, ic = 0, jc = cc.length, c = cc[ic]; ic < jc; c = cc[++ic])
							c.removeEventListener("click", selectLoansharkEvent);
					
					p.ai.addAction(function(p_from, p_to){ 
										p_from.ai.passSelectedCardTo(p_to);
										p_to.ai.passSelectedCardTo(p_from);
										p_to.openCards(false);
									}, 1500, 500, [p, tp]);
					p.ai.addAction(p.ai.ready);
				}
			}
		}else
			tp.openCards(true);
	}

	//======= Preacher
	var actionPreacher = function(){
		//console.log("=== actionPreacher");
		var p = PlayersManager.currentPlayer();
		
		_players = PlayersManager.players.slice();
		//remove o player atual da lista
		_players.splice(_players.indexOf(p), 1);

		_playersReady = [];
		
		for(var i = 0, j = _players.length, pp = _players[i]; i < j; pp = _players[++i]){
			pp.addEventListener(PlayerEvent.READY, _onPlayersReady);

			if(pp.type == PlayerType.PLAYER){
				var cards = pp.getCardsWithoutChicken();

				if(cards.length == 0){
					pp.ai.addAction(pp.ai.showCards);
					pp.ai.addAction(pp.ai.ready);
				}else{
					pp.actived(true);
					for(var ic = 0, jc = cards.length, c = cards[ic]; ic < jc; c = cards[++ic])
						c.addEventListener("click", actionPreacherEvent, { player: pp });
				}
			}else{
				pp.ai.preacher();
			}
		}
	}
				
	var actionPreacherEvent = function(evt){
		var c = evt.data.card;
		var p = evt.data.player;
					
		if(p.openCards()){
			p.actived(false);
			for(var ccc = p.cards, ic = 0, jc = ccc.length, cc = ccc[ic]; ic < jc; cc = ccc[++ic])
				cc.removeEventListener("click", actionPreacherEvent);

			p.ai.wait(100, 50);
			p.ai.addAction(p.discard, 1000, 500, [c]);
			p.ai.addAction(p.ai.draw, 700, 300);
			p.ai.addAction(p.ai.ready);
		}else
			p.openCards(true);
	}
	
	var doAction = function(action){
		setTimeout(function(){
			if(action == CardType.FOODTRUCK)
				actionFoodTruck();
			else if(action == CardType.NEIGHBOR)
				actionNeighbor();
			else if(action == CardType.PREACHER)
				actionPreacher();
			else if(action == CardType.NECROMANCER)
				actionNecromancer();
			else if(action == CardType.LOANSHARK)
				actionLoanshark();
		}, 600);
	}

	var _onPlayersReady = function(evt){
		var p = evt.data.player;
		_addPlayerReady(p);
		
		if(isAllPlayerReady()){
			_playersReady = [];
			for(var ppp = PlayersManager.players, i = 0, j = ppp.length, pp = ppp[i]; i < j; pp = ppp[++i])
				pp.removeEventListener(PlayerEvent.READY, _onPlayersReady);
			
			(p = PlayersManager.currentPlayer()).ai.addAction(p.ai.done);
		}
	}

	var _addPlayerReady = function(p, ready = true){
		if(ready && _playersReady.indexOf(p) == -1)
			_playersReady.push(p);
		else if(!ready && _playersReady.indexOf(p) > -1)
			_playersReady.splice(_playersReady.indexOf(p), 1);
	}

	var isAllPlayerReady = function(){
		return _playersReady.length == _players.length;
	}

	return {
		doAction: doAction,
	}
})();