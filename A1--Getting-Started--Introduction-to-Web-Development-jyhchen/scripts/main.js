const myHeading = document.querySelector('h1');

let name = 'justin';
let buttonText = 'see other photo'
let defaultImage = true
let bioImage = document.querySelector('img')
let button = document.querySelector('button');
let buttonHeader = document.querySelector('h2');
button.onclick = function() {
    onclickHandler();
}

function onclickHandler() {
    alert('changing')
    if (defaultImage) {
        buttonText = 'see default photo'
        bioImage.setAttribute('src', 'images/justin_img_2.jpg');
    } else {
        buttonText = 'see other photo'
        bioImage.setAttribute('src', 'images/justin_img_1.jpg');
    }
    defaultImage = !defaultImage
    button.textContent = buttonText

}