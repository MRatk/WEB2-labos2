(async function getUser(){
    const response = await fetch('/userProfile');
    if(response.ok){
        const data = await response.json();
        //console.log(data);
        document.getElementById('userName').innerText = `Welcome user: ${data.nickname}`;
        const roleResp = await fetch('/userRole');
        if(roleResp.ok){
            const role = await roleResp.json();
            if(role.roles !== null){
                document.getElementById('userRole').innerText = `Your role is: ${role.roles}`;
            }else {
                document.getElementById('userRole').innerText = `You have no roles`;
            }
        }
    }else{
        alert("User not signed in!");
    }
})();

function home_redirect(){
    window.location.href = 'home.html';
}