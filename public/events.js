// document.addEventListener('click', (eve) => {
//     const audio = document.getElementById("myaudio");
    
//     if(eve.target.className.includes('chatbutton')){
//         audio.play();
//     }
// });

USERNAME = prompt("Enter username:");


if(USERNAME == ''){
    USERNAME = "Anonymous" + Math.floor(Math.random() * 1000);
}