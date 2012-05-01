var vm;
var re_log = /^(.*?) .*? (.*?) \[(.*?)\] "(.*?)" (.*?) (.*?)(?: ".*?")?(?: "(.*?)")?$/;
$(function() {

	function loadFile(file) {
		if(!file) { return; }
		var fr = new FileReader();
		fr.onload = function(e) {
			var content = e.target.result;
			var logs = content.split('\n');
			var n = Math.floor(Math.random()*(logs.length-100));
			vm.logs([]);
			logs.slice(n,n+100).map(parseLog);
			console.log('read',n);
		}
		fr.readAsText(file);
	}

	function parseLog(log) {
		var m = log.match(re_log);
		vm.logs.push(new Log(m[1],m[2],m[3],m[4],m[5],m[6],m[7]));
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
			console.log('drop',e.dataTransfer.files);
            loadFile(e.dataTransfer.files[0]);
            e.stopPropagation();
            e.preventDefault();
        }
    })

	vm = {
		logs: ko.observableArray([])
	};

	function Log(ip,userid,date,request,code,size,agent) {
		this.ip = ip;
		this.userid = userid;
		this.date = date;
		this.request = request;
		this.code = code;
		this.size = size;
		this.agent = agent;
	}

	ko.applyBindings(vm);
});
