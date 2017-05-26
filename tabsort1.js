
(function(){

	if (!window.def) {def = {}; addLog = function(){}; addNavig = function(){}; addArrows = function(c){c.title = "Сортировать"}; addEl = function(){}; addInputs = function(){}; }
	if (!def.arrows_draw) document.write('<link rel="stylesheet" href="arrows1.css" type="text/css">\n')

	var y, curr_t, dec = (1/2).toString().replace(/\d/g, ""),
		undigit = new RegExp("[^\\d\\" + dec + "]+", "g"),
		a_re = /[cdu]\_\d+\_[cdu]/, alt_always = [],
		arrows_class = (def.arrows_draw) ? "sort " : "", 
		result, valid_types = {str:1, num:0}, invis_class = 'disnone',
		q1 = new RegExp("(<[^<>]*?)<[^<>]+>([^<>]*?)<[^<>]+>([^<>]*>)", "ig")

	prepTabs = function (t1){
		if (!window.d0) window.d0 = new Date()
		else addLog("DOM: ", d0)

		if (!def.arrows_draw) addEl("img_lo")
		result = addEl("result")
		var tid, th, ts = (t1 && t1.className) ? [t1] : gt("table"), t, irr,
		 cs, cells, c, ax, alt

		for (tid in ts) {
			t = ts[tid]
			if (!hc(t.className, "sortable")) continue
			if (!t.tHead) { 
				th = ce("thead")
				th.appendChild(t.rows[0])
				t.appendChild(th)
			}
			th = t.tHead
			t.sorted = NaN
			t.filtered = NaN
			
			t.cell2color = [] 
			//reset
			var tb = t.tBodies[0], list = gt('col', t), k, col_t, col = ce('col');
			t.tb_res = tb.cloneNode(true)
			t.th_res = th.cloneNode(true)
			//colgroup 
			t.cols = []
			//t.cg = null 
			t.rlen = tb.rows[0].cells.length;
			cells = th.rows[0].cells
			t.col_color = []
			for (k = 0; k < t.rlen; k ++) {
				col_t = list[k]
				t.cols[k] = (col_t && col_t.tagName) ? col_t : t.insertBefore(col.cloneNode(true), th)
				t.cell2color[k] = false
				c = cells[k]
				ax = c.axis.split(/\:/)
				alt = ax && ax[1]
				ax = ax[0]
				c.sorttype = (ax && ax in valid_types) ? valid_types[ax] : ((def.axis_require) ? 9 : 1)
				if (c.sorttype == 9) {cc(c, 'unsortable'); c.title = '';}
				else {c.title = 'Сортировать';} 
				alt_always[k] = !!alt 
				t.col_color[k] = 0
			}
			
			irr = fixTime(null, 'makeThead', t)
			fixTime(null, 'makeSortArr', t, irr)
			t.page_size = (def.paginate) ? 20 : 0
			addNavig(t)
			fixTime(null, 'page', t)
			curr_t = t
			t.arrow_color = 0
		}
	}

	makeThead = function (t) {
		var cid, cell, axis, th = t.tHead, cs = th.rows[0].cells, irr = []
		cc(th, "c_0_c")
		for (cid in cs) {
			cell = cs[cid]; axis = cell.axis; 
			axis = axis && axis.split(/\:/)[0]
			if (!cell.tagName || (!axis && def.axis_require)) continue
			cell.onclick = clicktab
			cc(cell, "sort")
			irr[cid] = axis
			addArrows(cell)
			addInputs(cell)
			
		}
//  addLog("makeThead: ")
		y = irr.length
		return irr
	}

	var cCalc = function (val, type) {
		switch (type) {
			case "num":
				calc_v = parseFloat(val.replace(undigit, ""))
				calc_v = (isNaN(calc_v)) ? ((val) ? Infinity : -(Infinity)) : calc_v
				break
			case "str":
				calc_v = val.toString()
				break
			default:
				calc_v = Math.round(100 * parseFloat(val)).toString()
				if (isFinite(calc_v)) while (calc_v.length < 10) calc_v = "0" + calc_v
				else calc_v = val
				break
		}
		return calc_v
	}

	makeSortArr = function (t, irr) {
//   t0 = ce("table")
		var tb = t.tBodies[0], val, 
		rid, r, rows = tb.rows, l = rows.length, cells, j, c, axis, rarr = [], sobj
		for (rid = 0;  rid < l; rid ++) {
			r = rows[rid].cloneNode(true)
			cells = r.cells
			if (!cells) continue
			sobj = []
			for (var i = 0; i < irr.length; i ++) {
				//if (i < 3) {
				axis = irr[i]
				if (axis in valid_types || !def.axis_require) {
					c = cells[i]
					val = (c && c.innerHTML) || ''
					if (def.strip_tags) val = val.replace(/\<[^<>]+?\>/g, '');
					val = val.toLocaleLowerCase()
					sobj[i] = cCalc(val, axis)
					//sobj["source_" + i] = val
				}
				//}
			}
			sobj[y] = r; sobj[y + 1] = rid
			rarr[rid] = sobj
		}
		t.rarr = rarr
		cc(t, 'sortable_vis', 'sortable')
//  addLog("makeSortArr: ")
	}

	move = function (d, m) {
		if (def.show_log) d0 = new Date()
		var t = curr_t, rarr = t.vrarr || t.rarr,
			lr = rarr.length
		if (!lr) addLog("move(): !rarr.length")
		var fl = t.first_line, ll, nfl, nll
		if (d == 0) {
			t.first_line = 0
			return fixTime(null, 'page', t)
		}
		else if (d == -1) {
			nfl = (m || (fl - t.page_size < 0)) ? 0 : fl - t.page_size
		}
		else if (d == 1) {
			nfl = (m) ? lr - t.page_size : (fl + t.page_size < lr)
				? fl + t.page_size : fl
		}
	// alert("//lr:" + lr + "//fl:" + fl + "//nfl:" + nfl)
		if (nfl != fl) {
			nfl = (nfl < 0) ? 0 : nfl
			if (nfl != t.first_line) {
				t.first_line = nfl
				fixTime(null, 'page', t)
			}
		}
	}

	page = function (t) {
		curr_t = t
		if (!("first_line" in t)) t.first_line = 0
		var rarr = t.vrarr || t.rarr, r_item
	/* if (!rarr || !rarr.length) {
		
		return false
	}
	*/
		var old_tbody = (t.tBodies && t.tBodies[0]) || t.appendChild(ce("TBODY")),
			tbody = ce("TBODY"), row, cSwitch, lr = rarr.length
		if (!t.page_size) t.page_size = lr
		var i = t.first_line, l = (i + t.page_size > lr) ? lr : i + t.page_size
		if (t.pagenum) {
			t.pagenum.innerHTML = Math.ceil(l / t.page_size) + " "
			t.pageall.innerHTML = Math.ceil(lr / t.page_size) + " "
		}

	// alert("i:" + i + "//l:" + l + "//lr:" + lr)
		var rtmp, html, q = null, flag, k, rid = t.rlen, base_row = [],
		 cnold = '', cn = ''
		for (k = 0; k < rid; k++) { 
			base_row[k] = (t.cell2color[k]) ? false : null;
		}
		//if (curr_t.query) addLog(curr_t.query[1].q + '/' + curr_t.query.length)
		
		for(i; i<l; i++){
			r_item = rarr[i]
			if (!r_item) addLog("page: !rarr[" + i + ']')
			row = r_item[y].cloneNode(true)
			if (def.use_zebra) {
				cSwitch = (0 === i%2) ? "odd" : "even"
				cc(row, cSwitch, (cSwitch == "odd") ? "even" : "odd")
			}
			else {
				flag = false 
				var curr_c, query = curr_t.query || []
				for (k = 0; k < rid; k++) {
					curr_c = row.cells[k]
					if (def.bg_cells && curr_c && t.col_color[k]) cc(curr_c, 'sort' + t.col_color[k])
					if (!g_soft && query[k]) color(curr_c, query[k])
					
					if (base_row[k] === null) continue
					if (r_item[k] !== base_row[k]) {
						if (base_row[k] !== false) flag = true
						base_row[k] = r_item[k]
					}
				}
				if (flag) {
					cnold = cn
					cn = (cn) ? null : 'even'
				}
				cc(row, cn, cnold)
			}
			
	//row.cells[0].innerHTML += '//' + rarr[i]['idx']
			tbody.appendChild(row)
		}
		t.replaceChild(tbody, old_tbody)
	/* if (def.pick && window.pickHref) {tbody.onclick = pickHref;} */
	// addLog("page: ")
		return false
	}


	var color = function (c, qq) {
		var q = qq.q || qq.val2 || qq.val1
		q = new RegExp("(" + q + ")", "ig")
		h = c.innerHTML
		h = h.replace(q, "<span class='y'>$1</span>")
		h = h.replace(q1, "$1$2$3") 
		c.innerHTML = h
	}


	var keys = function (e) {
		switch (alt_key) {
			case 1:
				return e.altKey
				break
			case 2:
				return e.shiftKey
				break
			case 3:
				return (e.altKey && e.ctrlKey)
				break
			default:
				return e.altKey
				break
		}
	}
	
	var clicktab = function (e) {
		window.d0 = new Date()
		e = e || window.event
		var o = e.target || e.srcElement
		if ("input" == o.tagName.toLowerCase()) return
		var obj = this, i = obj.cellIndex, j = 0, 
			cn = obj.className, t = obj.parentNode
		while (!t.tagName.match(/^table$/i)) t = t.parentNode
		var sorttype = obj.sorttype, verse = /d\_\d+\_d/.test(cn),
		 tb = t.tBodies[0], flag = keys(e);
		
		if (def.alt_mirror) flag = !flag;
		t.cell2color[i] = (flag || alt_always[i]) ? true : false;
		
		if (e.ctrlKey) { /* reset */
			t.replaceChild(t.tb_res, tb); 
			t.replaceChild(t.th_res, t.tHead); 
			for (var col in t.cols) {t.cols[col].className = t.cols[col].className.replace(/sort\d+/g, '');}
			cc(t, 'sortable', 'sortable_vis')
			cc(result, invis_class)
			t.vrarr = null
			if (window.Msg) {window.Msg.innerHTML = ''; cc(window.Msg, null, invis_class)}
			prepTabs(t); 
			return;
		}
		if (!tb.rows.length) return alert('Сбросьте фильтры: Ctrl + Click')
		
		if (sorttype == 9) return;
		
		if (i !== t.sorted) {
			if (t.arrow_color < 10) t.arrow_color++
			else t.arrow_color = 1
		}
		var dir = (verse) ? "u" : "d", new_class = dir + "_" + t.arrow_color + "_" + dir
		if (a_re.test(cn)) obj.className = cn.replace(a_re, new_class)
		else obj.className = arrows_class + new_class

		if (def.bg_cols && t.cols[i]) {
			var ccn = t.cols[i].className.replace()
			t.cols[i].className = ccn + ' sort' + t.arrow_color
		}
		t.col_color[i] = t.arrow_color 

		var patch = def.patch_similar,
		 cmpRow = (!patch) 
		  ? "(a == b) ? 0 : (a " + (verse ? "<" : ">") + " b) ? 1 : -1"
		  : "(a0 == b0) ? 0 : (a0 " + (verse ? "<" : ">") + " b0) ? 1 : -1",
		 cmpNum =  (!patch) 
		  ? ((verse) ? "b - a" : "a - b")
		  : ((verse) ? "b0 - a0" : "a0 - b0"),
		 cmp = (sorttype) ? cmpRow : cmpNum,
		 cmp_idx = (verse) ? "b['idx'] - a['idx']" : "a['idx'] - b['idx']";
		
		cmp = (!patch) 
		 ? new Function("a, b", "a = a[" + i + "]; b = b[" + i + "]; return(" + cmp + ");")
		 : new Function("a, b", "var a0 = a[" + i + "], b0 = b[" + i + "]; var res = " + cmp + "; return !(res == 0) ? (" + cmp + ") : (" + cmp_idx + ");")
//alert(cmp)
		var rarr = t.vrarr || t.rarr
		if (t.sorted === i) rarr.reverse()
		else rarr = rarr.sort(cmp)
		if (patch) rebuildIdx(rarr)
		addLog("sort: ") //fixTime(rarr, 'sort', cmp)
		t.sorted = i

		fixTime(null, 'page', t)
		obj.title = "Отсортировано по " + ((verse) ? "убыванию" : "возрастанию")
	}

	function rebuildIdx(rarr) {
		var i = 0, l = rarr.length;
		for (i; i < l; i ++) {
			rarr[i]['idx'] = i
		}
	}
	
	function setWidth(c) {
		var w = c.offsetWidth, w3 = w - 30;
		var list = gt('input', c), l = list && list.length, el, wi, i = 0;
		w3 = (w3 > 200) ? 200 : w3
		for (i; i < l; i ++) {
			el = list[i]
			wi = el.offsetWidth
			if (!wi) continue
			if (wi < w3) el.style.width = w3 + 'px'
		}
		c.width_isset = true
		cc(c, null, 'traur')
	}

	doFilter = function (inh) {
		
		var query = curr_t.query, rarr = (inh) ? curr_t.vrarr : curr_t.rarr;
		
		var val, val_int, val_calc, l = rarr.length, m = 0, 
		 tmp_rarr = [], ok = false, row, ql = query.length, cell;
		
		for (var i = 0; i < l; i++) { 
			if (!rarr[i]) continue
			row = rarr[i][y]
			for (var j = 0; j < ql; j ++) {
				qq = query[j]
				if (!qq) continue
				if (!row.cells[j]) {continue}
				//val = rarr[i]['source_' + j]
				val_calc = rarr[i][j]
				val = val_calc
				
				val_int = parseFloat(val_calc)// || Infinity

				if (qq.n < 3) ok = ((val_int >= qq.val1) && (val_int <= qq.val2))
				else {
					ok = val.indexOf(qq.q) > -1
					
					if (qq.exclude) ok = !ok
				}
				//if (i < 9) addLog(j + '/' + ok + '/' + qq.val1 + '/' + val_int + '/'  + qq.val2 + '/')
				if (!ok) {break;}
			}
			if (ok) {
				if (val_calc == undefined) {return alert("dataFilter: !val_calc ! " + val)}
				tmp_rarr[m] = rarr[i]
				m++
				//if (m<20) addLog(qq.val1+'/'+ val_int)
			}
		}
		curr_t.vrarr = (tmp_rarr.length) ? tmp_rarr : null
		
	}

	dataFilter = function (obj) {
		var c = findParent(obj, "TH") || findParent(obj, "TD"), val = obj.value;
		curr_t = findParent(c, "TABLE")
		
		if (!obj.prev && !val || obj.prev == val) return
		if (" " == val || "^" == val) return
		
		if (def.show_log) d0 = new Date();
		
		var cid = c.cellIndex, el, cell, cell_old, n, list = gt("INPUT", curr_t.tHead), 
		 l = list.length, i;
		
		if (!list) return alert('!list')
		if (!c.width_isset) setWidth(c)
		
		var ci, fields, field1, val1, field2, val2, q, prev1, prev2, inh = true, exclude, space;
		curr_t.query = []
		
		for (i = 0; i < l;  i ++) {
			el = list[i]
			if (!el.tagName) {continue}
			
			cell = findParent(el, "TH") || findParent(el, "TD")
			if (cell_old == cell) {continue}
			
			/*build query*/
			
			n = (el.className == 'num') ? 1 : 3
			ci = cell.cellIndex; 
			fields = cell && gt("INPUT", cell) || [{}, {}];
			field1 = fields[0]; val1 = field1 && field1.value; 
			field2 = fields[1]; val2 = field2 && field2.value; 
			prev1 = field1 && field1.prev; prev2 = field2 && field2.prev;

			q = val1; exclude = (0 == q.indexOf("^"));
			q = (exclude) ? q.substring(1) : q;
			space = (0 === q.indexOf(" "));
			q = (space) ? q.substring(1) : q;
			q = q.toLocaleLowerCase()
			
			if (!((n == 3 && val1.indexOf(prev1) === 0) || (n < 3 && val1 >= prev1 && val2 <= prev2))) 
				inh = false; //наследование (vrarr)
			if (!val1 && !val2) continue
			val1 = parseFloat(val1) || -Infinity
			val2 = parseFloat(val2) || +Infinity
			curr_t.query[ci] = {cell:cell, n:n, val1:val1, val2:val2, q:q, exclude:exclude, space:space}
			
			cell_old == cell
		}
		
		if (curr_t.query.length) fixTime(null, 'doFilter', inh)
		else curr_t.vrarr = curr_t.rarr
		
		obj.prev = val
		var coo = getTopLeft(c)
		result.style.top = coo.top - 10 + 'px'
		result.style.left = coo.left + 'px'
		if (curr_t.vrarr) {
			cc(c, null, 'traur')
			cc(curr_t.tHead, 'zeliony')
			cc(result, null, invis_class)
			result.innerHTML = curr_t.vrarr.length 
			if (n == 1 || n == 2) curr_t.q = ''
			else {
				curr_t.q = val && val.toLocaleLowerCase()
				curr_t.filtered = cid
			}
			move(0)
		}
		else {
			result.innerHTML = '0'
			cc(c, 'traur')
			cc(curr_t.tHead, null, 'zeliony')
			curr_t.q = ''
			curr_t.replaceChild(ce('tbody'), curr_t.tBodies[0])
		}
	}

	addLoadEvent(prepTabs)
})()

//alert(hc("ab", "ab"))