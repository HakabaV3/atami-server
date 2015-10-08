/* global $ */

'use strict';

$(init);

function init() {
	$('#register').on('submit', function(ev) {
		ev.preventDefault();
		fetchRegister();
	});

	$('#search').on('submit', function(ev) {
		ev.preventDefault();
		fetchSearch($('#keywords2').val().split(/[\s+,]+/g));
	});

	fetchSearch(['']);
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
			fetchSearch($('#keywords2').val().split(/[\s+,]+/g));
		}
	});
}

function fetchSearch(keywords) {
	$.ajax({
		type: 'get',
		url: '/image/search',
		data: {
			q: keywords.join(',')
		},
		success: function(datas) {
			render(datas.sort(function(a, b) {
				return a._id > b._id ? -1 : a._id < b._id ? 1 : 0;
			}));
		}
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
