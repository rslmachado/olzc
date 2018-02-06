var ScreenManager = (function(){ 
	var _onResizeFunctions = [];
	var _target;

	var init = function(options){
		_target = options.target;

		onResize(options.onResize);

		if(options.updateOnInit)
			options.onResize(offset(), center(), 0);
	}

	var center = function(){
		var position = _target.position();
		return {
				x: position.left + (_target.width() / 2),
				y: position.top + (_target.height() / 2)
			};
	};

	var offset = function(){
		return {
				width: _target.width(),
				height: _target.height()
			};
	};

	var doOnResize = function(){
		for(var f in _onResizeFunctions)
			_onResizeFunctions[f](offset(), center());
	};

	var onResize = function(func){
		if(func)
			_onResizeFunctions.push(func);
		else
			doOnResize();
	};

	var target = function(){
		return _target;
	};

	var orientation = function(){
		return _target.width() > _target.height() ? "landscape" : "portrait";
	};

	$(window).resize(doOnResize);

	return {
		center: center,
		offset: offset,
		onResize: onResize,
		init: init,
		target: target,
		orientation: orientation
	};
})();