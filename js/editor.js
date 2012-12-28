$(function() {
	var busy = false;
	var buffer = {};
	var line = undefined;
	function setup_ui() {
		$('#editor').height($(window).height() - $('#menu').outerHeight());
	}
	function load_files() {
		$.getJSON('files.php', function(data) {
			if (data.status) {
				var menu = $('#menu ul');
				$.each(data.files, function(k, v) {
					menu.append('<li id="'+v+'"><i class="icon-file"></i> '+v+'.php <i class="icon-remove"></i></li>');
				});
				var hash = window.History.getHash();
				if (hash == '')
					load_content(data.files[0]);
				else
					load_content(hash);
				setup_ui();
			} else
				alert('failed to fetch files');
		});
	}
	function update_ui(page, content) {
		$('#menu ul li').each(function(idx) {
			if ($(this).attr('id') == page)
				$(this).addClass('menu-active');
			else
				$(this).removeClass('menu-active');
		});
		$('#editor .line').remove();
		var target = $('#editor');
		$.each(content, function(k, v) {
			target.append('<div class="line" contenteditable="false"><p class="line-num pull-left" contenteditable="false">'+(k + 1)+'</p><p class="line-code" contenteditable="true">'+v+'</p></div>');
		});
		document.designMode = 'on';
		document.title = page+'.php (~/Public) - flavioheleno.me';
	}
	function load_content(page) {
		if (busy)
			return;
		if (window.History.getHash() != page)
			window.History.pushState({tab: page}, page, '#'+page);
		if (buffer[page])
			update_ui(page, buffer[page]);
		else
			busy = true;
			$.getJSON('content.php?'+page, function(data) {
				if (data.status) {
					var code = syntax_hilight(data.content);
					update_ui(page, code);
					buffer[page] = code;
				} else
					alert('failed to fetch content');
				busy = false;
			});
	}
	function syntax_hilight(content) {
		var keywords = /(&lt;\?php|function|return|if|else|exit|\(|\)|;|:|,|\.|=|&lt;|&gt;)/gi;
		var reserved = /(array)/gi;
		var special = /(Flavio Heleno)/gi;
		var numbers = /\b([0-9]+)\b/gi;
		var strings = /('[^']+')/gi;
		var booleans = /(true|false)/gi;
		var comments = /(\/\*.*?\*\/)/gi;
		var result = [];
		$.each(content, function(k, v) {
			str = new String(v);
			if (str.length == 0)
				result.push('&nbsp;');
			else {
				str = str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				if (str.match(comments))
					str = str.replace(comments, '<span class="syntax-comment">$1</span>');
				else {
					str = str.replace(keywords, '<span class="syntax-keyword">$1</span>');
					str = str.replace(reserved, '<span class="syntax-reserved">$1</span>');
					str = str.replace(special, '<span class="syntax-special">$1</span>');
					str = str.replace(numbers, '<span class="syntax-number">$1</span>');
					str = str.replace(strings, '<span class="syntax-string">$1</span>');
					str = str.replace(booleans, '<span class="syntax-boolean">$1</span>');
				}
				str = str.replace(/  /g, '&nbsp;&nbsp;');
				result.push(str.replace(/\t/g, '&nbsp;&nbsp;'));
			}
		});
		return result;
	}
	function update_numbers() {
		var n = 1;
		$('.line-num').each(function() {
			$(this).html(n);
			n++;
		});
	}
	$(window).resize(function() {
		setup_ui();
	});
    window.History.Adapter.bind(window, 'anchorchange', function(){
    	load_content(window.History.getHash());
    });
	$('#menu ul').on('click', function(e) {
		load_content(e.target.id);
	});
	$('#editor').on('focusin', '.line-code', function(e) {
		if (line)
			$(line).removeClass('line-highlight');
		line = this;
		$(this).addClass('line-highlight');
	});
	$('#editor').on('keydown', '.line-code', function(e) {
		if ((e.which == 8) || (e.which == 46)) {
			if ($(this).text() == '') {
				e.preventDefault();
				document.title = $(this).html();
				$(this).parent().remove();
			}
		} else if (e.which == 13) {
			e.preventDefault();
			$(this).after('<div class="line" contenteditable="false"><p class="line-num pull-left" contenteditable="false">?</p><p class="line-code" contenteditable="true"></p></div>');
		} else {
			
		}
		update_numbers();
	});
	load_files();
});
