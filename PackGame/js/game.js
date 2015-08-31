if(jQuery('body').attr('data-page')=='landing'){
	// canvas & double buffer
	var cc 					= document.getElementById('canvas'),
		ct					= cc.getContext('2d'),
		cc2 				= document.createElement("canvas"),  // bubbles
		ct2 				= cc2.getContext('2d');
	// window size environment affect settings for gen bubbles
	var	win_w 				,
		win_h	 			,
		half_w 				,
		half_h 				,
		bubble_w 		  	,
		bubble_h 		  	,
		bubble_hide_pos 	,
		bubble_init_x_min 	,
		bubble_init_x_max 	,
		bubble_init_y_min 	,
		bubble_init_y_max 	;
	// vars
	var	bubbles 			= [],	// store all bubbles
		bid 				= 0,
		bubble_type 		= 1,			// 0:blue, 1:purple
		game_time 			= 90,
		loop_time 			= game_time,
		game_loop,
		draw_loop,
		score 				= 0,
		bbq 				= 2, // gen 0-2 bubbles per rand time
		speed				= 5, // tune speed
		bbq_speed 			= 5,
		remove_ids 			= 999,
		fps					= 0,
		game_status 		= 0,
		initx,
		inity,
		landscape,
		stop_marker,
		hit_count 			= 0,
		hit_text 			= 90,
		plus_text 			= 30,
		plus_x 				= 0,
		plus_y 				= 0,
		mark 				= document.getElementById('mark_inner');

	var hit_img				= new Image(),
	 	plus_img 			= new Image(),
	 	redborder 			= document.getElementById('redborder'),
	 	opening_timeout 	= '',
	 	soundbg_status		= 0,
	 	soundbg				= '',
	 	sound 				= '', // ball explode
	 	sound2 				= ''; // ball click


	var fsv,
		current_page 		= 0,
		// mov,
		opening_arrow		= $('.opening_arrow'),
		// nose 				= $('#nose'),
		nose_loop,
		// skin				= $('#skin'),
		skin_loop,
		// bacteria			= $('#bacteria'),
		bacteria_loop,
		// skin_nose			= $('#skin_nose'),
		sn_loop,
		down_to_escape		= $('#down_to_escape'),
		down_loop;
	var share_fire=0;
	var video_fire=0;
	var hm = 0;
	var _queue_runner;
	var _queues = [];
	function queue(func, sleep){
		_queues.push([func, sleep]);
	}
	function run_queue(){
		if(_queues.length === 0){
			_queue_runner = setTimeout(run_queue, 1000);
			return;
		}
		var run = _queues.shift();
		run[0]();
		_queue_runner = setTimeout(run_queue, run[1]);
	}

}
function cls(){
	cc.width    = cc.width;
    cc.height   = cc.height;
}
function drawcircle(){
	clean_bubble();
	ct.clearRect(0, 0, cc.width, cc.height);	// if hit_text
	if(hit_text<90){
		if(hit_text== 0){ // it mean the hit text show 1s
			if(hit_count<4){
				redborder.style.display = "block";
				sound.play();
			}
		}
		if(hit_text== 89){
			redborder.style.display = "none";
		}
		if(hit_count<4){
			ct2.drawImage(hit_img,250,250,200,90);
		}
		hit_text++;
	}

	if(plus_text< 30){ // it mean the plus text show 1s
		plus_y-=2;
		ct2.drawImage(plus_img,plus_x,plus_y,47,33);
		plus_text++;
	}

	for(var len = bubbles.length-1;len>0;len--){
		try{
			bubbles[len].draw(); // call bubble prototype.draw()
		}catch(err){

		}
	}
	ct.drawImage(cc2,0,0);	// draw to buffer
	ct2.clearRect(0, 0, cc2.width, cc2.height);
	fps++;
}
function drawcanvas(){
	cls();
	draw_loop = setInterval(drawcircle,1000/30);	//  1000/30 = 30fps
}
function useround(min,max){
	return Math.round(Math.random()*(max-min)+min);
}
function genBubble(){
	var bubble_normal_num = Math.round(Math.random()*bbq);
	for(var i = bubble_normal_num; i>0 ; i-- ){

		var endx;;
		var endy;
		while(1){
			endx =useround(-200,win_w+200);
			endy =useround(-200,win_h+200);

			if(	endx<0-bubble_w || endx>win_w || endy<0-bubble_h || endy>win_h){
				break;
			}
		}
		bubbles[bubbles.length] = new Bu(bid,initx,inity,endx,endy);
		bid						= bid+1 ;
	}
}
function Bu(id,x,y,endx,endy){
	this.id 		= id;
	this.x 			= x;
    this.y 			= y;
    this.endx 		= endx;
    this.endy 		= endy;
    this.opacity 	= 0;
    this.size 		= 0.3;
    this.tpl 		= 0;
    this.drawnow 	= Bu.prototype.draw();
}
Bu.prototype.draw = function(){
    var display	= this;
  	var img		= new Image();
	img.src = base_url+'img/game/ball_bingo.png';
	remove_ids =999;
   	if(display.x==999){
    	remove_ids = display.id;
    }else if(display.x<0-bubble_w || display.x>cc.width || display.y<0-bubble_h||display.y>cc.height){
    	remove_ids = display.id;
    	hit_text = 0;
    	hit_count++;

    	if(hit_count==1){
    		// gameover();
    		// leave 2 heart
    		var d = document.getElementById("heart_left");
			d.className = d.className + " heart_off";
    	}
    	if(hit_count==2){
    		// leave 1 heart
    		var d = document.getElementById("heart_center");
			d.className = d.className + " heart_off";
    	}
    	if(hit_count==3){
    		// flash
    		var d = document.getElementById("heart_right");
			d.className = d.className + " heart_flash";
    	}
    	if(hit_count>3){
    		// no heart
			gameover();
		}
    }else{
    	var toPlayerX,toPlayerY,toPlayerLength;
		toPlayerX = display.endx - display.x;
    	toPlayerY = display.endy - display.y;
	    toPlayerLength = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);
	    if(toPlayerLength!='NAN'){
	    	display.tpl = toPlayerLength;
	    }
	    toPlayerX = toPlayerX / display.tpl;
	    toPlayerY = toPlayerY / display.tpl;
	    display.x += toPlayerX *bbq_speed;
	    display.y += toPlayerY *bbq_speed;
	    if(display.size<1){
	    	display.size+=0.01;
	    }else{
	    	display.size =1;
	    }
	    if(display.opacity<1){
	    	display.opacity+= 0.02;
	    	ct2.globalAlpha = display.opacity;
		}else{
			ct2.globalAlpha = 1; //this line must set, else will flash the page...unknown error?!
		}
		ct2.drawImage(img,display.x,display.y,display.size*136,display.size*135);
   	}
}
function emp(){
	this.emp	= emp.prototype.play();
}
emp.prototype.play= function(){
}
function gameover(){
	jQuery('#life').hide();
	clearInterval(draw_loop);
	clearInterval(game_loop);
	game_status =0 ;
	hit_count = 0;
	hit_text  = 90;
	plus_text = 30;
	remove_ids = 999;
	for(var bl =bubbles.length,p=0;p<bl;p++){
		bubbles[p].x 	= 999;
	}
	bubbles 			= [];
	jQuery('#monster').hide();
	jQuery('#bumper_left,#bumper_right').hide(400,function(){
		ct.clearRect(0, 0, cc.width, cc.height); //clean canvas
		down_to_escape.fadeIn(400,function(){
			down_to_escape.animate({'margin-bottom':'10px'},500).delay(500).animate({'margin-bottom':'0px'},500);
			down_loop = setInterval(function(){
				down_to_escape.animate({'margin-bottom':'10px'},500).delay(500).animate({'margin-bottom':'0px'},500);
			},1000);
		});
		jQuery('#again_btn').fadeIn();
		jQuery('#score_board').fadeIn();
		jQuery('#share_btn').fadeIn(400,function(){
			jQuery('#score_board_score').text(score);
			jQuery('#score_board_inner').css({'margin-left':0- parseInt(jQuery('#score_board_inner').width())/2});

		});
		jQuery('#rule').show();

	});
	$('#canvas').addClass('hide');
	setup_weixin();
	down_to_escape.show();
	down_to_escape.fadeIn(400,function(){
		down_to_escape.animate({'margin-bottom':'10px'},500).delay(500).animate({'margin-bottom':'0px'},500);
		down_loop = setInterval(function(){
			down_to_escape.animate({'margin-bottom':'10px'},500).delay(500).animate({'margin-bottom':'0px'},500);
		},1100);
	});
}
function clean_bubble(){
	if(remove_ids!=999){
		for(var bl = bubbles.length-1;bl>=0;bl--){
			if( bubbles[bl].id==remove_ids){
				bubbles.splice(bl,1);
				break;
			}
		}
		mark.innerHTML= score;
	}
	if(hit_text<90){
		bubbles = [];
	}
}
function resize_win(){
	win_w 				= window.innerWidth,
	win_h	 			= window.innerHeight,
	half_w 				= win_w/2,
	half_h 				= win_h/2,
	bubble_w 		  	= 115,
	bubble_h 		  	= 115,
	bubble_hide_pos 	= -200,
	initx 				= half_w-bubble_w/2,
	inity 				= half_h-bubble_h/2,
	bubble_init_x_min 	= win_w/4,
	bubble_init_x_max 	= win_w*3.5/5,
	bubble_init_y_min 	= win_h/4,
	bubble_init_y_max 	= win_h*3.5/5;
	cc.width    		= window.innerWidth;
    cc.height   		= window.innerHeight;
    cc2.width 			= cc.width;
	cc2.height 			= cc.height;

	redborder.style.width = window.innerWidth-6+'px';
	redborder.style.height = window.innerHeight-6+'px';
}

function check_landscape(){
	/*if(window.innerWidth > window.innerHeight){	 // landscape

		bubbles 			= [];
		jQuery('.fsv_viewport').addClass('hide');
		jQuery('#wronging').removeClass('hide');
		$('.opening_arrow').hide();
		landscape 			= 1;
		stop_marker 		= 1;

	}else{
		bubbles 			= [];
		jQuery('.fsv_viewport').removeClass('hide');
		jQuery('#wronging').addClass('hide');
		if(current_page<3){
			$('.opening_arrow').show();
		}
		landscape 			= 0;
		stop_marker 		= 0;
		if(loop_time<60 && loop_time>0){
			clearInterval(draw_loop);
			drawcanvas();
		}
	}*/

	bubbles 			= [];
	jQuery('.fsv_viewport').removeClass('hide');
	jQuery('#wronging').addClass('hide');
	if(current_page<3){
		$('.opening_arrow').show();
	}
	landscape 			= 0;
	stop_marker 		= 0;
	if(loop_time<60 && loop_time>0){
		clearInterval(draw_loop);
		drawcanvas();
	}
}

function opening(){

	var opening_status=0;
	opening_timeout = setInterval(function(){
  		if(opening_status==0){
			jQuery('#opening').removeClass('opening01').addClass('opening02');
  		}else{
  			jQuery('#opening').removeClass('opening02').addClass('opening01');
  		}
  		opening_status= 1-opening_status;
	},500); //500
}
function game_reinit(){
	clearInterval(down_loop);
	down_to_escape.hide();
	jQuery('#canvas').removeClass('hide').css({'z-index':'50'});
	cls();
	bubbles 	= [];
	score 	  	= 0;
	bbq 		= 2;
	bbq_speed   = 5;
	jQuery('#score_board').hide();
	jQuery('#again_btn').hide();
	jQuery('#share_btn').hide();
	jQuery('#score_board').hide();
	jQuery('#monster').hide();
	jQuery('#mark_inner').text(score);
	jQuery('.heart').removeClass('heart_off heart_flash');
}
function game_body(){
	clearInterval(down_loop);
	// jQuery('#video_btn').hide();
	jQuery('#rule').hide();
	jQuery('#sb').hide();
	jQuery('#description').hide();
	jQuery('#life').show();
	jQuery('#countdown_3').fadeIn(0);
	jQuery('#countdown_2').delay(1000).show(0);
	jQuery('#countdown_1').delay(2000).fadeIn(0);
	jQuery('#countdown_go').delay(3000).fadeIn(0);

	setTimeout(function(){
		jQuery('#countdown_3').delay(3500).hide();
		jQuery('#countdown_2').delay(3500).hide();
		jQuery('#countdown_1').delay(3500).hide();
		jQuery('#countdown_go').delay(3500).hide();
		if(landscape==0){
			jQuery('#bumper_left').show();
			jQuery('#bumper_right').show();
			jQuery('#canvas').css({'z-index':'90'})
			game_status = 1;
			loop_time 	= game_time;
			jQuery('.page2').hide();
			jQuery('#monster').show().addClass('monster_move_2');
			jQuery(this).hide();

			genBubble();
			drawcanvas();
			game_loop = setInterval(function(){
				if(stop_marker==0){
					loop_time-=0.5;  		// 1= rand 60 times, 0.5 = rand 120 times
					if(loop_time>0){
						if(loop_time<15){
							bbq=5;
							bbq_speed  = 8;
						}else if(loop_time<30){
							bbq=3;
							bbq_speed  = 6;
						}else if(loop_time<50){
							bbq=3;
							bbq_speed  = 5;
						}else if(loop_time<70){
							bbq=3;
							bbq_speed  = 4;
						}else if(loop_time<80){
							bbq=2;
							bbq_speed  = 5;
						}
						genBubble();
					}else{
						// end of game
						clearInterval(game_loop);
						clearInterval(draw_loop);
						cls();
						jQuery('#score_board').fadeIn();
						jQuery('#again_btn').fadeIn();
						jQuery('#share_btn').fadeIn(400,function(){
							jQuery('#score_board_score').text(score);
						});
					}
					// debug
					// document.getElementById('debug').innerHTML= 'fps:'+fps+',timr:'+loop_time;
					// console.log('fps:'+fps);
					fps = 0;
				}else{
					clearInterval(draw_loop);
				}
			},500); // 1000:rand 60 times, 500:rand 120 times
		}
	},4000);
}
function score_range(score){
	var range;
	if(score<50){
		range = useround(20,40);
	}else if(score<70){
		range = useround(41,50);
	}else if(score<80){
		range = useround(51,60);
	}else if(score<90){
		range = useround(61,70);
	}else if(score<100){
		range = useround(71,80);
	}else if(score<120){
		range = useround(81,90);
	}else{
		range = useround(91,99);
	}
	return range;
}
function setup_weixin(){
    if(is_weixin()){
        // // NEW API
        document.title ="你为你的鼻子皮肤奋战了"+score+"次，击败了全国"+score_range(score)+"%过敏者，下次再战！";
    }
}
function is_weixin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
     } else {
        return false;
    }
}

function landing_init(){

	if($(window).height()<950){
		$('#final_content').css({'top':820});
	}

	FastClick.attach(document.body);
	var doubleTouchStartTimestamp = 0;

	var delay = 300;
	document.body.addEventListener("touchstart", function (event) {
		var now = +(new Date());
		if (doubleTouchStartTimestamp + delay > now) {
			event.preventDefault();
			event.stopPropagation();
		}
		doubleTouchStartTimestamp = now;
	}, false);

	// init
	var mov = $('#skin');
	queue(function(){ mov.css({'background-position': '0px 0px'}) }, 100);
	queue(function(){ mov.css({'background-position': '-445px 0px'}) }, 100);
	queue(function(){ mov.css({'background-position': '-1335px 0px'}) }, 100);
	queue(function(){ mov.css({'background-position': '-1782px 0px'}) }, 100);
	queue(function(){ mov.css({'background-position': '-2227px  0px'}) }, 100);

	clearTimeout(_queue_runner);
	run_queue();
	skin_loop = setInterval(function(){
		queue(function(){ mov.css({'background-position': '0px 0px'}) }, 100);
		queue(function(){ mov.css({'background-position': '-445px 0px'}) }, 100);
		queue(function(){ mov.css({'background-position': '-1335px 0px'}) }, 100);
		queue(function(){ mov.css({'background-position': '-1782px 0px'}) }, 100);
		queue(function(){ mov.css({'background-position': '-2227px  0px'}) }, 100);

	},500);

	fsv = FlipsnapVertical('.flipsnapVertical',{
		distance : 768,
		maxPoint : 4
	});

	fsv.element.addEventListener('fstouchmove', function(ev) {
  		if(ev.direction==-1 && current_page ==3){
  			ev.preventDefault();
  		}
		if(current_page==3 && !$('#score_board').is(":visible")){
			ev.preventDefault();
		}
		share_fire=0;
		video_fire=0;
	});

	fsv.element.addEventListener('fstouchend', function(ev) {
		// leave page
		if(ev.originalPoint==0){
			clearInterval(skin_loop);
			ClickEvent('ClarityneH5','CRT_H5/Home_slide1','slide');
		}
		if(ev.originalPoint==1){
			clearInterval(nose_loop);
			ClickEvent('ClarityneH5','CRT_H5/Home_slide2','slide');
		}
		if(ev.originalPoint==2){
			clearInterval(bacteria_loop);
			ClickEvent('ClarityneH5','CRT_H5/Home_slide3','slide');
		}
		if(ev.originalPoint==3){
			clearInterval(sn_loop);
			clearInterval(down_loop);
		}

		current_page = ev.newPoint;

		// enter page
		if(ev.newPoint==0){
			var mov = $('#skin');
			queue(function(){ mov.css({'background-position': '0px 0px'}) }, 100);
			queue(function(){ mov.css({'background-position': '-445px 0px'}) }, 100);
			queue(function(){ mov.css({'background-position': '-1335px 0px'}) }, 100);
			queue(function(){ mov.css({'background-position': '-1782px 0px'}) }, 100);
			queue(function(){ mov.css({'background-position': '-2227px  0px'}) }, 100);

			clearTimeout(_queue_runner);
			run_queue();
			skin_loop = setInterval(function(){
				queue(function(){ mov.css({'background-position': '0px 0px'}) }, 100);
				queue(function(){ mov.css({'background-position': '-445px 0px'}) }, 100);
				queue(function(){ mov.css({'background-position': '-1335px 0px'}) }, 100);
				queue(function(){ mov.css({'background-position': '-1782px 0px'}) }, 100);
				queue(function(){ mov.css({'background-position': '-2227px  0px'}) }, 100);

			},500);
		}
		if(ev.newPoint== 1){
			var mov = $('#nose');
			queue(function(){ mov.css({'background-position': '0px 0px'}) },200);		// 85);//200);
			queue(function(){ mov.css({'background-position': '-506px 0px'}) }, 300);	//127);//300);
			queue(function(){ mov.css({'background-position': '-1010px 0px'}) }, 500);	//212);// 500);
			queue(function(){ mov.css({'background-position': '-1515px 0px'}) },200);	// 85);//200);
			queue(function(){ mov.css({'background-position': '-2021px  0px'}) }, 500);//212);//500);

			clearTimeout(_queue_runner);
			run_queue();
			nose_loop = setInterval(function(){
				queue(function(){ mov.css({'background-position': '0px 0px'}) },200);		// 85);//200);
				queue(function(){ mov.css({'background-position': '-506px 0px'}) },300);	// 127);//300);
				queue(function(){ mov.css({'background-position': '-1010px 0px'}) },500);	//212);// 500);
				queue(function(){ mov.css({'background-position': '-1515px 0px'}) },200);	// 85);//200);
				queue(function(){ mov.css({'background-position': '-2021px  0px'}) },500);	// 212);//500);

				clearTimeout(_queue_runner);
				run_queue();
			},1800);

			// $.fn.fullpage.setAllowScrolling(false,'up');
		}
		if(ev.newPoint ==2){
			jQuery('#wechat_page').hide();
			var mov = $('#bacteria');
			queue(function(){ mov.css({'background-position': '0px 0px'}) }, 200);
			queue(function(){ mov.css({'background-position': '-434px 0px'}) }, 200);
			clearTimeout(_queue_runner);
			run_queue();
			bacteria_loop = setInterval(function(){
				queue(function(){ mov.css({'background-position': '0px 0px'}) }, 200);
				queue(function(){ mov.css({'background-position': '-434px 0px'}) }, 200);
				clearTimeout(_queue_runner);
				run_queue();
			},450);
		}
		if(ev.newPoint==3){
			if(hm==0){
				soundbg.stop();
				soundbg_status =0;
			}
			opening_arrow.hide();
			var mov = $('#skin_nose');
			queue(function(){ mov.css({'background-position': '0px 0px'}) }, 300);
			queue(function(){ mov.css({'background-position': '-597px 0px'}) }, 300);
			clearTimeout(_queue_runner);
			run_queue();
			sn_loop = setInterval(function(){
				if(game_status==0 && !$('#score_board').is(":visible") ){
					queue(function(){ mov.css({'background-position': '0px 0px'}) }, 300);
					queue(function(){ mov.css({'background-position': '-597px 0px'}) }, 300);
					clearTimeout(_queue_runner);
					run_queue();
				}else{
					clearInterval(sn_loop);
				}
			},600);

			if($('#score_board').is(":visible")){
				down_to_escape.show();
			}

		}
		if(ev.newPoint==4){
			jQuery('#wechat_page').hide();
			down_to_escape.hide();
			if(win_h>=1030){
				var plus =1030*0.3595;
			}else{
				var plus= 1030*0.3595-(1030-win_h)*0.1;
			}
			$('#video_animation').css({'top':plus});
		}


		fsv.refresh();
	}, false);

	jQuery('#preload_imgs').show(); //preload game imgs
	jQuery('#loading').fadeOut();
	// opening();

	// setTimeout(function(){
	// 	clearInterval(opening_timeout);
	// 	jQuery('#opening').hide();
	// 	jQuery('#description').show();
	// 	jQuery('#sb').show();
	// },2500);

	jQuery('#description').show();
	jQuery('#sb').show();

	check_landscape();
	var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
	window.addEventListener(orientationEvent, function() {
		bubbles 	= [];
		setTimeout(function(){
			//too fast not work wo, therefore add 0.5s timeout to update canvas
			resize_win();
			check_landscape();
		},500);
	});

	hit_img.src = base_url+'img/game/hit_text03.png';
	plus_img.src = base_url+'img/game/playing_addMark_txt.png';
	resize_win();
	window.onresize = function(){

	    cls();
	    resize_win();
	    check_landscape();
	}

	jQuery('#description .monster,#videopage .monster').addClass('monster_move_1');

	// page 1
	jQuery('#description .monster').on('click',function(){
		if(game_status==0){
			jQuery('.page1').hide();
			jQuery('.page2').show();
			jQuery('#sb').show();
		}
	});

	jQuery('#video_btn').on('touchstart',function(){
		video_fire=1;
	});

	jQuery('#video_btn').on('mouseup touchend',function(){
		if(video_fire==1){
			jQuery('#video_btn').trigger('click');
			fsv.moveToPoint(4);
			if(jQuery('#video iframe').length>0){
				jQuery('#video iframe').remove();
			}
			var iframe = document.createElement('iframe');
			iframe.src="http://v.qq.com/iframe/player.html?vid=n0162s7m8ol&tiny=0&auto=0";
			document.getElementById('video').appendChild(iframe);
			jQuery('#video').removeClass('hide');
		}
	});

	jQuery('#video_close').on('touchstart',function(){
		jQuery('#video').addClass('hide');
		if(jQuery('#video iframe').length>0){
			jQuery('#video iframe').remove();
		}
	});

	jQuery('#rule').on('touchstart',function(){
		ClickEvent('ClarityneH5','CRT_H5/Home_GameRule','click');
		jQuery('#rule_page').show();
	});

	jQuery('#rule_close').on('touchstart',function(){
		jQuery('#rule_page').hide();
	});

	jQuery('#share_btn').on('touchstart',function(){
		share_fire=1;
	});

	jQuery('#share_btn').on('mouseup touchend',function(){
		if(share_fire==1){
			ClickEvent('ClarityneH5','CRT_H5/Invite_Friend','click');
			jQuery('#wechat_page').show();
			fsv.moveToPoint(3);
		}
	});

	jQuery('#wechat_page').on('touchstart',function(){
		jQuery('#wechat_page').hide();
	});

	// game start btn
	jQuery('#sb').on('touchstart',function(){
		ClickEvent('ClarityneH5','CRT_H5/Home_start','click');
		$('#skin_nose').addClass('hide');
		$('#mark').show();
		game_body();
	});

	// again
	jQuery('#again_btn').on('touchstart',function(){
		ClickEvent('ClarityneH5','CRT_H5/Start_Again','click');
		game_reinit();
		game_body();
	});

	jQuery('#redborder').on('touchstart',function(event){
		event.preventDefault();
	});

	// click bubble
	cc.addEventListener('touchstart', function(event) {
		event.preventDefault();
		event.stopPropagation();
		var click_x = Math.round(event.targetTouches[0].pageX);
		var click_y = Math.round(event.targetTouches[0].pageY);
		for(var L = bubbles.length-1; L>=0;L--  ){
			if(		click_x < bubbles[L].x+115
				&&	click_x > bubbles[L].x
				&&	click_y < bubbles[L].y+115
				&&	click_y > bubbles[L].y
				){
					plus_text 		= 0;
					plus_x 			= click_x;
					plus_y 			= click_y;
					bubbles[L].x 	= 999;
					score+=1;
					sound2.play();
					break;
			}
		}
		if(game_status!=0){
			mark.innerHTML= score;
		}
	}, false);

	if(hm==0){
		sound = new Howl({
		  urls: [site+'audio/Squish.ogg', site+'audio/Squish.mp3']
		});
		sound2 = new Howl({
		  urls: [site+'audio/bubble.ogg', site+'audio/bubble.mp3']
		});



		$('.music_cover').on('touchstart',function(){
			if(soundbg_status==0){
				soundbg.play();
				soundbg_status =1;
				$('.music_btn').addClass('music_open').removeClass('music_close');
			}else if(soundbg_status==1 || soundbg_status==2){
				soundbg.pause();
				soundbg_status =0;
				$('.music_btn').addClass('music_close').removeClass('music_open');
			}

		});
	}else{
		sound = new emp();
		sound2 = new emp();

		$('.music_cover').remove();
		$('.music_btn').remove();
	}
}


jQuery(window).load(function(){
	// document.getElementById('debug').innerHTML=navigator.userAgent;
	var ua = navigator.userAgent.toLowerCase();
    var isloop = false;
    var music  = site+'audio/game_music_20s.mp3';

    if(ua.search("build/hm")>=0){
    	hm=1;
    }else if(ua.search("android")>=0) {

    	isloop = false;
    	music  = site+'audio/game_music.mp3';
    }else{
		isloop = true;
		music  = site+'audio/game_music_20s.mp3';
    }
    // load bg music resource

    $.ajax({
		url:music,
		type:'HEAD',
		error: function(){
			hm=1;
			if(jQuery('body').attr('data-page')=='landing'){
				landing_init();
			}
		},
		success: function(){
			soundbg = new Howl({
				urls: [music],
				loop: isloop,
				onload:function(){
					if(jQuery('body').attr('data-page')=='landing'){
						landing_init();
					}
				}
			});
		}
	});

});
