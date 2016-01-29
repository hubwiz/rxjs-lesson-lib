//DOM implementation
var TimelineDOM = (function(){
  var Timeline = function(id){
	this._id = id;
    var el =  this._root = document.createElement("div");
	el.classList.add("timeline");
	el.setAttribute("id",id);
	var label = document.createElement("div");
	label.classList.add("label");
	label.innerHTML = id;
	el.appendChild(label);
	var host = this._host = document.createElement("div");
	host.classList.add("host");
	//host.innerHTML = "&nbsp;";
	el.appendChild(host);
	document.body.appendChild(el);
  };
  Timeline.prototype.next = function(data){
    var el = document.createElement("span");
	el.classList.add("emit");
	el.textContent = data;
	this._host.appendChild(el);        	
	//make it visible
	while(true){
		var right = el.offsetLeft + el.offsetWidth;
		var rightLimit = this._root.offsetWidth;
		//console.log([right,rightLimit]);
		if(right > rightLimit && this._host.childNodes.length > 1) 
			this._host.childNodes[0].remove();
		else break;
	}
  };
  Timeline.prototype.completed = function(){
    var el = document.createElement("span");
	el.classList.add("completed");
	this._host.appendChild(el);
  };
  Timeline.prototype.error = function(err){
    var el = document.createElement("span");
	el.classList.add("error");
	this._host.appendChild(el);
  };
  return Timeline;
})();
//canvas implementation
var TimelineCanvas = (function(){
  var Timeline = function(id){
    this._id = id;
    this._width = document.body.offsetWidth;
    this._height = 34;
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id",id);
    canvas.setAttribute("width",this._width);
    canvas.setAttribute("height",this._height);
    document.body.appendChild(canvas);
    this._ctx = canvas.getContext("2d");
    this._data = [];
    this.startLoop();
  };
  Timeline.prototype.next = function(data){
    this._data.push({
      tick : Date.now(),
      value: data,
    });
    if(this._data.length > 20) this._data.shift();
    return this;
  };
  Timeline.prototype.completed = function(){
    this.stopLoop();
    this._end = true;
    this.render();
  };
  Timeline.prototype.error = function(e){
    this.stopLoop();
    this._error = true;
    this.render();
  }
  Timeline.prototype.render = function(){
    var self = this;
    var base = Date.now();
    this._ctx.fillStyle="black";
    if(this._error) this._ctx.fillStyle="red";
    if(this._end) this._ctx.fillStyle="green";
    this._ctx.fillRect(0,0,this._width,this._height);
    this._ctx.font = "20px Verdana";
    this._ctx.textAlign = "start";
    this._ctx.fillStyle = "#777";
    this._ctx.fillText(this._id,10,20);
    for(var i=this._data.length-1;i>=0;i--){
      var d = this._data[i];
      var x = (base - d.tick)*50/1000 + 10;
      x = this._width - x;
      var y = 10;
      with(self._ctx){
        beginPath();
        arc(x,y,5,0,2*Math.PI);fillStyle="white";fill();
        font = "12px Consolas";textAlign="end"; fillText(d.value,x,y+20);
      }
    }
  };
  Timeline.prototype.startLoop = function(){
    var self = this;
    this._timer = setInterval(function(){
        self.render();
    },20);
  };
  Timeline.prototype.stopLoop = function(){
    clearInterval(this._timer);
  };
  return Timeline;
})();