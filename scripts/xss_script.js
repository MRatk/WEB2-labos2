const urlPar = new URLSearchParams(window.location.search);
let text = urlPar.get('text');
// Ova funkcija prima argument (korisnikov unos) te zamjenjuje sve znakove koji se mogu interpretirati kao dijelovi HTML ili JavaScript naredbi te ih zamjenjuje s njihovim HTML entitetima,
// čime se onemogućava njihovo korištenje u izvršavanju naredbi.
function sanitizeText(x) {
    return x
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

if(text){
    if(!urlPar.has('sanitize')){
        //document.getElementById('xss_comm').innerText = text;
        document.write(text);
    }else{
        text = sanitizeText(text);
        document.getElementById('xss_comm').textContent = text;
    }
}

function home_redirect(){
    window.location.href = 'home.html';
}
