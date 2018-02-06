var Card = function(type, value){
	var _images = ["back", "vizinha", "agiota", "necro", "food", "pregador", "chicken"];
	var _type = CardType[type];
	var _value = value;
	var _rotation = 0;
	var _gameObject = $("<div class=\"cardWrapper\"> \
							<div class=\"card\" style=\"transform: rotateY(180deg);\" > \
								<div class=\"" + _images[_type] + " front cardFace\"><h1>" + (_type == CardType.CHICKEN ? value : "") + "</h1></div> \
	    						<div class=\"back cardFace\"></div> \
							</div> \
						</div>");

	var _dimensions = {
					height: _gameObject.height(), 
					width: _gameObject.width(),
					cX: 0,
					cY: 0
					};

	TweenLite.set(_gameObject, {scale: Game.scale });

	var _show = function(animated = true){ _flip(1, animated); }
	var _hide = function(animated = true){ _flip(0, animated); }
	var _flip = function(direction = 1, animated = true){ TweenLite.to(_gameObject.find(".card"), (animated ? .5 : 0), {rotationY:(direction == 1 ? 0 : 180), ease:Back.easeOut });	}

	var _setRotation = function(rotation, render = true){
		if(rotation != null){
			if(render)
				TweenLite.set(_gameObject, {rotation: (_rotation = rotation) });

			var rad = _rotation * Math.PI / 180,
			    sin = Math.sin(rad),
			    cos = Math.cos(rad);

			_dimensions.width = Math.round(Math.abs(_gameObject.width() * cos) + Math.abs(_gameObject.height() * sin));
			_dimensions.height = Math.round(Math.abs(_gameObject.width() * sin) + Math.abs(_gameObject.height() * cos));
			_dimensions.cY = Math.round(_gameObject.height() - _dimensions.height);
			_dimensions.cX = Math.round(_gameObject.width() - _dimensions.width);
		}

		return _rotation;
	};

	var _addEventListener = function(evt, func, args = {}){ args.card = this; _gameObject.on(evt, args, func); }
	var _removeEventListener = function(evt, func){ _gameObject.off(evt, func); }
	var _dispatchEvent = function(evt, args){ _gameObject.trigger(evt, args); }

	var card = {
		type: _type,
		value: _value,
		rotation: _setRotation,
		gameObject: _gameObject,
		show: _show,
		hide: _hide,
		dimensions: _dimensions,
		addEventListener: _addEventListener,
		removeEventListener: _removeEventListener,
		dispatchEvent: _dispatchEvent
	};

	_gameObject.data('card', card);

	return card;
};