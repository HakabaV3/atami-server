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
		fetchSearch($('#query').val());
	});

	fetchSearch('');
}

function fetchRegister() {
	var url = $('#url').val(),
		tags = $('#tags').val().split(',');

	$.ajax({
		type: 'post',
		url: '/api/v1/image',
		data: JSON.stringify({
			url: url,
			tags: tags
		}),
		contentType: 'application/JSON',
		dataType: 'JSON',
		scriptCharset: 'utf-8',
		success: function() {
			$('#url').val('');
			$('#tags').val('');
			fetchSearch($('#query').val());
		}
	});
}

function fetchDelete(id) {
	$.ajax({
		type: 'delete',
		url: '/api/v1/image/' + id,
		success: function() {
			fetchSearch($('#query').val());
		}
	});
}

function fetchSearch(query) {
	$.ajax({
		type: 'get',
		url: '/api/v1/image/search',
		data: {
			q: query
		},
		success: function(datas) {
			render(datas.sort(function(a, b) {
				return a.created > b.created ? -1 : a.created < b.created ? 1 : 0;
			}));
		}
	});
}

function render(datas) {
	var template = '<tr>' +
		'<td><img src="{{url}}" class="preview"></td>' +
		'<td><a target="_blank" href="{{proxiedUrl}}">{{id}}</a></td>' +
		'<td><a target="_blank" href="{{url}}">{{url}}</a></td>' +
		'<td>{{tags}}</td>' +
		'<td><button onclick="fetchDelete(\'{{id}}\')" class="btn btn-danger">削除</button></td>' +
		'</tr>';

	var html = datas.map(function(data) {
			var tags = data.tags.map(function(keyword) {
				return '<span class="label label-default">' + keyword + '</span>';
			}).join('');

			return template
				.replace(/\{\{id\}\}/g, data._id)
				.replace(/\{\{proxiedUrl\}\}/g, data.proxiedUrl)
				.replace(/\{\{url\}\}/g, data.url)
				.replace(/\{\{tags\}\}/g, tags);
		})
		.join('');

	$('tbody').html(html);
}
