function lyricParsing(option){
	this.ver = "0.0.1"
	this.audio = typeof option.audio!="undefined" ? option.audio : undefined;
	this.canvas = typeof option.canvas!="undefined" ? option.canvas : undefined;
	this.audiourl = typeof option.audiourl!="undefined" ? option.audiourl : undefined;
	this.lrc = typeof option.lrc!="undefined" ? option.lrc : undefined;
	this.debug = typeof option.debug!="undefined" && typeof option.debug=="boolean" ? option.debug : false;
	this.Global_lrc_offset = typeof option.offset!="undefined" && typeof option.offset=="number" ? option.offset : 0;
	this.rander_font = typeof option.rander_font!="undefined" && typeof option.rander_font=="string" ? option.rander_font : "32px Microsoft YaHei";
	this.oLRC = {
	    ti: "", //歌曲名
	    ar: "", //演唱者
	    al: "", //专辑名
	    by: "", //歌词制作人
	    offset: 0, //时间补偿值，单位毫秒，用于调整歌词整体位置
	    ms: [] //歌词数组{t:时间,c:歌词}
	};
	this.Refresh_interval = typeof option.reftime != "undefined" ? option.reftime : 16;
	
	///歌词部分
	this.lrc_top = 0;
	this.lrc_offset = 0;
	
	this.ltext = "Hello World";
	this.ltext2 = "Hello World2";

	this.ltext_p = 0;
	this.ltext2_p = 0;
	
	this.timer = setInterval(() => {
		this.ref_lrc();
	}, this.Refresh_interval);
	
	//canvas
	this.curX = -400
	this.curX2 = -400
	
	this.leftX1 = 0;
	this.leftX2 = 0;
	
	this.lrcup = true;
	
	this.canvase = {
		width:this.canvas.width,
		height:this.canvas.height
	}
	
	//初始化
	this.init = function(lrc){
		if(lrc){
			this.lrc = lrc
			this.read_lrc();
		}
		this.audio.setAttribute("src",this.audiourl)
	}

	this.clear = function(){
		clearInterval(this.timer)
	}
	
	var Lrc_query={
		//lrc_height:34, //每行歌词高度 class = lrc
		ci:0, // 歌词数量
		dishang:0 //当前显示行
	}
	
	//歌词时间转换
	function lrc_time_sa(timea) {
		let time_expression = /([0-9]+):([0-9]+)\.([0-9]+)/i,seconds = timea.replace(time_expression, function(a, b, c, d) {return Number(b * 60) + Number(c) + parseFloat('0.' + d)});
		return seconds;
	}
	
	//读取歌词
	this.read_lrc = function(){
		//console.group('歌词读取日志');
		this.oLRC = {
			ti: "", //歌曲名
			ar: "", //演唱者
			al: "", //专辑名
			by: "", //歌词制作人
			olrc: true,//是否是单行歌词
			offset: 0, //时间补偿值，单位毫秒，用于调整歌词整体位置
			ms: [] //歌词数组{t:时间,c:歌词}
		};
		let lrc = this.lrc
		
		//判断是否是0
		if(lrc.length==0) return;
		let lrcs = lrc.split('\n');//用回车拆分成数组
		if(this.debug)console.log(lrcs);
		
		//测试是单行歌词还是渐进式歌词
		for(let i=0;i<lrcs.length;i++){
			let t1 = lrcs[i].indexOf('[');
			//console.log(lrcs[i]);
			if(t1 == -1){
				continue;
			}else{
				let t2 = lrcs[i].indexOf(']',t1);
				//console.log(t1,t2)
				if(t2 == -1){
					continue;
				}else{
					let t4 = lrcs[i].substring(t1 + 1,t2);
					let t5 = t4.split(':');
					//console.log(t4,t5)
					if(!isNaN(parseInt(t5[0]))) {
						let t3 = lrcs[i].indexOf('[',t2);
						//console.log(t3)
						if(t3 == -1){
							this.oLRC.olrc = true;
							if(this.debug)console.log('单行歌词');
						}else{
							if(t3 - t2 > 1){
								this.oLRC.olrc = false;
								if(this.debug)console.log('多行歌词');
							}else{
								this.oLRC.olrc = true;
								if(this.debug)console.log('单行歌词');
							}
						}
					}
				}
			}
		}
		
		if(this.oLRC.olrc){
			for(let i in lrcs) {//遍历歌词数组
				lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
				//console.log('去除前后空格' + lrcs[i]);
			    let t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));//取[]间的内容
			    let s = t.split(":");//分离:前后文字  例如:[by:aaa]分离成 [by,aaa]
				//console.log(s[0]);
				//判断:前是否是数字以判断是否是时间戳
			    if(isNaN(parseInt(s[0]))) { //不是数值
					//判断不是数字
			        for (let i in this.oLRC) {
			            if (i != "ms" && i == s[0].toLowerCase()) {
			                this.oLRC[i] = s[1];
			            }
			        }
			    }else { //是数值
					//是数值则为歌词
			        let arr = lrcs[i].match(/\[(\d+:.+?)\]/g);//提取时间字段，可能有多个  | 例如: [00:18.50][01:21.92]ok  代表18秒和1分21秒有歌词ok 合并成 [00:18.50]ok [01:21.92]ok
			        let start = 0;
			        for(let k in arr){
			            start += arr[k].length; //计算歌词位置
			        }
			        let content = lrcs[i].substring(start);//获取歌词内容
			        for (let k in arr){
			            let t = arr[k].substring(1, arr[k].length-1);//取[]间的内容
			            let s = t.split(":");//分离:前后文字
			            this.oLRC.ms.push({//对象{t:时间,c:歌词}加入ms数组
			                t: parseFloat((parseFloat(s[0])*60+parseFloat(s[1])).toFixed(3)),
			                c: content
			            });
			        }
			    }
			}
			let i = this.oLRC.ms.length;
			
			//处理排序
			while (i > 0) {
				for (let j = 0; j < i - 1; j++) {
					if (this.oLRC.ms[j].t > this.oLRC.ms[j + 1].t || this.oLRC.ms[j].t == this.oLRC.ms[j + 1].t) {
						let temp_exc = this.oLRC.ms[j];
						this.oLRC.ms[j] = this.oLRC.ms[j + 1];
						this.oLRC.ms[j + 1] = temp_exc;
					}
				}
				i--;
			}
			
			Lrc_query.ci = this.oLRC.ms.length;
		}else{
			let lpdall = {
				t: [],
				c: [],
				al: []
			}
			let lrccount = 0;
			for(let i in lrcs) {//遍历歌词数组
				lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
				//console.log('去除前后空格' + lrcs[i]);
			    let t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]"));//取[]间的内容
			    let s = t.split(":");//分离:前后文字  例如:[by:aaa]分离成 [by,aaa]
				//console.log(s[0]);
				//判断:前是否是数字以判断是否是时间戳
			    if(isNaN(parseInt(s[0]))) { //不是数值
					//判断不是数字
			        for (let i in this.oLRC) {
			            if (i != "ms" && i == s[0].toLowerCase()) {
			                this.oLRC[i] = s[1];
			            }
	
						if(s[0] == "offset"){
							this.oLRC.offset = parseInt(s[1])
							console.log("歌词偏移:",this.oLRC.offset)
						}
			        }
			    }else { //是数值
					//是数值则为歌词
					let arr2 = lrcs[i].split(']');
					let arr3 = [];
					let arr4 = [];
					let appendString = "";//完整句
					for (let l in arr2) {
						if(arr2[l].indexOf('[') != -1 && l > 0){
							let lq = l - 1;
							arr3[lq] = arr2[l].substring(0,arr2[l].indexOf('['));
							//lpd.c[lq] = arr2[l].substring(0,arr2[l].indexOf('['));
							appendString += arr3[lq];
						}else{
							if(l > 0){
								let lq = l - 1;
								arr3[lq] = arr2[l].substring(arr2[l - 1].indexOf('['),arr2[l].length);
								appendString += arr3[lq];
							}
						}
						
						if(arr2[l].indexOf('[') != -1 && arr2[l].length > 0){
							let kpd = arr2[l]. substring(arr2[l].indexOf('[') + 1,arr2[l].length);
							let s = kpd.split(":");//分离:前后文字
							arr4[l] = parseFloat((parseFloat(s[0])*60+parseFloat(s[1])).toFixed(3));
						}
					}
					
					//console.log(arr3,arr4);
					lpdall.t[lrccount] = arr4;//每一句时间 数组
					lpdall.c[lrccount] = arr3;//每一句歌词 数组
					lpdall.al[lrccount] = appendString;//完整句歌词 数组
					lrccount++;//计数
			    }
			}
			//console.log(lpdall)
			let i = this.oLRC.ms.length;
			if(this.debug)console.log(this.oLRC);
			this.oLRC.ms = lpdall;
			Lrc_query.ci = this.oLRC.ms.t.length;
		}
		//console.groupEnd();
		//lrc_append();
		if(this.debug)console.log(this.oLRC)
		this.render();
	}
	
	this.ref_lrc = function(){
		let p_status=this.audio.paused;
		let t_status=this.audio.currentTime + (this.Global_lrc_offset / 1000) + (this.oLRC.offset / 1000);
		if(this.oLRC.olrc){
			if(!p_status){
				//if(this.debug)console.log(p_status,this.oLRC.olrc);
				let time_s = t_status;
				for (let a = 0; a < Lrc_query.ci; a++) { //循环
					if (this.oLRC.ms[a].t < time_s) {
						let con = this.canvas.getContext("2d");
						con.font = this.rander_font;
						con.fillStyle = "coral";
						if (Lrc_query.ci > 1) {
							let lens = this.oLRC.ms.length;
							if(a + 1 < Lrc_query.ci){
								if(this.oLRC.ms[a+1].t > time_s){
									if(this.debug)console.log((this.oLRC.ms[a].t - time_s).toFixed(4))
									let k = [-1,-1]
									//除最后一行外
									k[0] = a;	//上
									k[1] = a + 1;	//下
									
									let upds = false;
									if(this.lrcup){
										if(this.ltext_p != k[0] && this.ltext2_p != k[1]){
											upds = !upds;
										}
									}else{
										if(this.ltext_p != k[1] && this.ltext2_p != k[0]){
											upds = !upds;
										}
									}
									
									if(upds){
										this.lrcup = !this.lrcup
									}

									this.ltext = this.oLRC.ms[this.ltext_p].c;
									this.ltext2 = this.oLRC.ms[this.ltext2_p].c;
									
									if(this.lrcup){
										this.ltext_p = a
										this.ltext2_p = a + 1; 
										
										this.curX = con.measureText(this.ltext).width;
										this.curX2 = 0;
									}else{
										this.ltext_p = a + 1
										this.ltext2_p = a; 
										
										this.curX2 = con.measureText(this.ltext2).width;
										this.curX = 0;
									}
									this.render();
								}
							}else{
								//最后一行
							}
						}
					}
				}
				time_s
			}
		}else{
			if(!p_status){
				let time_s = t_status; //当前播放时间
				for (let a = 0; a < Lrc_query.ci; a++) { //循环
					if (this.oLRC.ms.t[a][0] < time_s) {
						let con = this.canvas.getContext("2d");
						con.font = this.rander_font;
						con.fillStyle = "coral";
						if (Lrc_query.ci > 1) {
							//console.log(a,Lrc_query.ci,a + 1 > Lrc_query.ci)
							let lens = this.oLRC.ms.t[a].length;
							let t_con = "";	//已唱的歌词
							let p = 0;		//字符长度 用于判断字的位置
							//判断这句下面是否还有歌词 没有就是最后一句
							if(a + 1 < Lrc_query.ci){
								if (this.oLRC.ms.t[a+1][0] > time_s) {
									//if(this.debug)console.log(this.oLRC.ms.t[a]);
									let k = [-1,-1]
									for(let g=0;g<lens;g++){
										if(this.oLRC.ms.t[a][g] < time_s){
											t_con += this.oLRC.ms.c[a][g];		//已唱的歌词
											k[0] = a;	//上
											k[1] = a + 1;	//下
											p = g;
										}
									}
									if(this.debug)console.log(t_con);
									let upds = false;
									if(this.lrcup){
										if(this.ltext_p != k[0] && this.ltext2_p != k[1]){
											upds = !upds;
										}
									}else{
										if(this.ltext_p != k[1] && this.ltext2_p != k[0]){
											upds = !upds;
										}
									}
									
									if(upds){
										//对调
										this.lrcup = !this.lrcup
									}
									
									if(this.lrcup){
										this.ltext_p = a
										this.ltext2_p = a + 1; 
									}else{
										this.ltext_p = a + 1
										this.ltext2_p = a; 
									}

									this.ltext = this.oLRC.ms.al[this.ltext_p];
									this.ltext2 = this.oLRC.ms.al[this.ltext2_p];
									
									let gpps = con.measureText(this.oLRC.ms.c[a][p]).width;//当前唱的字的宽度
									//console.log((g +1) < (lens - 1), g +1,lens - 1)
									if((p + 1) < lens){ //判断是否到最后一个字
										//console.log(con.measureText(t_con).width,con.measureText(ltext).width)
										let gpps2 = con.measureText(t_con).width; 					//计算当前已唱部分宽度
										let ggp = this.oLRC.ms.t[a][p+1] - this.oLRC.ms.t[a][p]; 	//当前行下一个字时间差
										let ggp2 = this.oLRC.ms.t[a][p+1] - time_s;					//计算下一个字离当前时间有多久
										if(this.lrcup){
											this.curX = (gpps2 - gpps) + ((Math.abs(1 - (ggp2 / ggp))).toFixed(3) * gpps);
										}else{
											this.curX2 = (gpps2 - gpps) + ((Math.abs(1 - (ggp2 / ggp))).toFixed(3) * gpps);
										}
										//当前已唱宽度 + 当前正在唱的百分比 * 当前唱的字的宽度
										//console.log(gpps,gpps2,ggp,ggp2,this.curX)
										//console.log(oLRC.ms.c[a][g],(Math.abs(1 - (ggp2 / ggp))).toFixed(3));
									}else{
										//是最后一个字就设置为这一句歌词的宽度
										if(this.lrcup){
											this.curX = con.measureText(t_con).width;
										}else{
											this.curX2 = con.measureText(t_con).width;
										}
									}
									
									//刷新另外一句的进度
									if(this.lrcup){
										if(this.curX > this.canvase.width){
											this.leftX1 = -(this.curX - this.canvase.width);
											//console.log(this.leftX1)
										}
										this.curX2 = 0;
										this.leftX2 = 0;
									}else{
										if(this.curX2 > this.canvase.width){
											this.leftX2 = -(this.curX2 - this.canvase.width);
											//console.log(this.leftX2)
										}
										this.curX = 0;
										this.leftX1 = 0;
									}
								}
							}else{
								//最后一句
								for(let g=0;g<lens;g++){
									if(this.oLRC.ms.t[a][g] < time_s){
										t_con += this.oLRC.ms.c[a][g];
										p = g;
									}
								}
								
								if(this.oLRC.ms.al[this.oLRC.ms.al.length - 1] == this.ltext){
									this.ltext2 = "";
								}else{
									this.ltext = "";
								}
								
								if (this.oLRC.ms.t[a][p+1] > time_s) {
									let gpps = con.measureText(this.oLRC.ms.c[a][p]).width;
									if(p < lens - 1){
										//console.log(con.measureText(t_con).width,con.measureText(ltext).width)
										let con = this.canvas.getContext("2d")
										let gpps2 = con.measureText(t_con).width;
										let ggp = this.oLRC.ms.t[a][p+1] - this.oLRC.ms.t[a][p];
										let ggp2 = this.oLRC.ms.t[a][p+1] - time_s;
										if(!this.lrcup){
											this.curX = (gpps2 - gpps) + ((Math.abs(1 - (ggp2 / ggp))).toFixed(3) * gpps);
											if(this.curX > this.canvase.width){
												this.leftX1 = -(this.curX - this.canvase.width);
												//console.log(this.leftX1)
											}
											this.curX2 = 0;
										}else{
											this.curX2 = (gpps2 - gpps) + ((Math.abs(1 - (ggp2 / ggp))).toFixed(3) * gpps);
											if(this.curX2 > this.canvase.width){
												this.leftX2 = -(this.curX2 - this.canvase.width);
												//console.log(this.leftX2)
											}
											this.curX = 0;
										}
										//console.log(oLRC.ms.c[a][g],(Math.abs(1 - (ggp2 / ggp))).toFixed(3));
									}else{
										if(!this.lrcup){
											this.curX = gpps2;
										}else{
											this.curX2 = gpps2;
										}
									}
								}
							}
						}
						con = null;
					} else {
						continue;
					}
				}
				time_s = null;
			}
		}
		p_status = null;
		t_status = null;
		this.render();
	}
	
	/* canvas */
	this.render = function(){
		let con = this.canvas.getContext("2d")
		con.clearRect(0, 0, this.canvase.width, this.canvase.width);
		con.save();
		//上半部分
		
		//先绘制第一句歌词 (整句)
		con.save();
		con.font = this.rander_font;
		con.fillStyle = "#abcdef";
		con.fillText(this.ltext, this.leftX1, 32);
		con.restore();
	
		con.save();
		con.beginPath();
		
		//裁剪没有播放到的位置
		con.rect(this.leftX1, 0, this.curX, 90);
		con.closePath();
		con.clip();
	
		//绘制当前播放歌词
		con.font = this.rander_font;
		con.fillStyle = "coral";
		con.fillText(this.ltext, this.leftX1, 32);
		con.restore();
		
		
		//下半部分歌词
		con.save();
		con.font = this.rander_font;
		con.fillStyle = "#abcdef";
		con.fillText(this.ltext2, this.leftX2, 72);
		con.restore();
		
		con.save();
		con.beginPath();
		
		con.rect(this.leftX2, 32, this.curX2, 60);
		con.closePath();
		con.clip();
		
		con.font = this.rander_font;
		con.fillStyle = "coral";
		con.fillText(this.ltext2, this.leftX2, 72);
		con.restore();
	}

	function secondToDate(result) {
		let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
		let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
		return result = m + ":" + s;
	}	
}