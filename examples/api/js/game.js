//TODO: Incorporar metodo de carregar arquivos no Objeto da API
var gamePath = 'assets/';
function loadjscssfile(filename, filetype, withCredentials = true){
	var response;
	//TODO: Verificar forma alternativa para carregar arquivos de forma sincrona
	// Synchronous XMLHttpRequest on the main thread is deprecated
	$.ajax({
		type: "GET",
	    url: filename,
	    crossDomain: true,
	    xhrFields: { withCredentials: withCredentials },
	    async: false,
	    success: function(text) { response= text; }
	});
	
	if (filetype=="js") {
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.appendChild(document.createTextNode(response));
	} else if (filetype=="css") {
		var fileref=document.createElement("style");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.appendChild(document.createTextNode(response.replace(/url\("/g, "url(\"" + gamePath)));
	}

	$("head").prepend(fileref);
}

var tchabs = { game: {} };

tchabs.game.Olzt = function(_, options){
	if(!window.jQuery){
		alert("Necessário JQuery 1.7.0 ou superior");
		return;
	}

	var defaults = {
		players: 4
	};
	var _settings = $.extend({}, defaults, options);

	function random(max = 5){
		return Math.floor((Math.random() * max));
	}

	//loadjscssfile("http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js", "js", 'jQuery');

	loadjscssfile("https://fonts.googleapis.com/css?family=Almendra+SC", "css", false);
	loadjscssfile(gamePath + "olzc.css", "css");
	loadjscssfile(gamePath + "js/gsap-1.19.0/TweenMax.min.js", "js");

	loadjscssfile(gamePath + "game/Game.js", "js");
	loadjscssfile(gamePath + "game/screen/ScreenManager.js", "js");
	loadjscssfile(gamePath + "game/card/Card.js", "js");
	loadjscssfile(gamePath + "game/card/CardType.js", "js");
	loadjscssfile(gamePath + "game/card/CardManager.js", "js");

	loadjscssfile(gamePath + "game/player/Player.js", "js");
	loadjscssfile(gamePath + "game/player/PlayerEvent.js", "js");
	loadjscssfile(gamePath + "game/player/PlayersManager.js", "js");
	loadjscssfile(gamePath + "game/player/PlayerType.js", "js");

	loadjscssfile(gamePath + "game/AIManager.js", "js");
	loadjscssfile(gamePath + "game/action/ActionManager.js", "js");

	$_ = $(_);
	$stage = $("<div class=\"tgo-stage\"></div>");
	$_.css({ "position":"relative", "overflow":"hidden" });
	$_.append($stage);

	currentPage = '';

	
	ScreenManager.init({
		target: $stage,
		onResize: updateScreen,
		updateOnInit: true
	});


	function updateScreen(offset, center, timer = .5){
		var maxWidth  = 800;
		var maxHeight = 550;
		var width = $stage.width();
    	var height = $stage.height();

    	var scale = Math.min(width/maxWidth, height/maxHeight);

		Game.scale = Math.min(scale, 1);
	}

	var tl_menu = new TimelineLite({
		paused: true,
		onStart:function() {
			$menu = $("<div class=\"tgo-game-menu\"> \
				</div>");

			$chicken = $("<div class=\"chicken\"> \
								<div class=\"perna\"></div> \
								<div class=\"asa esq\"></div> \
								<div class=\"asa dir\"></div>\
								<div class=\"corpo\"></div>\
								<div class=\"lingua\"></div>\
								<div class=\"bico_alto\"></div>\
								<div class=\"bico_baixo\"></div>\
								<div class=\"cabeca\"></div>\
							</div> \
							");

			$buttons = $("<div class=\"buttons\"> \
							<button class=\"play\">Jogar</button> \
						</div>");
			//<button class=\"rules\">Regras</button> \

			$menu.append($chicken);
			$menu.append($buttons);
			$stage.append($menu);

			//TweenLite.set($chicken, { css:{opacity: 0, scale: Game.scale, width:($chicken.width() * Game.scale), height:($chicken.height() * Game.scale) } });
			var wide = ScreenManager.orientation() == "landscape";

			TweenLite.set($chicken, { css:{opacity: 0, margin:((wide ? 15 : 60) * Game.scale) + "% 50% 0",transform:"matrix(" + Game.scale + ", 0, 0, " + Game.scale + ", -" + ($chicken.width() * Game.scale /2) + ", 0)" } });
			//(Game.scale-.25) + "%"
			console.log(ScreenManager.orientation());



			TweenLite.set($buttons, { css:{opacity: 0, marginTop:"-" + ((wide ? 1.07 : 1.33) - Game.scale)/2*100 + "%"} });

			$menu.on("click", '.play', function(){ goto('game'); });
			$menu.on("click", '.rules', function(){ goto('rules'); });
		},
		onComplete:function() {
			var tl = new TimelineLite({
				//delay: random(2),
				onComplete:function() {
					tl.delay(random(4));
					tl.restart(true);
				},
				onReverseComplete:function(){
					
				}
			});

			var tl_asas = new TimelineLite({
				//delay: random(2),
				onComplete:function() {
					tl_asas.delay(random(4));
					tl_asas.restart(true);
				}
			});

			tl_asas
			.add([
				TweenLite.to($chicken.find(".asa.dir"), .2, { transform: "rotateZ(-25deg)" }),
				TweenLite.to($chicken.find(".asa.esq"), .2, { transform: "rotateZ(25deg)" })
			])
			.add([
				TweenLite.to($chicken.find(".asa.dir"), .2, { transform: "rotateZ(60deg)" }),
				TweenLite.to($chicken.find(".asa.esq"), .2, { transform: "rotateZ(-60deg)" })
			])
			.add([
				TweenLite.to($chicken.find(".asa.dir"), .2, { transform: "rotateZ(-25deg)" }),
				TweenLite.to($chicken.find(".asa.esq"), .2, { transform: "rotateZ(25deg)" })
			])
			.add([
				TweenLite.to($chicken.find(".asa.dir"), .2, { transform: "rotateZ(60deg)" }),
				TweenLite.to($chicken.find(".asa.esq"), .2, { transform: "rotateZ(-60deg)" })
			])
			.add([
				TweenLite.to($chicken.find(".asa.dir"), .2, { transform: "rotateZ(0deg)" }),
				TweenLite.to($chicken.find(".asa.esq"), .2, { transform: "rotateZ(0deg)" })
			]);

			tl.add(function(){
				TweenLite.to($chicken.find(".bico_alto"), .5, { transform: "rotateZ(-25deg)" });
				TweenLite.to($chicken.find(".bico_baixo"), .5, { transform: "rotateZ(25deg)" });
			}, "+=0")
			.add(function(){
				TweenLite.to($chicken.find(".bico_alto"), .5, { transform: "rotateZ(0deg)" });
				TweenLite.to($chicken.find(".bico_baixo"), .5, { transform: "rotateZ(0deg)" });
				TweenLite.to($chicken.find(".lingua"), .5, { left: 123, top: 32 });
			}, "+=.5")
			.add(function(){
				TweenLite.to($chicken.find(".lingua"), .5, { left: 162, top: 16 });
			}, "+=.5")
			.add(function(){
				if(Math.random() > .5){
					TweenLite.to($chicken.find(".bico_alto"), .5, { transform: "rotateZ(-25deg)" });
					TweenLite.to($chicken.find(".bico_baixo"), .5, { transform: "rotateZ(25deg)" });

					tl.pause();
					tl.delay(random(4));
					tl.restart(true);
				}
			}, "+=.2")
			.add(function(){
				TweenLite.to($chicken.find(".lingua"), .3, { left: 123, top: 32 });
			}, "+=.3")
			.add(function(){
				TweenLite.to($chicken.find(".lingua"), .3, { left: 162, top: 16 });
			}, "+=.3")
			.add(function(){
				TweenLite.to($chicken.find(".bico_alto"), .3, { transform: "rotateZ(-25deg)" });
				TweenLite.to($chicken.find(".bico_baixo"), .3, { transform: "rotateZ(25deg)" });
			}, "+=.2");

			$(window).focus(function() {
			    tl.play();
			    tl_asas.play();
			}).blur(function() {
			    tl.pause();
			    tl_asas.pause();
			});
		}
	})
	.add( function(){ 
		TweenLite.to($chicken, 2, { css:{opacity: 1} });
	})
	.add( function(){
		TweenLite.to($buttons, 2, { css:{opacity: 1} });
			/*
			TweenLite.set($buttons, { css:{opacity: 1} });
			var time = 0;
			$buttons.find("button").each(function(){
				setTimeout( function(target){ TweenLite.to(target, .5, { width: "100%" }); }, time, $(this));
				time += 150;
			});*/
		}, "+=1" );


	var tl_game = new TimelineLite({
		paused: true,
		onStart:function() {
			$game = $("<div class=\"tgo-game-game\"> \
							<div class=\"board\"> \
								<div class=\"deck\"></div> \
								<div class=\"discard\"></div> \
							</div> \
					</div>");

			TweenLite.set($game, { css:{opacity: 0} });
			$stage.append($game);
			var g = new Game(_settings.players, $game);
			//TweenLite.to($game, 1, { css:{opacity: 1} });
			TweenLite.to($game, 1, { css:{opacity: 1}, onComplete:g.setup });
		},
		onComplete:function() {
			
		}
	});


	function goto(page){
		if(currentPage)
			$('.tgo-game-' + currentPage).animate({ opacity: 0 }, function(){ $(this).remove(); });


		if(page == 'menu')
			tl = tl_menu;
		else if(page == 'game')
			tl = tl_game;
		
		tl.delay(currentPage ? .5 : 0);
		tl.play();

		currentPage = page;
	}

	goto("menu");

	/*
	var tl_intro = new TimelineLite({
		onComplete:function() {
			
		}
	}).add(
		[TweenLite.to($chicken, 2, { y: ($stage.height() - $chicken.height()) })]
	);
	*/
	

	//tl_intro.play();

	//console.log($chicken.height());
	//$chicken.hide();
};