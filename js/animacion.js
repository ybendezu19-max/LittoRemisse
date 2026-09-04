const elementos = document.querySelectorAll(".animar");

window.addEventListener("scroll", () => {

let trigger = window.innerHeight * 0.85;

elementos.forEach(el => {

let top = el.getBoundingClientRect().top;

if(top < trigger){
el.classList.add("visible");
}

});

});