var express = require("express");
var app = express();
var mysql = require('mysql');
var mysqlsyn = require('sync-mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1234',
  database : 'bot'
});

var connectionsyn = new mysqlsyn({
	host     : 'localhost',
	user     : 'root',
	password : '1234',
	database : 'bot'
});


connection.connect();

var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');
var moment = require('moment');
moment().format();
var apiRouter = express.Router();

var port = process.env.PORT || 3000;



app.use(logger('dev', {}));
app.use(bodyParser.json());

app.use('/api', apiRouter);
app.use(express.static(__dirname+'/public'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//서버 test용 한지은 이민지
app.get('/', function(req, res) {
	res.render('hello');
});

apiRouter.post('/sayHello', function(req, res) {
    var responseBody = {
	version: "2.0",
	template: {
	    outputs: [
		{
		    simpleText: {
			text: "hello I'm Ryan"
		    }
		}
	    ]
	}
    };

    res.status(200).send(responseBody);
    });

apiRouter.post('/showHello', function(req, res) {
    console.log(req.body);

    var responseBody = {
	version: "2.0",
	template: {
	    outputs: [
		    {
			simpleImage: {
			    imageUrl: "https://t1.daumcdn.net/friends/prod/category/M001_friends_ryan2.jpg",
			    altText: "hello I'm Ryan"
			}
		    }
		]
	    }
	};

	res.status(200).send(responseBody);
});


apiRouter.post('/checkPeriod', function(req, res){
	console.log(req.body);
	var responseBody = {
		version: "2.0",
		data: {
			"check": "good" 
		}
		
	};	


		
	res.status(200).send(responseBody);
})



apiRouter.post('/welcome', function(req, res){
	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var sql = "SELECT * FROM user WHERE kakaoId = ?;";
    connection.query(sql, [id], function(err, result){
        console.log(result);
        if(result.length == 0){ // 가입 안함
            var responseBody = {
				"version": "2.0",
				"template": {
				  "outputs": [
					{
					  "basicCard": {
											"description": "안녕하세요! 카톡으로 간편하게 주택 청약 관련 서비스 이용을 도와드리는 청약봇입니다.\n\n 청약점수계산·당첨확률예상 등 청약 관련 서비스를 제공합니다. 현재 보유하고 계신 청약이 있으시다면 [계좌등록]을 눌러서 서비스를 이용해보세요.😊🏠",
						"thumbnail": {
						  "imageUrl": "https://i.imgur.com/X83c7Wl.jpg"
						},
						"buttons": [
						  {
							"action": "webLink",
							"label": "계좌등록",
							"webLinkUrl": "http://13.124.84.213/api/enroll?id="+id
						  },
						  {
							"action": "block",
							"label": "시작하기",
							"blockId": "5d2c1cc2ffa7480001003c46"
						  },
						  {
							"action":  "block",
							"label": "계좌없이 시작하기",
							"blockId": "5d30356eb617ea0001da2890"
						  }
						]
					  }
					}
				  ]
				}
			  };

			  res.status(200).send(responseBody);		  
	}else{// 계좌등록 했으면
		//가점 다시 계산하기
		//청약 추천 보기
		var responseBody = {
			"version": "2.0",
			"template": {
			  "outputs": [
				{
				  "basicCard": {
					
					"description": "안녕하세요! 카톡으로 간편하게 주택 청약 관련 서비스 이용을 도와드리는 청약봇입니다.\n\n 청약점수계산·당첨확률예상 등 청약 관련 서비스를 제공합니다.😊🏠",
					"thumbnail": {
					  "imageUrl": "https://i.imgur.com/X83c7Wl.jpg"
					},
					"buttons": [
					{
						"action": "block",
						"label": "예치금 다시 입력하기",
						"blockId": "5d721cddb617ea0001c19bb7"
					},
					  {
						"action": "block",
						"label": "가점 다시 계산하기",
						"blockId": "5d2be86bb617ea000117907f"
						
					  },
					  {
						"action":  "block",
						"label": "청약주택 추천받기",
						"blockId": "5d2a08abb617ea0001178d79"
					  }
					]
				  }
				}
			  ]
			}
		  };

		  res.status(200).send(responseBody);

	}
})
})

app.post('/join', function(req, res){
    var body = req.body;
    var accessToken = req.body.accessToken;
	var useNum = req.body.useseqnum;
	var kakaoId = req.body.kakaoId;
	console.log(body);
	console.log(accessToken, useNum);
	//var sql = "INSERT INTO user (kakaoId, name, accessToken, useseqnum) VALUES ('"+id+"','한지은','6f806275-5e56-4a66-9bf2-10129ad56752','1100035222')";
	if(accessToken.length == 0){
		console.log("계좌인증부터하시라!")
		res.json(-1);	
	}else{
    var sql = 'INSERT INTO user (kakaoId,  accessToken, useseqnum) VALUES (?,?,?);'
    connection.query(sql,[kakaoId, accessToken, useNum], function (error, results) {
      if (error) throw error;  
      else {
          console.log(this.sql);
          res.json(1);
      }
    });}
})

apiRouter.post('/testenroll', function(req,res){

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var sql = "INSERT INTO user (kakaoId, name, accessToken, useseqnum) VALUES ('"+id+"','OOO','6f806275-5e56-4a66-9bf2-10129ad56752','1100035222')";
	
	
	connection.query(sql, function(err, result){
		console.log(result);
		console.log(err);
	})
	        
	var responseBody = {
		version: "2.0",
		data: {
			"name": "OOO"
		}
		
	};	

	res.status(200).send(responseBody);		 
		
})

apiRouter.post('/transaction', function(req, res){

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	
	var sql = "SELECT * FROM user WHERE kakaoId = ?";
	
	var result = connectionsyn.query(sql, [id]);
	console.log(id);
	console.log(result.length);
	if(result.length == 0){
		var responseBody = {
			"version": "2.0",
			"template": {
				"outputs": [
					
					{
					"basicCard": {
											"description": "안녕하세요! 카톡으로 간편하게 주택 청약 관련 서비스 이용을 도와드리는 청약봇입니다.\n\n 청약점수계산·당첨확률예상 등 청약 관련 서비스를 제공합니다. 현재 보유하고 계신 청약이 있으시다면 [계좌등록]을 눌러서 서비스를 이용해보세요.😊🏠",
						"thumbnail": {
						  "imageUrl": "https://i.imgur.com/X83c7Wl.jpg"
						},
						"buttons": [
						  {
							"action": "webLink",
							"label": "계좌등록",
							"webLinkUrl": "http://13.124.84.213/api/enroll?id="+id
						  },
						  {
							"action": "block",
							"label": "시작하기",
							"blockId": "5d2c1cc2ffa7480001003c46"
						  },
						  {
							"action":  "block",
							"label": "계좌없이 시작하기",
							"blockId": "5d30356eb617ea0001da2890"
						  }
						
						]
						}
					},
					{
						"simpleText": {
							"text": "등록된 계좌가 없습니다."
						}
					}
				]
			}
		};
		res.status(200).send(responseBody);
	}else{
    console.log(result);
	var accessToken = result[0].accessToken;
	var useseqnum = result[0].useseqnum;	
	
	var user_seq_no = useseqnum;
    var qs = "?user_seq_no="+user_seq_no;
    var getAccountUrl = "https://testapi.open-platform.or.kr/user/me"+qs;
    var option = {
        method : "GET",
        url : getAccountUrl,
        headers : {
            "Authorization" : "Bearer "+accessToken
        }
        
    };
    request(option, function(err, response, body){
        if(err) throw err;
        else {
            console.log(body);
			var accessRequestResult = JSON.parse(body);
			var name = accessRequestResult.user_name;			
			console.log("name:"+name);
			var finnum = accessRequestResult.res_list[0].fintech_use_num;
			console.log("finnum:"+finnum);
			var bank = accessRequestResult.res_list[0].bank_name;
			console.log("bank:"+bank);
			var account = accessRequestResult.res_list[0].account_num_masked;
			console.log("account:"+account);
			
			var sql = "UPDATE user SET name = '"+name+"', fintechnum = '"+finnum+"' where kakaoId = '"+id+"'";
            connection.query(sql, function(err, result){
				console.log("update:"+result);
				console.log(err);
		})

		var fintech_use_num = finnum;
    	var inquiry_type = "A";
    	var from_date = "19190718";
    	var to_date = "20190718";
    	var sort_order = "D";
    	var page_index = "1";
    	var tran_dtime = "20190310101921";
    	var befor_inquiry_trace_info = "123";
		var list_tran_seqno = "0";
		
		var qs = "?fintech_use_num="+fintech_use_num+"&"
        + "inquiry_type="+inquiry_type+"&"
        + "from_date="+from_date+"&"
        + "to_date="+to_date+"&"
        + "sort_order="+sort_order+"&"
        + "page_index="+page_index+"&"
        + "tran_dtime="+tran_dtime+"&"
        + "befor_inquiry_trace_info="+befor_inquiry_trace_info+"&"
        + "list_tran_seqno="+list_tran_seqno+"&"
    var getBalanceUrl = "https://testapi.open-platform.or.kr/v1.0/account/transaction_list"+qs;
    var option = {
        method : "GET",
        url : getBalanceUrl,
        headers : {
            Authorization : "Bearer "+accessToken
        }
        
    };
    request(option, function(err, response, body){
        if(err) throw err;
        else {
            console.log(body);
            var accessRequestResult = JSON.parse(body);
			var balance = accessRequestResult.balance_amt;
			//입금 count
			var sql = "UPDATE user SET money = '"+balance+"'";
            connection.query(sql, function(err, result){
				console.log("update:"+result);
				console.log(err);
		})
			console.log(balance);
			var length = accessRequestResult.res_list.length;
			console.log(length);
			var count = 0;
			var months = [false, false, false, false, false, false, false, false, false, false, false, false];
			var year = accessRequestResult.res_list[0].tran_date.substring(0,4);
			var month = accessRequestResult.res_list[0].tran_date.substring(4,6);
			if(accessRequestResult.res_list[0].inout_type == "입금"){
				count = count + 1;
				console.log(accessRequestResult.res_list[0]);
			if(month == "01"){
				months[0] = true;
			}else if(month == "02"){
				months[1] = true;
			}else if(month == "03"){
				months[2] = true;
			}else if(month == "04"){
				months[3] = true;
			}else if(month == "05"){
				months[4] = true;
			}else if(month == "06"){
				months[5] = true;
			}else if(month == "07"){
				months[6] = true;
			}else if(month == "08"){
				months[7] = true;
			}else if(month == "09"){
				months[8] = true;
			}else if(month == "10"){
				months[9] = true;
			}else if(month == "11"){
				months[10] = true;
			}else if(month == "12"){
				months[11] = true;
			}

			}else{
				console.log("skip 0"+accessRequestResult.res_list[0]);
			}
			for(var i = 1; i < length; i++){
				if(accessRequestResult.res_list[i].inout_type == "입금"){										
					if(year != accessRequestResult.res_list[i].tran_date.substring(0,4)){
						year = accessRequestResult.res_list[i].tran_date.substring(0,4);
						months = [false, false, false, false, false, false, false, false, false, false, false, false];
					}
					month = accessRequestResult.res_list[i].tran_date.substring(4,6);
					if(month == "01"){
						if(months[0] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[0] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "02"){
						if(months[1] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[1] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "03"){
						if(months[2] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[2] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "04"){
						if(months[3] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[3] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "05"){
						if(months[4] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[4] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "06"){
						if(months[5] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[5] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "07"){
						if(months[6] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[6] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "08"){
						if(months[7] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[7] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "09"){
						if(months[8] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[8] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "10"){
						if(months[9] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[9] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "11"){
						if(months[10] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[10] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}else if(month == "12"){
						if(months[11] == true){
							console.log("skip "+i+" "+accessRequestResult.res_list[i]);
							continue;
						}else{						
							months[11] = true;
							count = count + 1;
							console.log(accessRequestResult.res_list[i]);
						}
					}
				}else{
					console.log("skip "+i+" "+accessRequestResult.res_list[i]);
				}
			}

			var responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"simpleText": {
								"text": name+"님의 계좌등록이 완료되었습니다!\n"+"아래 내용을 확인해주세요.\n"
								+"―――――――\n"+"✨ 은행명 :"+bank+"\n"+"✨ 계좌번호 :"+account+"\n"+"✨ 납입횟수 :"+count+"\n"+"✨ 계좌잔액 :"+balance							
								
							}
						},
						{
						"simpleText": {
								"text": "❗️ 무주택기간 답변 가이드 ❗️\n\n"+"해당하는 기간에 맞는 숫자를 입력해주세요.\n"
								+"――――――――――――\n"+"주택 소유 및 만 30세 미만, 미혼인 무주택자 → 0\n"
								+"1년 미만인 경우 → 1\n"+"1년 이상~2년 이하인 경우 → 2\n"+"2년 이상~3년 미만 → 3\n"
								+"3년 이상~4년 미만 → 4\n"+"4년 이상~5년 미만 → 5\n"+"5년 이상~6년 미만 → 6\n"
								+"6년 이상~7년 미만 → 7\n"+"7년 이상~8년 미만 → 8\n"+"8년 이상~9년 미만 → 9\n"
								+"9년 이상~10년 미만 → 10\n"+"10년 이상~11년 미만 → 11\n"+"11년 이상~12년 미만 → 12\n"
								+"12년 이상~13년 미만 → 13\n"+"13년 이상~14년 미만 → 14\n"+"14년 이상~15년 미만 → 15\n"
								+"15년 이상 → 16"
											
							}
						}
					],

					"quickReplies": [
						{
							"label": "이전",
							"action": "block",
							"blockId": "5d29f4aeffa748000100365d"
						},
						{
							"label": "청약가점계산하기",
							"action": "block",
							
							"blockId": "5d2be86bb617ea000117907f"
						}

					]
				}
			};

			/*
			var responseBody = {
                version: "2.0",
                data: {
						"name": name,
						"bank": bank,
						"account": account,
						"count": count,
						"balance": balance
	        }

        };*/

	 res.status(200).send(responseBody);

        }
    })

        }
    })
}})

apiRouter.post('/calculate', function(req, res){
	console.log(req.body);
	
	console.log(req.body);
	var bodyjson = req.body;
	var params = bodyjson.action.params;
	var periodJson = JSON.parse(params.period);
	var familyJson = JSON.parse(params.family);
	var dateJson = JSON.parse(params.date);
	var period = periodJson.amount;
	var family = familyJson.amount;
	var date = dateJson.value;
	
	var score = 0;
	score += period * 2;
	
	score += (family+1) * 5;
	
	var day = moment(date);
	var days = moment().diff(moment(day),"days");
	if(days <= 180){
		score += 1;		
	}else if(days <= 365){
		score += 2;
	}else if(days <= 365*2){
		score += 3;
	}else if(days <= 365*3){
		score += 4;	
	}else if(days <= 365*4){
		score += 5;	
	}else if(days <= 365*5){
		score += 6;	
	}else if(days <= 365*6){
		score += 7;	
	}else if(days <= 365*7){
		score += 8;	
	}else if(days <= 365*8){
		score += 9;	
	}else if(days <= 365*9){
		score += 10;	
	}else if(days <= 365*10){
		score += 11;	
	}else if(days <= 365*11){
		score += 12;	
	}else if(days <= 365*12){
		score += 13;	
	}else if(days <= 365*13){
		score += 14;	
	}else if(days <= 365*14){
		score += 15;	
	}else if(days <= 365*15){
		score += 16;	
	}else{
		score += 17;
	}
	var id = bodyjson.userRequest.user.id;
	
	var sql = "SELECT name FROM user WHERE kakaoId = ?;"; 
	
	connection.query(sql, [id], function(err, result){
		var name = result[0].name
		var responseBody = {
                version: "2.0",
                data: {
                        "score": score,
        		"name": name
	        }

        };

	 res.status(200).send(responseBody);

	})
		
	
	
	//db query score update
	var sql = "UPDATE user SET score = "+score+" where kakaoId = '"+id+"'";
	connection.query(sql, function(err, result){
        	console.log(result);
		console.log(err);
	}
)
})

apiRouter.post('/testbalance', function(req, res){
	console.log(req.body);
	
	//console.log(req.body);
	var bodyjson = req.body;
	var params = bodyjson.action.params;
	var testbalJson = JSON.parse(params.testbal);
	var testbal = testbalJson.amount * 10000;
	
	
	var id = bodyjson.userRequest.user.id;	
	
	//db query score update
	var sql = "UPDATE user SET money = "+testbal+" where kakaoId = '"+id+"'";
	connection.query(sql, function(err, result){
        	console.log(result);
		
	})

	
	var responseBody = {
		version: "2.0"
	}

	res.status(200).send(responseBody);


})

apiRouter.post('/homeinfo', function(req, res){
	console.log(req.body);

	console.log(req.body);
	var bodyjson = req.body;
	var params = bodyjson.action.params;

	
	var bot_brandStr = params.bot_brand;
	var bot_areaStr = params.bot_area;
		
	
	var bot_brand = bot_brandStr;
	var bot_area = bot_areaStr;	

	var id = bodyjson.userRequest.user.id;
	
	/*var mj; //면적
	if(bot_space == "10평대"){
		mj = 66.12;
	}else if(bot_space == "20평대"){
		mj = 99.17;
	}else if(bot_space == "30평대"){
		mj = 132.23;
	}else if(bot_space == "40평대"){
		mj = 165.29;
	}
	console.log("면적:"+mj); */
	//bot_price 는 그대로
	// bot_price = bot_price / 10000;
	var isbrand;
	if(bot_brand == "예"){
		isbrand = 0;
	}else if(bot_brand == "아니오 (그외 추천받기)"){
		isbrand = 1;
	}
	console.log("isbrand:"+isbrand);
	/*var distance;
	if(bot_distance == "5분이내"){
		distance = 5;
	}else if(bot_distance == "10분"){
		distance = 10;
	}else if(bot_distance == "15분"){
		distance = 15;
	}else if(bot_distance == "20분"){
		distance = 20;
	}else if(bot_distance == "25분"){
		distance = 25;
	}else if(bot_distance == "30분이상"){
		distance = 30;
	}
	console.log("distance:"+distance); */

	//지역구 의미 없음?
	var district;
	if(bot_area == "서울"){
		district = 0
	}else if(bot_area == "경기"){
		district = 1
	}else if(bot_area == "인천"){
		district = 2;
	}
	
	var sql = "SELECT * FROM selection WHERE kakaoId = ?";
	var isql;
    	connection.query(sql, [id], function(err, result){
	console.log("sql쿼리실행함??");
        console.log(result);
        if(result.length == 0){ // 정보 없음
		isql = "INSERT INTO selection (kakaoId, brand, district) VALUES (?, ?, ?);"
	}else{
		isql = "UPDATE selection SET kakaoId = ?, brand = ?, district = ? where kakaoId = '"+id+"'"; 
	}

	console.log(isql);
        connection.query(isql,[id, isbrand, district], function (error, results, fields) {
        if(error){
            console.error(error);
        }
        else {
            console.log(results);
        }
        });

            
	})
	
	/*
	console.log(isql);
	connection.query(isql,[id, mj, bot_price, isbrand, distance, 1], function (error, results, fields) {
        if(error){
            console.error(error);
        }
        else {
            console.log(results);
        }
    	});*/

	
	var sql = "SELECT name FROM user WHERE kakaoId = ?;";
	
	connection.query(sql, [id], function(err, result){
		console.log(result)
		console.log(err)
		var naming = result[0].name;
				  
		var responseBody = {
                version: "2.0",
                data: {
                        
                        "bot_brand": bot_brand,
                        "bot_area": bot_area,
                        "name": naming
                                }

        };

	 res.status(200).send(responseBody);
	  
	});

	


	console.log(bot_brand);
	console.log(bot_area);
	

		

})

apiRouter.post('/visual', function(req, res){
	console.log(req.body);
 
	console.log(req.body);
	var bodyjson = req.body;
	var params = bodyjson.action.params;
 
	var id = bodyjson.userRequest.user.id;
	var blid = bodyjson.userRequest.block.id;
	var sql = "SELECT * FROM user WHERE kakaoId = ?";
	

    var result = connectionsyn.query(sql, [id]);
    console.log(result);
	var name = result[0].name;
	var score = result[0].score;	
	// 추가된거
	var money = result[0].money;

	var sql = "SELECT * FROM selection WHERE kakaoId = ?"
	var result = connectionsyn.query(sql, [id]);
	console.log(result);
	var brand = result[0].brand;
	var district = result[0].district;

	var pyeong = 0;
	// 서울
	if(district == 0){
		if(moneny < 300){
			pyeong = 0;
		}else if(money < 600){
			pyeong = 26;
		}else if(money < 1000){
			pyeong = 31;
		}else if(money < 1500){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}

	// 경기
	}else if(district == 1){
		if(moneny < 200){
			pyeong = 0;
		}else if(money < 300){
			pyeong = 26;
		}else if(money < 400){
			pyeong = 31;
		}else if(money < 500){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}

	// 인천
	}else if(district == 2){
		if(moneny < 250){
			pyeong = 0;
		}else if(money < 400){
			pyeong = 26;
		}else if(money < 700){
			pyeong = 31;
		}else if(money < 1000){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}
	}
	
	var sql = "SELECT * FROM apt WHERE brand = ? AND district = ? AND score <="+(parseInt(score)+5)+" AND score >="+(parseInt(score)-5)+" AND space <="+pyeong;
	var result = connectionsyn.query(sql, [brand, district]);
	console.log(sql);
	console.log(result);
	
	var blockId = ['5d301a1affa748000122d24a', '5d301a6cffa748000122d24e', '5d301a76ffa748000122d250', '5d301a7fffa748000122d252', '5d301a86ffa748000122d254', '5d301b28b617ea0001da272e', '5d301b49ffa748000122d258', '5d301b50ffa748000122d25a', '5d301b5792690d00011f3b6f', '5d301b5fffa748000122d25f']
	
	if(blid==blockId[0]){

		var visual_url = result[0].visual_url;

	}else if(blid==blockId[1]){

		var visual_url = result[1].visual_url;

	}else if(blid==blockId[2]){

		var visual_url = result[2].visual_url;

	}else if(blid==blockId[3]){

		var visual_url = result[3].visual_url;

	}else if(blid==blockId[4]){

		var visual_url = result[4].visual_url;

	}else if(blid==blockId[5]){

		var visual_url = result[5].visual_url;

	}else if(blid==blockId[6]){

		var visual_url = result[6].visual_url;

	}else if(blid==blockId[7]){

		var visual_url = result[7].visual_url;

	}else if(blid==blockId[8]){

		var visual_url = result[8].visual_url;

	}else if(blid==blockId[9]){

		var visual_url = result[9].visual_url;
		
	}
	
	
	var responseBody = {
		"version": "2.0",
		"template": {
		  "outputs": [
			{
			  "basicCard": {
				"title": "상세분석 이미지",
				"description": "위 그래프는 해당 구역 청약에 대한 사람들의 반응을 감성분석한 수치입니다.\n 현재 청약 시장에 대한 반응을 한눈에 알아보세요!",
				"thumbnail": {
				  "imageUrl": visual_url
				}				
			  }
			}

			
		  ],

		  "quickReplies": [
			{
				"label": "이전으로",
				"action": "block",
				"blockId": "5d2c07f3ffa7480001003a10"
			}
			

		]
		}
	  }
	  
	console.log(responseBody);
	  res.status(200).send(responseBody);

		
})


apiRouter.post('/cutlinescore', function(req, res){
	console.log(req.body);
 
	console.log(req.body);
	var bodyjson = req.body;
	var params = bodyjson.action.params;
 
	var id = bodyjson.userRequest.user.id;
	var blid = bodyjson.userRequest.block.id;
	var sql = "SELECT * FROM user WHERE kakaoId = ?";
	

    var result = connectionsyn.query(sql, [id]);
    console.log(result);
	var name = result[0].name;
	var score = result[0].score;	
	// 추가된거
	var money = result[0].money;

	var sql = "SELECT * FROM selection WHERE kakaoId = ?"
	var result = connectionsyn.query(sql, [id]);
	console.log(result);
	var brand = result[0].brand;
	var district = result[0].district;

	var pyeong = 0;
	// 서울
	if(district == 0){
		if(moneny < 300){
			pyeong = 0;
		}else if(money < 600){
			pyeong = 26;
		}else if(money < 1000){
			pyeong = 31;
		}else if(money < 1500){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}

	// 경기
	}else if(district == 1){
		if(moneny < 200){
			pyeong = 0;
		}else if(money < 300){
			pyeong = 26;
		}else if(money < 400){
			pyeong = 31;
		}else if(money < 500){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}

	// 인천
	}else if(district == 2){
		if(moneny < 250){
			pyeong = 0;
		}else if(money < 400){
			pyeong = 26;
		}else if(money < 700){
			pyeong = 31;
		}else if(money < 1000){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}
	}
	
	var sql = "SELECT * FROM apt WHERE brand = ? AND district = ? AND score <="+(parseInt(score)+5)+" AND score >="+(parseInt(score)-5)+" AND space <="+pyeong;

	var result = connectionsyn.query(sql, [brand, district]);
	console.log(sql);
	console.log(result);

	
	var blockId = ['5d2f08f48192ac000132b492', '5d2f08fe8192ac000132b494', '5d2f09058192ac000132b497', '5d2f090c8192ac000132b499', '5d2f09778192ac000132b4a6', '5d2f097e8192ac000132b4a9', '5d2f09858192ac000132b4ac', '5d2f098c8192ac000132b4af', '5d2f09938192ac000132b4b2', '5d2f099a8192ac000132b4b5']
	
	if(blid==blockId[0]){

		var aptname = result[0].aptname;
		var aptsco = result[0].score;

	}else if(blid==blockId[1]){

		var aptname = result[1].aptname;
		var aptsco = result[1].score;

	}else if(blid==blockId[2]){

		var aptname = result[2].aptname;
		var aptsco = result[2].score;


	}else if(blid==blockId[3]){

		var aptname = result[3].aptname;
		var aptsco = result[3].score;


	}else if(blid==blockId[4]){

		var aptname = result[4].aptname;
		var aptsco = result[4].score;


	}else if(blid==blockId[5]){

		var aptname = result[5].aptname;
		var aptsco = result[5].score;


	}else if(blid==blockId[6]){

		var aptname = result[6].aptname;
		var aptsco = result[6].score;


	}else if(blid==blockId[7]){

		var aptname = result[7].aptname;
		var aptsco = result[7].score;


	}else if(blid==blockId[8]){

		var aptname = result[8].aptname;
		var aptsco = result[8].score;


	}else if(blid==blockId[9]){

		var aptname = result[9].aptname;
		var aptsco = result[9].score;

		
	}

	
	
	var responseBody = {
		"version": "2.0",
		
		data: {
			"score": score,
			"name": name,
			"aptname": aptname,
			"aptsco" : aptsco
			
					}	
	  }		

	console.log(responseBody);
	  res.status(200).send(responseBody);

		
})
	   

apiRouter.post('/rec', function(req, res){
	
	console.log(req.body);
	var bodyjson = req.body;
	var id = bodyjson.userRequest.user.id;
	var sql = "SELECT * FROM user WHERE kakaoId = ?";
	

    var result = connectionsyn.query(sql, [id]);
    console.log(result);
	var name = result[0].name;
	var score = result[0].score;	
	// 추가된거
	var money = result[0].money;
	
	
	var sql = "SELECT * FROM selection WHERE kakaoId = ?"
	var result = connectionsyn.query(sql, [id]);
	console.log(result);
	var brand = result[0].brand;
	var district = result[0].district;
	
	var pyeong = 0;
	// 서울
	if(district == 0){
		if(moneny < 300){
			pyeong = 0;
		}else if(money < 600){
			pyeong = 26;
		}else if(money < 1000){
			pyeong = 31;
		}else if(money < 1500){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}

	// 경기
	}else if(district == 1){
		if(moneny < 200){
			pyeong = 0;
		}else if(money < 300){
			pyeong = 26;
		}else if(money < 400){
			pyeong = 31;
		}else if(money < 500){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}

	// 인천
	}else if(district == 2){
		if(moneny < 250){
			pyeong = 0;
		}else if(money < 400){
			pyeong = 26;
		}else if(money < 700){
			pyeong = 31;
		}else if(money < 1000){
			pyeong = 41;
		}else{
			pyeong = 1000;
		}
	}
	
	var sql = "SELECT * FROM apt WHERE brand = ? AND district = ? AND score <="+(parseInt(score)+5)+" AND score >="+(parseInt(score)-5)+" AND space <="+pyeong;

	var result = connectionsyn.query(sql, [brand, district]);
	console.log(sql);
	console.log(result);

	
	var blockId = ['5d2f08f48192ac000132b492', '5d2f08fe8192ac000132b494', '5d2f09058192ac000132b497', '5d2f090c8192ac000132b499', '5d2f09778192ac000132b4a6', '5d2f097e8192ac000132b4a9', '5d2f09858192ac000132b4ac', '5d2f098c8192ac000132b4af', '5d2f09938192ac000132b4b2', '5d2f099a8192ac000132b4b5']
	var il = [];
	        
        for(var i = 0; i < result.length; i++){

           /* var items = '{'+'"title": "'+result[i].apt_name+'", "description": "-지역구:'+result[i].apt_district+'","thumbnail": { "imageUrl": "http://k.kakaocdn.net/dn/83BvP/bl20duRC1Q1/lj3JUcmrzC53YIjNDkqbWK/i_6piz1p.jpg" },'+
                '"buttons": [{"action": "webLink", "label": "상세보기", "webLinkUrl": "'+result[i].apt_url+'"}]'+'}';
	   */

	    var items = '{'+'"title": "'+result[i].aptname+'", "description": "-지역구:'+result[i].apt_district+'","thumbnail": { "imageUrl": "https://i.imgur.com/fOvCJjc.jpg" },'+
                '"buttons": [{"action": "webLink", "label": "상세보기", "webLinkUrl": "'+result[i].apt_url+'"},{"action":  "block", "label": "당첨 예상 점수 보기", "blockId": "'+blockId[i]+'"}]'+'}';	
	    console.log(items)
            var it = JSON.parse(items);
            il.push(it);
		}
	
	var mn;
	var ds;
	if(district == 0){
		mn = 300;
		ds = "서울";
	}else if(district == 1){
		mn = 200;
		ds = "경기";
	}else if(district == 2){
		mn = 250;
		ds = "인천";
	}

	var responseBody;
	if(result.length == 0){
		 responseBody = {
			"version": "2.0",
			"template": {
			  "outputs": [
				{
					"basicCard": {
					"title": "❌ 조건에 맞는 청약 주택이 없습니다. ",						
					"description": ds+"지역의 최소 예치금액은 : "+mn+"입니다. \n" + name+"님의 예치금액은 : "+money+"입니다. \n" + name+"님의 청약가점은 : "+score+"입니다.",
					"thumbnail": {
						  "imageUrl": "https://i.imgur.com/k6wp7dG.jpg"
					}
				}
					
				
				}
				  
								
			  ],
			  "quickReplies": [
				{
					"label": "이전으로",
					"action": "block",
					"blockId": "5d29f4aeffa748000100365d"
				}
				
	
			]
			}




		}	
	}else{
	 responseBody = {
		"version": "2.0",
		"template": {
		  "outputs": [
			{
			    "basicCard": {
				"title": "✔️ 분석 완료 ",						
				"description": name+"님의 조건에 맞는 청약 주택을 찾았습니다.",
				"thumbnail": {
	  				"imageUrl": "https://i.imgur.com/k6wp7dG.jpg"
				}
	
			}
			},
			  
			{
			  "carousel": {
				"type": "basicCard",
				
				"items": il
			  }
			}

			
		  ]
		}
	  }	
		
	}
	

	console.log(responseBody);
	  res.status(200).send(responseBody);

		
})

apiRouter.get('/enroll', function(req, res, next){
    res.render('enroll');
});

apiRouter.get('/callback', function(req, res) {
	var authcode = req.query.code;
	console.log("callback 들어오니??");
	console.log(authcode);
	
    
    var getTokenUrl = "https://testapi.open-platform.or.kr/oauth/2.0/token"
    var option = {
	method : "POST",
	url : getTokenUrl,
	headers : {

	},
	form : {
	    code : authcode,
	    client_id : "l7xx533bb156ace64c6eb6e19b2db4583e76",
	    client_secret : "bfddf87bbf1743eb8277b0d1dd6deff7",
	    redirect_uri : "http://13.124.84.213/api/callback",
	    grant_type : "authorization_code"
	}
	}
	
	
    
    request(option, function(err, response, body){
		if(err) throw err;
		else {
			console.log(body);
			var accessRequestResult = JSON.parse(body);
			console.log(accessRequestResult);
			res.render('resultChild', {data : accessRequestResult});
	}
    })
})

app.listen(port);

console.log("Listening on Port", port);
