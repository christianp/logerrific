function sortProp(prop) {
	return function(a,b) {
		if(a[prop] > b[prop])
			return 1;
		else if(b[prop] > a[prop])
			return -1;
		else
			return 0;
	}
}

function filterProp(prop,val) {
	return function(e) {
		var p = e[prop];
		if(val.constructor==RegExp)	//if filtering with a regexp, do that
			return val.test(p);
		else						//otherwise, just check if equal
			return p==val;
	}
}

Array.prototype.groupBy = function(prop) {
	var groups = {};
	for(var i=0;i<this.length;i++) {
		var val = this[i][prop];
		(groups[val] = groups[val] || []).push(this[i]);
	}
	var out = [];
	for(var x in groups) {
		out.push({prop: groups[x][0][prop], items: groups[x], length: groups[x].length});
	}

	return out;
}

var vm;
var re_log = /^(.*?) .*? (.*?) \[(.*?)\] "(.*?)" (.*?) (.*?)(?: ".*?")?(?: "(.*?)")?$/;
var re_date = /^(\d\d)\/([A-Z][a-z]+)\/(\d{4}):(\d\d):(\d\d):(\d\d) (.*)$/;

$(function() {

	function loadFile(file) {
		if(!file) { return; }
		var fr = new FileReader();
		fr.onload = function(e) {
			var content = e.target.result;
			var logs = content.split('\n');
			vm.logs(logs.map(parseLog).filter(function(e){return e}));
		}
		fr.readAsText(file);
	}

	function parseLog(log) {
		var m = log.match(re_log);
		if(!m) return;
		return new Log(m[1],m[2],m[3],m[4],m[5],m[6],m[7]);
	}

    $.event.props.push('dataTransfer');
    $('#filedrop').on({
        dragenter: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).addClass('over')
        },
        dragover: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(this).addClass('over')
        },
        dragleave: function(e) {
            $(this).removeClass('over');
        },
        drop: function(e) {
            $(this).removeClass('over');
            loadFile(e.dataTransfer.files[0]);
            e.stopPropagation();
            e.preventDefault();
        }
    })

	function ViewModel() {
		this.logs = ko.observableArray([]);
		this.numLogs = ko.computed(function(){ return this.logs().length; },this);
		this.topPages= ko.computed(function() {
			return this.logs()
				.filter(filterProp('url',/\/$/))
				.groupBy('url')
				.sort(sortProp('length'),true)
				.slice(-10)
				.reverse()
			;
		},this);
	}

	function Log(ip,userid,date,request,code,size,agent) {
		this.ip = ip;
		this.userid = userid;
		this.date = date;
		var mdate = date.match(re_date);
		if(mdate)
		{
			this.day = mdate[1];
			this.month = mdate[2];
			this.year = mdate[3];
			this.hour = mdate[4];
			this.minute = mdate[5];
			this.second = mdate[6];
			this.offset = mdate[7];
		}

		this.request = request;
		var rbits = request.split(' ');
		this.method = rbits[0];
		this.url = rbits[1];
		this.httpVersion = rbits[2];
		this.code = code;
		this.size = size;
		this.agent = agent;
	}

	vm = new ViewModel();
	ko.applyBindings(vm);
});
