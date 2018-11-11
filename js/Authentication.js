Authentication = function(editor) {
    var signals = editor.signals;
    var loginUrl = Config.host+'/users/login';
    var registerUrl = Config.host+'/users/register';
    var body = document.body;
    var loginStatus = 0;
    var prePassword = '';


    //landing page container
    var landingPage = document.createElement('div');
    landingPage.setAttribute('class','landingPage');
    landingPage.setAttribute('style','display:inline');
    if(!checkCookie())
        body.appendChild(landingPage);
    else{
        console.log('login');
        signals.userLogin.dispatch(true);
    }
    signals.userLogin.add(function(bool){
        if(bool) {
            alert('welcome '+getUserInfo().username);
            return;
        }
        setCookie('userInfo','',0);
        body.appendChild(landingPage);
    });

    // add logo to the landing page
    var logoContainer = document.createElement('div');
    logoContainer.setAttribute('class','imgContainer');

    var logo = document.createElement('img');
    logo.setAttribute('src','./image/logo2.png');
    logoContainer.appendChild(logo);
    landingPage.appendChild(logoContainer);

    // add discription
    var discription = document.createElement('div');
    discription.setAttribute('class','discription');
    discription.innerHTML = 'NEXUSketch is a network analysis platform, designed to analyse and visualise traffic flow in road network. This platform can be used to compare and evaluate various network configurations. In NEXUSketch you can edit a road network by adding or removing links, altering road type and changing the number of lanes to achieve a higher performance. NEXUSketch uses the static traffic assignment method to estimate traffic flow and travel time in the network.';
    landingPage.appendChild(discription);

    // add auth panel
    var authPanel = document.createElement('div');
    authPanel.setAttribute('class','authPanel');
    // authPanel.setAttribute('style','display:inline');
    landingPage.appendChild(authPanel);
    
    // add auth header
    var authHeader =  document.createElement('div');
    authHeader.setAttribute('class','authHeader');
    authHeader.innerHTML = "To start using NEXUSketch please login or register";
    authPanel.appendChild(authHeader);

    // add auth body
    var authBody = document.createElement('div');
    authBody.setAttribute('class','authBody');
    authPanel.appendChild(authBody);

    //login panel
    var loginPanel = document.createElement('div');
    loginPanel.setAttribute('class','user_login');
    authBody.appendChild(loginPanel);
    var loginForm = document.createElement('form');
    loginPanel.appendChild(loginForm);
  
    
    var loginEmail = document.createElement('input');
    loginEmail.setAttribute('required','');
    loginEmail.setAttribute('type','email');
    loginEmail.setAttribute('name','email');
    loginEmail.setAttribute('placeholder','Email');
    loginForm.appendChild(loginEmail);

    var loginPassword = document.createElement('input');
    loginPassword.setAttribute('required','');
    loginPassword.setAttribute('name','password');
    loginPassword.setAttribute('placeholder','Password');
    loginPassword.setAttribute('type','password');
    loginForm.appendChild(loginPassword);

    var loginButtonGroup = document.createElement('div');
    loginButtonGroup.setAttribute('class','action_btns');
    loginForm.appendChild(loginButtonGroup);

    var confrimLoginButton = document.createElement('button');
    confrimLoginButton.setAttribute('class','one_half');
    confrimLoginButton.setAttribute('type','submit');
    confrimLoginButton.innerHTML = 'Login';
    loginButtonGroup.appendChild(confrimLoginButton);
    var registerButton = document.createElement('button');
    registerButton.setAttribute('class','one_half last');
    registerButton.innerHTML = 'Register';
    loginButtonGroup.appendChild(registerButton);
    loginPanel.appendChild(document.createElement('br'));
    loginPanel.appendChild(document.createElement('br'));
    loginPanel.appendChild(document.createElement('br'));

    //register panel
    var registerPanel = document.createElement('div');
    registerPanel.setAttribute('class','user_register');
  

    var registerForm = document.createElement('form');
    registerPanel.appendChild(registerForm);
    var username = document.createElement('input');
    username.setAttribute('required','');
    username.setAttribute('name','username');
    username.setAttribute('type','text');
    username.setAttribute('placeholder','Username');
    registerForm.appendChild(username);

    var registerEmail = document.createElement('input');
    registerEmail.setAttribute('required','');
    registerEmail.setAttribute('type','email');
    registerEmail.setAttribute('name','email');
    registerEmail.setAttribute('placeholder','Email');
    registerForm.appendChild(registerEmail);

    var registerPassword = document.createElement('input');
    registerPassword.setAttribute('required','');
    registerPassword.setAttribute('name','password');
    registerPassword.setAttribute('placeholder','Password');
    registerPassword.setAttribute('type','password');
    registerForm.appendChild(registerPassword);

    var confirmPassword = document.createElement('input');
    confirmPassword.setAttribute('required','');
    confirmPassword.setAttribute('placeholder','Confirm Password');
    confirmPassword.setAttribute('type','password');
    registerForm.appendChild(confirmPassword);



    var registerButtonGroup = document.createElement('div');
    registerButtonGroup.setAttribute('class','action_btns');
    registerForm.appendChild(registerButtonGroup);
    
    var backButton = document.createElement('button');
    backButton.setAttribute('class','one_half');
    backButton.innerHTML = 'Back';
    registerButtonGroup.appendChild(backButton);

    var confrimRegisterButton = document.createElement('button');
    confrimRegisterButton.setAttribute('class','one_half last');
    confrimRegisterButton.setAttribute('type','submit');
    confrimRegisterButton.innerHTML = 'Register';
    registerButtonGroup.appendChild(confrimRegisterButton);

    registerPanel.appendChild(document.createElement('br'));
    registerPanel.appendChild(document.createElement('br'));
    registerPanel.appendChild(document.createElement('br'));

    registerButton.onclick = function(){
        //setDisplay(loginPanel,'none');
        authBody.removeChild(loginPanel);
        authBody.appendChild(registerPanel);
        //setDisplay(registerPanel,'inline');
    };


  
    backButton.onclick = function(){
        authBody.appendChild(loginPanel);
        authBody.removeChild(registerPanel);
    };


    var validatePassword = function() {
        if(registerPassword.value != confirmPassword.value) {
            confirmPassword.setCustomValidity("Passwords Don't Match");
        } else {
            confirmPassword.setCustomValidity('');
        }
    };

    registerPassword.addEventListener('change', validatePassword);
    confirmPassword.addEventListener('keyup', validatePassword);



    // loginPassword.onkeyup = function(){
    //     if(loginStatus == 401 && prePassword == loginPassword.value) {
    //         console.log('set');
    //         loginPassword.setCustomValidity("Passwords Don't Match");
    //     } else {
    //         loginPassword.setCustomValidity('');
    //     }
    // };

    loginForm.onsubmit = function(e){
 
        e.preventDefault();
        var loginInfo = { email:loginForm.elements.email.value, password: loginForm.elements.password.value };
        httpPostAsync(loginUrl, loginInfo, function(res) {
            if(res.status == 401) {
                alert('invalid password');
            }
            else{
                setCookie('userInfo',JSON.stringify({id:res.data.user.id,isAdmin:res.data.user.isAdmin,username:res.data.user.username}),365);
                checkCookie();
                signals.userLogin.dispatch(true);
                document.body.removeChild(landingPage);
            }
        });
 
    };
    
    registerForm.onsubmit = function(e){
        e.preventDefault();
        var registerInfo = { username:registerForm.elements.username.value, email:registerForm.elements.email.value, password: registerForm.elements.password.value } ;
         httpPostAsync(registerUrl, registerInfo, function(res) {

            setCookie('userInfo',JSON.stringify({id:res.data.user.id,isAdmin:res.data.user.isAdmin,username:res.data.user.username}),365);
            signals.userLogin.dispatch(true);
            signals.isAdmin.dispatch(false);
            document.body.removeChild(landingPage);
            
        });
        
    };


    function setDisplay( elem, display ) {

        elem.setAttribute('style','display:'+display);

    }


    function checkCookie(){
        let userInfo = getCookie('userInfo');
        if(userInfo != '') userInfo = JSON.parse(getCookie('userInfo'));
        if (userInfo.id!=null && userInfo.id!=""){
            //to do call api and return user profile
            // alert('Welcome again '+username+'!');
            if(userInfo.isAdmin) signals.isAdmin.dispatch(true);
            else signals.isAdmin.dispatch(false);
            return true;
        }
        else {
            return false;
        }

    }

    var footer = document.createElement('div');
    footer.setAttribute('class','footer');
    landingPage.appendChild(footer);

    
    var contact = document.createElement('div');
    contact.setAttribute('class','contact');
    contact.innerHTML = 'For any feedback please contact Milad Ghasri <br/> at m.ghasri@unsw.edu.au';
    footer.appendChild(contact);


    // add logo to the landing page
   

    var unswLogo = document.createElement('img');
       unswLogo.setAttribute('class','unswLogo');
    unswLogo.setAttribute('src','./image/unsw.png');

    footer.appendChild(unswLogo);


};
function setCookie(c_name,value,expiredays){
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +escape(value)+
    ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}
function getCookie(c_name) {
    if (document.cookie.length>0) {
        c_start=document.cookie.indexOf(c_name + "=");
        if (c_start!=-1) { 
            c_start=c_start + c_name.length+1 ;
            c_end=document.cookie.indexOf(";",c_start);
            if (c_end==-1) c_end=document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        } 
    }
    return "";
}

function getUserInfo(){
  return  JSON.parse(getCookie('userInfo'));

}


