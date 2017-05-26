	
window.alt_key = 2 /* 1: Alt, 2: Shift, 3: Ctrl+Alt */

window.def = {
	use_zebra: false, 
	arrows_draw: true, 
	paginate:true, 
	use_inputs:true, 
	strip_tags:true, 
	patch_similar:true,
	bg_cols:false, 
	bg_cells:true, 
	alt_mirror:false, 
	axis_require:false
}

window.is_gecko = (/gecko/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent))
if (is_gecko) def.patch_similar = false
	
	


function addLoadEvent(func) {
	var old = window.onload
	if (typeof window.onload != 'function') window.onload = func
	else window.onload = function() { old(); func(); }
}

function findParent(obj, tag, classn){ 
	var oTag
	if (typeof(tag) == "object" && null!=tag) {
		while (obj && document.body!=obj.parentNode) {
			obj=obj.parentNode
			if (obj==tag) return obj
		}
		return null
	}
	while (obj && document.body!=obj.parentNode) {
		obj=obj.parentNode 
		oTag=obj && obj.tagName
		if (oTag && tag.toLowerCase()==oTag.toLowerCase()) {
			if (!classn || -1!=obj.className.indexOf(classn)) {
				return obj
			}
		}
	}
	return null
}

function findChild(obj, tag, classn, rec) {
	if (!obj) return null
	if (!obj.hasChildNodes()) return null
	var oTag 
	var el, el_class, list = (rec) ? obj.getElementsByTagName(tag) : obj.childNodes
	var l = list.length
	for (var i=0; i<l; i++) {
		el = list[i]
		oTag = el.tagName
		el_class = el.className
		if (oTag && tag.toLowerCase()==oTag.toLowerCase() 
			&& (!classn || hc(el_class, classn))) {
			return el
			break
		}
	}
	return null
}

function hc(cN /*string only*/, c) { /*hasClass*/
	return (!c || !cN) ? false : ((" " + cN + " ").indexOf(" " + c + " ") !== -1)
}

function cc(o, add, del) { /*cnangeClass*/
	var n = "className", cN = (undefined != o[n]) ? o[n] : o, ok = 0
	if ("string" !== typeof cN) return false
	var re = new RegExp('(\\s+|^)' + del + '(\\s+|$)', 'g')
	if (add) /*addClass*/
		if (!hc(cN, add)) {cN += " " + add; ok++}
	if (del) /*delClass*/
		if (hc(cN, del)) {cN = cN.replace(re, " "); ok++}
	if (!ok) return false
	if ("object" == typeof o) o[n] = cN 
	else return cN
}

function getTopLeft(el) {
	var top=0, left=0
	while(el) {
		top = top + parseInt(el.offsetTop)
		left = left + parseInt(el.offsetLeft)
		el = el.offsetParent
	}
	return {top:top, left:left}
}

function ce(t) {return document.createElement(t)}
function gt(t, e) {e = e || document; return e.getElementsByTagName(t)}

function fixTime() {
	var d1, d0 = new Date(), ret, i, 
		obj = arguments[0], f = arguments[1],
		args = Array.prototype.slice.call(arguments, 2)
	obj = obj || window
	if (!(f in obj) || typeof obj[f] !== 'function') return
	ret = obj[f].apply(this, args)
	d1 = new Date()
	Log(d1 - d0, f)
	return ret
}


(function () {
	
	window.g_soft = false
	var ttest = ce("TABLE")
	try {ttest.innerHTML += ""}
	catch(e) {g_soft = true}
	
	var style = (!g_soft) ? 'ie_free' : 'ie'
	document.write("<link rel='stylesheet' href='" + style + ".css' type='text/css'>");
	
	 /* if (!arrows_draw) @require http://ir2.ru/sorters/img/*.gif, 
		http://ir2.ru/sorters/arrows1.css */

	/* HTML-элементы */
	var T = {}, i = 1, html = '<img src="img/c1.gif">',
		div = document.createElement('DIV')
	for (i; i < 11; i++) {
		html += '<img src="img/d' + i + '.gif"><img src="img/u' + i + '.gif">'
	}
	/* img preloader */
	T.img_lo = div.cloneNode(true)
	T.img_lo.className = "disnone"
	T.img_lo.innerHTML = html

	/* search results number */
	T.result = document.createElement("SPAN")
	T.result.className = "abstopleft disnone"

	window.addEl = function (name) {
		return document.body.appendChild(T[name])
	}

	/* CSS-arrows */
	var arrows_el = div.cloneNode(true)
	arrows_el.innerHTML = "<div class='up'></div><div class='down'></div>"
	arrows_el.className = 'arrows only'
	window.addArrows = function (c) {
		if (!def.arrows_draw) return
			c.insertBefore(arrows_el.cloneNode(true), c.firstChild)
			c.style.width = c.offsetWidth + 11 + 'px'
	}

	/* log */
	T.msg = div.cloneNode(true)
	T.msg.className = "tablog"
	T.msg.innerHTML = "&bull; Убрать: ESC. &bull; "

	window.addLog = function (txt, d0) {
		if (!def.show_log) return
		d0 = d0 || window.d0 || new Date()
		if (!window.Msg) Msg = addEl("msg")
		var d1 = new Date()
		Msg.innerHTML += txt + (d1 - d0) + " ms. "
		window.d0 = d1
	}

	window.Log = function (ms, txt) {
		if (!def.show_log) return
		if (!window.Msg) Msg = addEl("msg")
		Msg.innerHTML += txt + ": " + ms + " ms, "
	}

	/* paginater */
	var navig = div.cloneNode(true)
	navig.className = "navig"
	navig.innerHTML = '<button onclick="move(-1,true); return false;" title="Первая (Ctrl + Alt + &larr;)"><span>&lt;&lt;</span></button>\
<button onclick="move(-1); return false;" title="Предыдущая (Ctrl + &larr;)"><span>&lt;</span></button>\
<span>Страница </span><span class=\'pagenum\'></span> из <span class=\'pageall\'></span> \
<button onclick="move(1); return false;" title="Следующая (Ctrl + &rarr;)"><span>&gt;</span></button>\
<button onclick="move(1,true); return false;" title="Последняя (Ctrl + Alt + &rarr;)"><span>&gt;&gt;</span></button>\
<span>На странице <input class="page_size"> строк </span>\
<button class="set"><span>Установить</span></button> \
'
	if (def.use_cookie) navig.innerHTML += ' &bull; <a href="#" onclick="clearHist(); return false;"> Очистить историю сортировки</a>\
'
	window.addNavig = function (t) {
		if (!def.paginate || t.navig) return
		navig = t.parentNode.insertBefore(navig.cloneNode(true), t)
		navig.t = t
		t.navig = navig
		t.pagenum = findChild(navig, "span", "pagenum")
		t.pageall = findChild(navig, "span", "pageall")
		t.page_el = findChild(navig, "input", "page_size", true)
		t.page_el.value = t.page_size
		t.page_el.onkeyup = function(){t.page_size = parseInt(this.value); curr_t = t}
		var set_size = findChild(navig, "button", "set")
		set_size.onclick = function(){window.d0 = new Date(); move(0); return false;}
	}

	/* data filter inputs */
	var inputs_el = div.cloneNode(true), input_el = div.cloneNode(true)
	inputs_el.className = input_el.className = 'inputs'
	inputs_el.innerHTML = "<span class='absle'>&ge;</span><input class='num' onkeyup='dataFilter(this, 1)'></div><div class='inputs'><span class='absle'>&le;</span><input class='num' onkeyup='dataFilter(this, 2)'>"
	input_el.innerHTML = "<input class='str' onkeyup='dataFilter(this, 3)'>"
	window.addInputs = function (c) {
		if (!def.use_inputs) return
		var axis = c.axis.split(/\:/)[0]
		c.appendChild((("num" == axis || "formula" == axis) ? inputs_el : input_el).cloneNode(true))
	}

	/* HTML-элементы конец*/

	window.docKey = function (e) {
		e = e || window.event
		if (27 == e.keyCode) { /* Скрыть лог */
			if (T.result) cc(T.result, 'disnone')
			if (T.msg) cc(T.msg, 'disnone')
		}
		/* листание страниц */
		if (!def.paginate || !e.ctrlKey || (37 != e.keyCode && 39 != e.keyCode)) return
		var dir = (39 == e.keyCode) ? 1 : -1
		var maxi = (e.altKey) ? true : false
		move(dir, maxi)
	}

	document.onkeyup = docKey
})()

