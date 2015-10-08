// feedback.js
// 2013, Kázmér Rapavi, https://github.com/ivoviz/feedback
// Licensed under the MIT license.
// Version 2.0

(function($){

	$.feedback = function(options) {

    var settings = $.extend({
			userInfo: '',
			ajaxURL:  '',
			postBrowserInfo: 		true,
			postHTML:				false,
			postURL:				true,
			proxy:					undefined,
			letterRendering:		false,
			initButtonText: 		'フィードバックを送信',
			strokeStyle:			'black',
			shadowColor:			'black',
			shadowOffsetX:			1,
			shadowOffsetY:			1,
			shadowBlur:				10,
			lineJoin:				'bevel',
			lineWidth:				3,
			html2canvasURL:			'html2canvas.js',
			feedbackButton: 		'.feedback-btn',
			showDescriptionModal: 	true,
			isDraggable: 			true,
			onScreenshotTaken: 		function(){},
			tpl: {
				login:	'<div id="feedback-login"> <div class="feedback-logo"> フィードバック </div><p>ログインしていただく必要がございます。</p><button class="feedback-close-btn feedback-btn-blue">閉じる</button> <div class="feedback-wizard-close"></div></div>',
				description:	'<div id="feedback-welcome"> <div class="feedback-logo"> フィードバック </div><p>随時、問題に関するレポート、機能に関するアイデア、一般的なコメントを受け付けています。</p><p>説明を入力してください。</p><textarea id="feedback-note-tmp"></textarea> <p>次に、あなたの説明に関連するページの領域を特定してください。</p><button class="feedback-next-btn feedback-btn-gray" id="feedback-welcome-next">次へ</button> <div id="feedback-welcome-error">説明を入力してください。</div><div class="feedback-wizard-close"></div></div>',
				highlighter:	'<div id="feedback-highlighter"> <div class="feedback-logo"> フィードバック </div><p>フィードバックが把握しやすくなるように、ページをクリックやドラッグで選択してください。画面を見やすくするには、このダイアログを移動させてください。</p><button class="feedback-sethighlight feedback-active"> <div class="ico"></div><span>Highlight</span></button><label>フィードバックに関連する領域をハイライトしてください。</label> <button class="feedback-setblackout"> <div class="ico"></div><span>Black out</span></button><label class="lower">個人情報は黒く塗りつぶしてください。</label> <div class="feedback-buttons"> <button class="feedback-next-btn feedback-btn-gray" id="feedback-highlighter-next">次へ</button><button class="feedback-back-btn feedback-btn-gray" id="feedback-highlighter-back">戻る</button> </div><div class="feedback-wizard-close"></div></div>',
				overview:		'<div id="feedback-overview"> <div class="feedback-logo"> フィードバック </div><div id="feedback-overview-description"> <div id="feedback-overview-description-text"> <h3>説明</h3> <h3 class="feedback-additional">詳細情報</h3> <div id="feedback-additional-none"> <span>None</span> </div><div id="feedback-browser-info"> <span>ブラウザ情報</span> <div class="inner"></div></div><div id="feedback-page-info"> <span>ページ情報</span> <div class="inner"></div></div><div id="feedback-page-structure"> <span>ページ構造</span> <div class="inner"></div></div></div></div><div id="feedback-overview-screenshot"> <h3>スクリーンショット</h3> </div><div class="feedback-buttons"> <button class="feedback-submit-btn feedback-btn-blue" id="feedback-submit">送信</button><button class="feedback-back-btn feedback-btn-gray" id="feedback-overview-back">戻る</button> </div><div id="feedback-overview-error">説明を入力してください。</div><div class="feedback-wizard-close"></div></div>',
				submitSuccess:	'<div id="feedback-submit-success"> <div class="feedback-logo"> Feedback </div><p>貴重なご意見をいただきありがとうございます。すべてのフィードバックに対して個別に返信することはできませんが、いただいたコメントはサービスの向上のため活用させていただきます。</p><button class="feedback-close-btn feedback-btn-blue">完了</button> <div class="feedback-wizard-close"></div></div>',
				submitError:	'<div id="feedback-submit-error"> <div class="feedback-logo"> フィードバック </div><p>フィードバック送信中にエラーが発生しました。<br>お手数ですがもう一度やり直してみてください。</p><button class="feedback-close-btn feedback-btn-blue">閉じる</button> <div class="feedback-wizard-close"></div></div>'
				
			},
			onClose: 				function() {},
			screenshotStroke:		true,
			highlightElement:		true,
			initialBox:				true
    }, options);
		var supportedBrowser = !!window.HTMLCanvasElement;
		var isFeedbackButtonNative = settings.feedbackButton == '.feedback-btn';
		var _html2canvas = false;
		if (supportedBrowser) {
			if(isFeedbackButtonNative) {
				$('body').append('<button class="feedback-btn feedback-btn-gray">' + settings.initButtonText + '</button>');
			}
			$(document).on('click', settings.feedbackButton, function(){
				if(isFeedbackButtonNative) {
					$(this).hide();
				}
				if (!_html2canvas) {
					$.getScript(settings.html2canvasURL, function() {
						_html2canvas = true;
					});
				}
				var canDraw = false,
					img = '',
					h 	= $(document).height(),
					w 	= $(document).width(),
					tpl = '<div id="feedback-module">';

				tpl += settings.tpl.login;

				if (settings.initialBox) {
					tpl += settings.tpl.description;
				}

				tpl += settings.tpl.highlighter + settings.tpl.overview + '<canvas id="feedback-canvas"></canvas><div id="feedback-helpers"></div><input id="feedback-note" name="feedback-note" type="hidden"></div>';

				$('body').append(tpl);

				moduleStyle = {
					'position':	'absolute',
					'left': 	'0px',
					'top':		'0px'
				};
				canvasAttr = {
					'width': w,
					'height': h
				};

				$('#feedback-module').css(moduleStyle);
				$('#feedback-canvas').attr(canvasAttr).css('z-index', '30000');

				if(!settings.userInfo){
					$('#feedback-login').show();
					$('#feedback-welcome').hide();
				}

				if (!settings.initialBox) {
					$('#feedback-highlighter-back').remove();
					canDraw = true;
					$('#feedback-canvas').css('cursor', 'crosshair');
					$('#feedback-helpers').show();
					$('#feedback-login').hide();
					$('#feedback-welcome').hide();
					$('#feedback-highlighter').show();
				}

				if(settings.isDraggable) {
					$('#feedback-highlighter').on('mousedown', function(e) {
						var $d = $(this).addClass('feedback-draggable'),
							drag_h 	= $d.outerHeight(),
							drag_w 	= $d.outerWidth(),
							pos_y 	= $d.offset().top + drag_h - e.pageY,
							pos_x 	= $d.offset().left + drag_w - e.pageX;
						$d.css('z-index', 40000).parents().on('mousemove', function(e) {
							_top 	= e.pageY + pos_y - drag_h;
							_left 	= e.pageX + pos_x - drag_w;
							_bottom = drag_h - e.pageY;
							_right 	= drag_w - e.pageX;

							if (_left < 0) _left = 0;
							if (_top < 0) _top = 0;
							if (_right > $(window).width())
								_left = $(window).width() - drag_w;
							if (_left > $(window).width() - drag_w)
								_left = $(window).width() - drag_w;
							if (_bottom > $(document).height())
								_top = $(document).height() - drag_h;
							if (_top > $(document).height() - drag_h)
								_top = $(document).height() - drag_h;

							$('.feedback-draggable').offset({
								top:	_top,
								left:	_left
							}).on("mouseup", function() {
								$(this).removeClass('feedback-draggable');
							});
						});
						e.preventDefault();
					}).on('mouseup', function(){
						$(this).removeClass('feedback-draggable');
						$(this).parents().off('mousemove mousedown');
					});
				}

				var ctx = $('#feedback-canvas')[0].getContext('2d');

				ctx.fillStyle = 'rgba(102,102,102,0.5)';
				ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height());

				rect 		= {};
				drag 		= false;
				highlight 	= 1,
				post		= {};

				if (settings.postBrowserInfo) {
					post.browser 				= {};
					post.browser.appCodeName	= navigator.appCodeName;
					post.browser.appName		= navigator.appName;
					post.browser.appVersion		= navigator.appVersion;
					post.browser.cookieEnabled	= navigator.cookieEnabled;
					post.browser.onLine			= navigator.onLine;
					post.browser.platform		= navigator.platform;
					post.browser.userAgent		= navigator.userAgent;
					post.browser.plugins		= [];

					$.each(navigator.plugins, function(i) {
						post.browser.plugins.push(navigator.plugins[i].name);
					});
					
					//for(key in post.browser){
  				//	$('#feedback-browser-info > .inner').append(key+": "+post.browser[key]+'<br>');
					//}
					$('#feedback-browser-info > .inner').append(post.browser.userAgent);
					$('#feedback-browser-info').show();
				}

				if (settings.postURL) {
					post.url = document.URL;
					$('#feedback-page-info > .inner').append(post.url);
					$('#feedback-page-info').show();
				}

				if (settings.postHTML) {
					var escapeHTML = function(val) {
      			return $('<div />').text(val).html();
					};
					post.html = escapeHTML($('html').html());
					$('#feedback-page-structure > .inner').append(post.html);
					$('#feedback-page-structure').show();
				}

				if (!settings.postBrowserInfo && !settings.postURL && !settings.postHTML)
					$('#feedback-additional-none').show();

				$(document).on('mousedown', '#feedback-canvas', function(e) {
					if (canDraw) {

						rect.startX = e.pageX - $(this).offset().left;
						rect.startY = e.pageY - $(this).offset().top;
						rect.w = 0;
						rect.h = 0;
						drag = true;
					}
				});

				$(document).on('mouseup', function(){
					if (canDraw) {
						drag = false;

						var dtop	= rect.startY,
							dleft	= rect.startX,
							dwidth	= rect.w,
							dheight	= rect.h;
							dtype	= 'highlight';

						if (dwidth == 0 || dheight == 0) return;

						if (dwidth < 0) {
							dleft 	+= dwidth;
							dwidth 	*= -1;
						}
						if (dheight < 0) {
							dtop 	+= dheight;
							dheight *= -1;
						}

						if (dtop + dheight > $(document).height())
							dheight = $(document).height() - dtop;
						if (dleft + dwidth > $(document).width())
							dwidth = $(document).width() - dleft;

						if (highlight == 0)
							dtype = 'blackout';

						$('#feedback-helpers').append('<div class="feedback-helper" data-type="' + dtype + '" data-time="' + Date.now() + '" style="position:absolute;top:' + dtop + 'px;left:' + dleft + 'px;width:' + dwidth + 'px;height:' + dheight + 'px;z-index:30000;"></div>');

						redraw(ctx);
						rect.w = 0;
					}

				});

				$(document).on('mousemove', function(e) {
					if (canDraw && drag) {
						$('#feedback-highlighter').css('cursor', 'default');

						rect.w = (e.pageX - $('#feedback-canvas').offset().left) - rect.startX;
						rect.h = (e.pageY - $('#feedback-canvas').offset().top) - rect.startY;

						ctx.clearRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height());
						ctx.fillStyle = 'rgba(102,102,102,0.5)';
						ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height());
						$('.feedback-helper').each(function() {
							if ($(this).attr('data-type') == 'highlight')
								drawlines(ctx, parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
						});
						if (highlight==1) {
							drawlines(ctx, rect.startX, rect.startY, rect.w, rect.h);
							ctx.clearRect(rect.startX, rect.startY, rect.w, rect.h);
						}
						$('.feedback-helper').each(function() {
							if ($(this).attr('data-type') == 'highlight')
								ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
						});
						$('.feedback-helper').each(function() {
							if ($(this).attr('data-type') == 'blackout') {
								ctx.fillStyle = 'rgba(0,0,0,1)';
								ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
							}
						});
						if (highlight == 0) {
							ctx.fillStyle = 'rgba(0,0,0,0.5)';
							ctx.fillRect(rect.startX, rect.startY, rect.w, rect.h);
						}
					}
				});

				if (settings.highlightElement) {
					var highlighted = [],
						tmpHighlighted = [],
						hidx = 0;

					$(document).on('mousemove click', '#feedback-canvas',function(e) {
						if (canDraw) {
							redraw(ctx);
							tmpHighlighted = [];

							$('#feedback-canvas').css('cursor', 'crosshair');

							$('* :not(body,script,iframe,div,section,.feedback-btn,#feedback-module *)').each(function(){
								if ($(this).attr('data-highlighted') === 'true')
									return;

								if (e.pageX > $(this).offset().left && e.pageX < $(this).offset().left + $(this).width() && e.pageY > $(this).offset().top + parseInt($(this).css('padding-top'), 10) && e.pageY < $(this).offset().top + $(this).height() + parseInt($(this).css('padding-top'), 10)) {
										tmpHighlighted.push($(this));
								}
							});

							var $toHighlight = tmpHighlighted[tmpHighlighted.length - 1];

							if ($toHighlight && !drag) {
								$('#feedback-canvas').css('cursor', 'pointer');

								var _x = $toHighlight.offset().left - 2,
									_y = $toHighlight.offset().top - 2,
									_w = $toHighlight.width() + parseInt($toHighlight.css('padding-left'), 10) + parseInt($toHighlight.css('padding-right'), 10) + 6,
									_h = $toHighlight.height() + parseInt($toHighlight.css('padding-top'), 10) + parseInt($toHighlight.css('padding-bottom'), 10) + 6;

								if (highlight == 1) {
									drawlines(ctx, _x, _y, _w, _h);
									ctx.clearRect(_x, _y, _w, _h);
									dtype = 'highlight';
								}

								$('.feedback-helper').each(function() {
									if ($(this).attr('data-type') == 'highlight')
										ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
								});

								if (highlight == 0) {
									dtype = 'blackout';
									ctx.fillStyle = 'rgba(0,0,0,0.5)';
									ctx.fillRect(_x, _y, _w, _h);
								}

								$('.feedback-helper').each(function() {
									if ($(this).attr('data-type') == 'blackout') {
										ctx.fillStyle = 'rgba(0,0,0,1)';
										ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
									}
								});

								if (e.type == 'click' && e.pageX == rect.startX && e.pageY == rect.startY) {
									$('#feedback-helpers').append('<div class="feedback-helper" data-highlight-id="' + hidx + '" data-type="' + dtype + '" data-time="' + Date.now() + '" style="position:absolute;top:' + _y + 'px;left:' + _x + 'px;width:' + _w + 'px;height:' + _h + 'px;z-index:30000;"></div>');
									highlighted.push(hidx);
									++hidx;
									redraw(ctx);
								}
							}
						}
					});
				}

				$(document).on('mouseleave', 'body,#feedback-canvas', function() {
					redraw(ctx);
				});

				$(document).on('mouseenter', '.feedback-helper', function() {
					redraw(ctx);
				});

				$(document).on('click', '#feedback-welcome-next', function() {
					if ($('#feedback-note').val().length > 0) {
						canDraw = true;
						$('#feedback-canvas').css('cursor', 'crosshair');
						$('#feedback-helpers').show();
						$('#feedback-login').hide();
						$('#feedback-welcome').hide();
						$('#feedback-highlighter').show();
					}
					else {
						$('#feedback-welcome-error').show();
					}
				});

				$(document).on('mouseenter mouseleave', '.feedback-helper', function(e) {
					if (drag)
						return;

					rect.w = 0;
					rect.h = 0;

					if (e.type === 'mouseenter') {
						$(this).css('z-index', '30001');
						$(this).append('<div class="feedback-helper-inner" style="width:' + ($(this).width() - 2) + 'px;height:' + ($(this).height() - 2) + 'px;position:absolute;margin:1px;"></div>');
						$(this).append('<div id="feedback-close"></div>');
						$(this).find('#feedback-close').css({
							'top' 	: -1 * ($(this).find('#feedback-close').height() / 2) + 'px',
							'left' 	: $(this).width() - ($(this).find('#feedback-close').width() / 2) + 'px'
						});

						if ($(this).attr('data-type') == 'blackout') {
							/* redraw white */
							ctx.clearRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height());
							ctx.fillStyle = 'rgba(102,102,102,0.5)';
							ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height());
							$('.feedback-helper').each(function() {
								if ($(this).attr('data-type') == 'highlight')
									drawlines(ctx, parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
							});
							$('.feedback-helper').each(function() {
								if ($(this).attr('data-type') == 'highlight')
									ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
							});

							ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
							ctx.fillStyle = 'rgba(0,0,0,0.75)';
							ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());

							ignore = $(this).attr('data-time');

							/* redraw black */
							$('.feedback-helper').each(function() {
								if ($(this).attr('data-time') == ignore)
									return true;
								if ($(this).attr('data-type') == 'blackout') {
									ctx.fillStyle = 'rgba(0,0,0,1)';
									ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height())
								}
							});
						}
					}
					else {
						$(this).css('z-index','30000');
						$(this).children().remove();
						if ($(this).attr('data-type') == 'blackout') {
							redraw(ctx);
						}
					}
				});

				$(document).on('click', '#feedback-close', function() {
					if (settings.highlightElement && $(this).parent().attr('data-highlight-id'))
						var _hidx = $(this).parent().attr('data-highlight-id');

					$(this).parent().remove();

					if (settings.highlightElement && _hidx)
						$('[data-highlight-id="' + _hidx + '"]').removeAttr('data-highlighted').removeAttr('data-highlight-id');

					redraw(ctx);
				});

				$('#feedback-module').on('click', '.feedback-wizard-close,.feedback-close-btn', function() {
					close();
				});

				$(document).on('keyup', function(e) {
					if (e.keyCode == 27)
						close();
				});

				$(document).on('selectstart dragstart', document, function(e) {
					e.preventDefault();
				});

				$(document).on('click', '#feedback-highlighter-back', function() {
					canDraw = false;
					$('#feedback-canvas').css('cursor', 'default');
					$('#feedback-helpers').hide();
					$('#feedback-highlighter').hide();
					$('#feedback-welcome-error').hide();
					$('#feedback-login').hide();
					$('#feedback-welcome').show();
				});

				$(document).on('mousedown', '.feedback-sethighlight', function() {
					highlight = 1;
					$(this).addClass('feedback-active');
					$('.feedback-setblackout').removeClass('feedback-active');
				});

				$(document).on('mousedown', '.feedback-setblackout', function() {
					highlight = 0;
					$(this).addClass('feedback-active');
					$('.feedback-sethighlight').removeClass('feedback-active');
				});

				$(document).on('click', '#feedback-highlighter-next', function() {
					canDraw = false;
					$('#feedback-canvas').css('cursor', 'default');
					var sy = $(document).scrollTop(),
						dh = $(window).height();
					$('#feedback-helpers').hide();
					$('#feedback-highlighter').hide();
					if (!settings.screenshotStroke) {
						redraw(ctx, false);
					}
					html2canvas($('body'), {
						onrendered: function(canvas) {
							if (!settings.screenshotStroke) {
								redraw(ctx);
							}
							_canvas = $('<canvas id="feedback-canvas-tmp" width="'+ w +'" height="'+ dh +'"/>').hide().appendTo('body');
							_ctx = _canvas.get(0).getContext('2d');
							_ctx.drawImage(canvas, 0, sy, w, dh, 0, 0, w, dh);
							img = _canvas.get(0).toDataURL();
							$(document).scrollTop(sy);
							post.img = img;
							settings.onScreenshotTaken(post.img);
							if(settings.showDescriptionModal) {
								$('#feedback-canvas-tmp').remove();
								$('#feedback-overview').show();
								$('#feedback-overview-description-text>textarea').remove();
								$('#feedback-overview-screenshot>img').remove();
								$('<textarea id="feedback-overview-note">' + $('#feedback-note').val() + '</textarea>').insertAfter('#feedback-overview-description-text h3:eq(0)');
								$('#feedback-overview-screenshot').append('<img class="feedback-screenshot" src="' + img + '" />');
							}
							else {
								$('#feedback-module').remove();
								close();
								_canvas.remove();
							}
						},
						proxy: settings.proxy,
						letterRendering: settings.letterRendering
					});
				});

				$(document).on('click', '#feedback-overview-back', function(e) {
					canDraw = true;
					$('#feedback-canvas').css('cursor', 'crosshair');
					$('#feedback-overview').hide();
					$('#feedback-helpers').show();
					$('#feedback-highlighter').show();
					$('#feedback-overview-error').hide();
				});

				$(document).on('keyup', '#feedback-note-tmp,#feedback-overview-note', function(e) {
					var tx;
					if (e.target.id === 'feedback-note-tmp')
						tx = $('#feedback-note-tmp').val();
					else {
						tx = $('#feedback-overview-note').val();
						$('#feedback-note-tmp').val(tx);
					}

					$('#feedback-note').val(tx);
				});

				$(document).on('click', '#feedback-submit', function() {
					canDraw = false;

					if ($('#feedback-note').val().length > 0) {
						$('#feedback-submit-success,#feedback-submit-error').remove();
						$('#feedback-submit').prop('disabled', true);
						$('#feedback-submit').html('送信中...');
						$("#feedback-submit").removeClass('feedback-next-btn feedback-btn-blue');
						$("#feedback-submit").addClass('feedback-next-btn feedback-btn-gray');

						post.user = settings.userInfo;
						post.img = img;
						post.note = $('#feedback-note').val();
            var data = {feedback: JSON.stringify(post)};
						
						$.ajax({
							url: settings.ajaxURL,
							dataType: 'json',
							type: 'POST',
							data: data,
							success: function() {
								$('#feedback-module').append(settings.tpl.submitSuccess);
							},
							error: function(){
								$('#feedback-module').append(settings.tpl.submitError);
							},
							complete : function(data) {
								$('#feedback-overview').hide();
							}
						});
					}
					else {
						$('#feedback-overview-error').show();
					}
				});
			});
		}

		function close() {
			canDraw = false;
			$(document).off('mouseenter mouseleave', '.feedback-helper');
			$(document).off('mouseup keyup');
			$(document).off('mousedown', '.feedback-setblackout');
			$(document).off('mousedown', '.feedback-sethighlight');
			$(document).off('mousedown click', '#feedback-close');
			$(document).off('mousedown', '#feedback-canvas');
			$(document).off('click', '#feedback-highlighter-next');
			$(document).off('click', '#feedback-highlighter-back');
			$(document).off('click', '#feedback-welcome-next');
			$(document).off('click', '#feedback-overview-back');
			$(document).off('mouseleave', 'body');
			$(document).off('mouseenter', '.feedback-helper');
			$(document).off('selectstart dragstart', document);
			$('#feedback-module').off('click', '.feedback-wizard-close,.feedback-close-btn');
			$(document).off('click', '#feedback-submit');

			if (settings.highlightElement) {
				$(document).off('click', '#feedback-canvas');
				$(document).off('mousemove', '#feedback-canvas');
			}
			$('[data-highlighted="true"]').removeAttr('data-highlight-id').removeAttr('data-highlighted');
			$('#feedback-module').remove();
			$('.feedback-btn').show();

			settings.onClose.call(this);
		}

		function redraw(ctx, border) {
			border = typeof border !== 'undefined' ? border : true;
			ctx.clearRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height());
			ctx.fillStyle = 'rgba(102,102,102,0.5)';
			ctx.fillRect(0, 0, $('#feedback-canvas').width(), $('#feedback-canvas').height());
			$('.feedback-helper').each(function() {
				if ($(this).attr('data-type') == 'highlight')
					if (border)
						drawlines(ctx, parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
			});
			$('.feedback-helper').each(function() {
				if ($(this).attr('data-type') == 'highlight')
					ctx.clearRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
			});
			$('.feedback-helper').each(function() {
				if ($(this).attr('data-type') == 'blackout') {
					ctx.fillStyle = 'rgba(0,0,0,1)';
					ctx.fillRect(parseInt($(this).css('left'), 10), parseInt($(this).css('top'), 10), $(this).width(), $(this).height());
				}
			});
		}

		function drawlines(ctx, x, y, w, h) {
			ctx.strokeStyle		= settings.strokeStyle;
			ctx.shadowColor		= settings.shadowColor;
			ctx.shadowOffsetX	= settings.shadowOffsetX;
			ctx.shadowOffsetY	= settings.shadowOffsetY;
			ctx.shadowBlur		= settings.shadowBlur;
			ctx.lineJoin		= settings.lineJoin;
			ctx.lineWidth		= settings.lineWidth;

			ctx.strokeRect(x,y,w,h);

			ctx.shadowOffsetX	= 0;
			ctx.shadowOffsetY	= 0;
			ctx.shadowBlur		= 0;
			ctx.lineWidth		= 1;
		}

	};

}(jQuery));
