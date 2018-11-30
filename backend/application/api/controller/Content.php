<?php
namespace app\api\controller;
//header("Content-type:text/html;charset=utf-8");
//header('Access-Control-Allow-Origin: *');
//header("Access-Control-Allow-Headers:  Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");
//header('Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS');
//header('Access-Control-Max-Age: 3600');
 

use think\Controller;
use think\Request;
use think\Cookie;
use think\Db;

class Content extends Controller{
	//首页面登录
	public function login(Request $request,$username='',$password=''){

		$post = request()->post();
		// $username = 'admin@126.com';
		// $password = '123456';
        if (isset($post['username'])) {
        	$username = $post['username'];
        }
        if (isset($post['password'])) {
        	$password = $post['password'];
        }
		if ($username=='') {
            $this->error('用户名不能为空');
        }
        if ($password=='') {
            $this->error('密码不能为空');
        }

        $user = Db('user');
        $uid = $user->where(['name' => $username , 'password' => sha1($password)])->field('id,name,token')->find();

		if ($uid) {

        	$tokendata = md5(time());
        	db('user')->where(['name' => $username , 'password' => sha1($password)])->update(['token' => $tokendata]);
            $data = $user->where(['name' => $username , 'password' => sha1($password)])->field('id,name,token')->find();

        	$result = [
			'token' => $data['token'],
			
		    ];

			// Cookie::set('usertoken', $data['token']);
			// $username = Cookie::get('usertoken');
			return show('1','登录成功',$result); 
		} else {
			return show('0','用户或密码错误',[]);
		}

	}

	//公司详情
	public function detail(Request $request,$data=[],$id='',$type='Non Tech News',$uid='',$token='',$results=[]){

        $info = Request::instance()->header();
        // dump($info);die;
        // $uid = '1';
        // $token = 'd5c76d502bbb218a1c6314531b6d8587';
        if (!isset($info['token'])) {
        	 return show('0','非法用户',[]);
        }

        // $uid = $info['uid'];
        $token = $info['token'];
        
        $results = db('user')->where(['token' => $token])->find();
        
        if ($results) {
    	    // 根据不同新闻类型展示
	        $result = Db::table('accountkeyword_searchinfo')
			        ->where(['account_id' => $id,'news_type' => $type])//,'news_type' => $type
			        ->order('date desc')
			        ->paginate(5)
			        ->toArray();

			// 公司架构
	        $structure = Db::table('account_org_structure')
			        ->where(['account_id' => $id])//,'news_type' => $type
			        ->order('level')
			        ->select();
	        
	        //详情展示
	        $data = Db::table('accountinfo')
			        ->where(['account_id' => $id])
			        ->select();
	        return show('1','ok',array(
	                'result' => $result,
	                'data' => $data,
	                'structure' => $structure
	        	));
        }else{
        	return show('0','非法用户11',[]);
        }
       
    

	}

	//跟邮箱发送密码
	public function email(Request $request,$len = 3){
        $post = request()->post();
        
        if (isset($post['email'])) {
        	$email = $post['email'];
        }
        // $email = '1124457910@qq.com';

        $data = Db::table('user')
                    ->field('id')
			        ->where(['name' => $email])
			        ->find();
		$id = $data['id'];
	    if (!$data) {
	    	return show('0','用户邮箱未注册',[]);
	    }
          
	      $numbers = range (10,99);
		  //shuffle 将数组顺序随即打乱 
		  shuffle ($numbers); 
		  //取值起始位置随机
		  $start = mt_rand(1,10);
		  //取从指定定位置开始的若干数
		  $result = array_slice($numbers,$start,$len); 
		  $random = "";
		  for ($i=0;$i<$len;$i++){ 
		     $random = $random.$result[$i];
		   } 

		// $password = $substr($time,6);
		// dump($random);die;
        vendor('phpmailer.phpmailer');

		$mail = new \phpmailer\phpmailer(); //实例化
		header("content-type:text/html;charset=utf-8");
		// 使用SMTP方式发送
		$mail->IsSMTP();
		// 设置邮件的字符编码
		$mail->CharSet='UTF-8';
		// 企业邮局域名
		//$mail->Host = 'smtp.qq.com';
		$mail->Host = 'smtp.mxhichina.com';
		//---------qq邮箱需要的------//设置使用ssl加密方式登录鉴权
		$mail->SMTPSecure = 'ssl';
		//设置ssl连接smtp服务器的远程服务器端口号 可选465或587
		$mail->Port = 465;//---------qq邮箱需要的------
		// 启用SMTP验证功能
		$mail->SMTPAuth = true;
		//$mail->Port = 25;

		//邮件发送人的用户名(请填写完整的email地址)
		$mail->Username = 'admin@gominemail.cn' ;
		// 邮件发送人的 密码 （授权码）
		$mail->Password = 'Gomine123456';  //修改为自己的授权码
		//邮件发送者email地址
		$mail->From ="admin@gominemail.cn";
		//发送邮件人的标题
		$mail->FromName ="Verify your identity";
		//收件人的邮箱 307546691给谁发邮件732026291
		$email_addr = "$email";
		//收件人地址，可以替换成任何想要接收邮件的email信箱,格式是AddAddress("收件人email","收件人姓名")
		$mail->AddAddress("$email_addr", substr(  $email_addr, 0 , strpos($email_addr ,'@')));
		//回复的地址
		$mail->AddReplyTo('admin@gominemail.cn' , "回复成功" );
		//$mail->AddAttachment("./mail.rar"); // 添加附件
		//set email format to HTML //是否使用HTML格式
		$mail->IsHTML(true);
		//邮件标题
		$mail->Subject = 'Reset Password';
		//邮件内容
		$mail->Body =  'Hey there: <br/> Your Verification Code is：'."$random";
		//附加信息，可以省略
		//$mail->AltBody = '';
		// 添加附件,并指定名称
		//$mail->AddAttachment( './error404.php' ,'php文件');
		//设置邮件中的图片
		// $mail->AddEmbeddedImage("shuai.jpg", "my-attach", "shuai.jpg");
		        /*if( !$mail->Send() ){
		            $mail_return_arr['mark'] = false ;
		            $str  =  "e-mail sending failed. <p>";
		            $str .= "cause of error: " . $mail->ErrorInfo;
		            $mail_return_arr['info'] = $str ;
		        }else{
		            $mail_return_arr['mark'] = true ;
		            $str =  "Email successfully sent";
		            $mail_return_arr['info'] = $str ;
                db('user')->where(['id' => $id , 'name' => $email])->update(['password' => sha1($random)]);
		        }
		        
		        return show('1','',$mail_return_arr);*/
      
      		   if( !$mail->Send() ){
		            $mail_return_arr['mark'] = false ;
		            $str  =  "e-mail sending failed. <p>";
		            $str .= "cause of error: " . $mail->ErrorInfo;
		            $mail_return_arr['info'] = $str ;
		        }else{
		            $mail_return_arr['mark'] = true ;
		            $str =  "Email successfully sent";
		            $mail_return_arr['info'] = $str ;
        
                    db('user')->where(['name' => $email])->update(['set_password'=>$random]);
              //       $results = array('name' => $email,'password'=>$random );
		           return show('1','合法用户',[]);
                    // db('user')->where(['id' => $id , 'name' => $email])->update(['password' => sha1($random)]);
		        }

	}
  
  	//找回密码，重新发送随机密码
	public function check(Request $request,$eamil='',$password=''){
        $post = request()->post();
 
        if (isset($post['email'])) {
        	$email = $post['email'];
        }
        if (isset($post['code'])) {
        	$password = $post['code'];
        }
       // $email = '1124457910@qq.com';
        $result = Db::table('user')->where(['name' => $email])->field('set_password')->find();
        $set_password = $result['set_password'];
        if ($set_password == $password) {
        	//$results = db('user')->where(['name' => $email])->update(['password' => sha1($set_password)]);
          return show('1','密码更新成功',[]); 
        }else{
        	return show('0','非法用户',[]);
        }

	}

    	//找回密码，重新发送随机密码
	public function reset(Request $request,$eamil='',$password=''){
        $post = request()->post();
 
        if (isset($post['email'])) {
        	$email = $post['email'];
        }
        if (isset($post['password'])) {
        	$password = $post['password'];
        }
        
        $results = db('user')->where(['name' => $email])->update(['password' => sha1($password)]);
        if ($results) {
          return show('1','登录成功',$results); 
        }else{
        	return show('0','非法用户',[]);
        }

	}
  
    //关键字搜索功能
    public function search(Request $request,$content='',$county=[]){
      // $county=['Indonesia'];
        //筛选内容
        $map = array();
        if ($content) {
        	$map['account_name'] = ['like','%'.$content.'%'];
        }
        if ($county) {
        	//foreach ($county as $key => $value) {
        		# code...
        	//}
        	//
        	$map['Country']='';
        	$show='';
        	$allCounty = ['Indonesia','Philippines','Malaysia','Thailand','Singapore'];
       		if (count($county) > 1 ) {
	        	if(in_array('Others',$county)){
		        	foreach ($county as $k => $value) {
		        		if($value!='Others'){
		        			$lanels[] = '%'.$county[$k].'%';
		        		} 
		        	}
	        		for ($i=0; $i < count($allCounty) ; $i++) {
		        		$others[] = '%'.$allCounty[$i].'%';
		        	}
		        	$map['Country'][] = ['notlike',$others];
		        	$map['Country'][] = ['like',$lanels,'or'];
		        	$map['Country'][] = 'or';
		        	
	        	}else{
	        		for ($i=0; $i < count($county) ; $i++) {
		        		$lanels[] = '%'.$county[$i].'%';
		        	}
		        	$map['Country'] = ['like',$lanels,'or'];
	        	}
	        	// echo '<pre>';
	        	// var_dump($map);exit();
        	} else {
        		if(in_array('Others',$county)){
	        		for ($i=0; $i < count($allCounty) ; $i++) {
		        		$others[] = '%'.$allCounty[$i].'%';
		        	}
		        	$map['Country'][] = ['notlike',$others];
	        	}else{
	        		 $map['Country'] = array('like','%'.$county[0].'%');
	        	}
        	}

        }
        
        $data = Db::table('accountinfo')
                ->where($map)
                // ->field('Seq_No')
                ->order('account_name')
                 ->paginate(6)
                ->toArray();
                 // ->fetchSql()
                // ->select();
    // dump($data);die;

        return show('1','成功',$data);
    }
    //新闻列表及控制
    public function detailList(Request $request,$content='',$abstract='',$type=[]){
    	//$type=['Recruitment','Technology News'];
        //筛选内容
        $map = array();
       	if ($content) {
        	$map['title'] = ['like','%'.$content.'%'];
        }
        if ($abstract) {
        	$map['abstract'] = ['like','%'.$abstract.'%'];
        }
        if ($type) {
        	//foreach ($county as $key => $value) {
        		# code...
        	//}
        	//
        	$map['news_type']='';
        	$show='';
        	$allCounty = ['Investment','Non Tech News','Marketing events','Technology News','Recruitment'];
       		if (count($type) > 1 ) {
	        	if(in_array('Others',$type)){
		        	foreach ($type as $k => $value) {
		        		if($value!='Others'){
		        			$lanels[] = '%'.$type[$k].'%';
		        		} 
		        	}
	        		for ($i=0; $i < count($allCounty) ; $i++) {
		        		$others[] = '%'.$allCounty[$i].'%';
		        	}
		        	$map['news_type'][] = ['notlike',$others];
		        	$map['news_type'][] = ['like',$lanels,'or'];
		        	$map['news_type'][] = 'or';
		        	
	        	}else{
	        		for ($i=0; $i < count($type) ; $i++) {
		        		$lanels[] = '%'.$type[$i].'%';
		        	}
		        	$map['news_type'] = ['like',$lanels,'or'];
	        	}
	        	// echo '<pre>';
	        	// var_dump($map);exit();
        	} else {
        		if(in_array('Others',$type)){
	        		for ($i=0; $i < count($allCounty) ; $i++) {
		        		$others[] = '%'.$allCounty[$i].'%';
		        	}
		        	$map['news_type'][] = ['notlike',$others];
	        	}else{
	        		 $map['news_type'] = array('like','%'.$type[0].'%');
	        	}
        	}

        }
        
        $data = Db::table('accountkeyword_searchinfo')
                ->where($map)
                // ->field('Seq_No')
                ->order('date desc')
                 ->paginate(100)
                ->toArray();
                 // ->fetchSql()
                // ->select();
    // dump($data);die;

        return show('1','成功',$data);
        
    

	}


}