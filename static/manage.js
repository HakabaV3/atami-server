/* global $ */

'use strict';

$(init);

function init() {
	$('#register').on('submit', function(ev) {
		ev.preventDefault();
		fetchRegister();
	});

	$('#list').on('submit', function(ev) {
		ev.preventDefault();
		fetchList();
	});

	fetchList();
}

function fetchRegister() {
	var url = $('#url').val(),
		keywords = $('#keywords').val();

	$.ajax({
		type: 'post',
		url: '/image',
		data: JSON.stringify({
			url: url,
			q: keywords
		}),
		contentType: 'application/JSON',
		dataType: 'JSON',
		scriptCharset: 'utf-8',
		success: function() {
			fetchList();
			$('#url').val('');
			$('#keywords').val('');
		}
	});
}

function fetchDelete(id) {
	$.ajax({
		type: 'delete',
		url: '/image/' + id,
		success: function() {
			fetchList();
		}
	});
}

function fetchList() {
	$.get('/image/all')
		.done(function(datas) {
			render(datas);
		});
}

function render(datas) {
	var template = '<tr>' +
		'<td><img src="{{url}}" class="preview"></td>' +
		'<td><a target="_blank" href="{{proxiedUrl}}">{{id}}</a></td>' +
		'<td><a target="_blank" href="{{url}}">{{url}}</a></td>' +
		'<td>{{keywords}}</td>' +
		'<td><button onclick="fetchDelete(\'{{id}}\')" class="btn btn-danger">削除</button></td>' +
		'</tr>';

	var html = datas.map(function(data) {
			var keywords = data.keywords.map(function(keyword) {
				return '<span class="label label-default">' + keyword + '</span>';
			}).join('');

			return template
				.replace(/\{\{id\}\}/g, data._id)
				.replace(/\{\{proxiedUrl\}\}/g, data.proxiedUrl)
				.replace(/\{\{url\}\}/g, data.url)
				.replace(/\{\{keywords\}\}/g, keywords);
		})
		.join('');

	$('tbody').html(html);
}
