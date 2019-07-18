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
						  "imageUrl": "https://i.imgur.com/zDRSmHu.jpg"
						},
						"buttons": [
						  {
							"action": "webLink",
							"label": "계좌등록",
							"webLinkUrl": "http://13.124.84.213/api/enroll"
						  },
						  {
							"action":  "block",
							"label": "테스트용",
							"blockId": "5d2c1cc2ffa7480001003c46"
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
					  "imageUrl": "https://i.imgur.com/zDRSmHu.jpg"
					},
					"buttons": [
					  {
						"action": "block",
						"label": "가점 다시 계산하기",
						"blockId": "5d2c1cc2ffa7480001003c46"
						
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

apiRouter.post('/testenroll', function(req,res){
	
	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var sql = "INSERT INTO user (kakaoId, name, accessToken, useseqnum) VALUES ('"+id+"','한지은','6f806275-5e56-4a66-9bf2-10129ad56752','1100035222')";
	
	
	connection.query(sql, function(err, result){
		console.log(result);
		console.log(err);
	})
	        
	var responseBody = {
		version: "2.0",
		data: {
			"name": "한지은"
		}
		
	};	

	res.status(200).send(responseBody);		 
		
})

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
	if(bot_area == "강남"){
		district = 0
	}else if(bot_area == "강북"){
		district = 1
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


apiRouter.post('/cutlinescore', function(req, res){
	console.log(req.body);

	console.log(req.body);
	var bodyjson = req.body;
	var params = bodyjson.action.params;

	var id = bodyjson.userRequest.user.id;

	
	var sql = "SELECT name, score FROM user WHERE kakaoId = ?;";
	
	connection.query(sql, [id], function(err, result){
		console.log(result)
		console.log(err)
		var naming = result[0].name;
                var score = result[0].score;
					  
		var responseBody = {
                version: "2.0",
                data: {
                        "score": score,
                        "name": naming
                                }

        };

	 res.status(200).send(responseBody);
	  
	});

	
		
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
	
	
	
	var sql = "SELECT * FROM selection WHERE kakaoId = ?"
	var result = connectionsyn.query(sql, [id]);
	console.log(result);
	var brand = result[0].brand;
	var district = result[0].district;
	
	//scroe - 10 orderby 나중에 추가
	var sql = "SELECT * FROM apt WHERE brand = ? AND district = ?"
	var result = connectionsyn.query(sql, [brand, district]);
	console.log(result);

	
	var blockId = ['5d2f08f48192ac000132b492', '5d2f08fe8192ac000132b494', '5d2f09058192ac000132b497', '5d2f090c8192ac000132b499', '5d2f09778192ac000132b4a6', '5d2f097e8192ac000132b4a9', '5d2f09858192ac000132b4ac', '5d2f098c8192ac000132b4af', '5d2f09938192ac000132b4b2', '5d2f099a8192ac000132b4b5']
	var il = [];
	        
        for(var i = 0; i < result.length; i++){

           /* var items = '{'+'"title": "'+result[i].apt_name+'", "description": "-지역구:'+result[i].apt_district+'","thumbnail": { "imageUrl": "http://k.kakaocdn.net/dn/83BvP/bl20duRC1Q1/lj3JUcmrzC53YIjNDkqbWK/i_6piz1p.jpg" },'+
                '"buttons": [{"action": "webLink", "label": "상세보기", "webLinkUrl": "'+result[i].apt_url+'"}]'+'}';
	   */

	    var items = '{'+'"title": "'+result[i].apt_name+'", "description": "-지역구:'+result[i].apt_district+'","thumbnail": { "imageUrl": "https://i.imgur.com/Yy66joT.jpg" },'+
                '"buttons": [{"action": "webLink", "label": "상세보기", "webLinkUrl": "'+result[i].apt_url+'"},{"action":  "block", "label": "예상 가점 커트라인 보기", "blockId": "'+blockId[i]+'"}]'+'}';	
	    console.log(items)
            var it = JSON.parse(items);
            il.push(it);
        }

	
	var responseBody = {
		"version": "2.0",
		"template": {
		  "outputs": [
			{
			    "basicCard": {
				"title": "✔️ 분석 완료 ",						
				"description": name+"님의 조건에 맞는 청약 주택을 찾았습니다.",
				"thumbnail": {
	  				"imageUrl": "https://i.imgur.com/tjuKwYK.jpg"
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
		

	

	console.log(responseBody);
	  res.status(200).send(responseBody);

		
})

apiRouter.get('/enroll', function(req, res, next){
    res.render('enroll');
});

apiRouter.get('/callback', function(req, res) {
    var authcode = req.query.code;
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
	    redirect_uri : "http://localhost:3000/api/callback",
	    grant_type : "authorization_code"
	}
    }
    
    request(option, function(err, response, body){
	if(err) throw err;
	else {
	    console.log(body);
	}
    })
})

app.listen(port);

console.log("Listening on Port", port);
