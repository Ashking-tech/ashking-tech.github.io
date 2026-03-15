const texts = [
  "p2p developer",
  "backend developer",
  "networking enthusiast",
  "go programmer"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typeSpeed = 80;
const deleteSpeed = 40;
const pauseDuration = 1500;

const typewriterElement = document.getElementById('typewriter');

function type() {
  const currentText = texts[textIndex];
  
  if (isDeleting) {
    typewriterElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
  }
  
  let timeout = isDeleting ? deleteSpeed : typeSpeed;
  
  if (!isDeleting && charIndex === currentText.length) {
    timeout = pauseDuration;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % texts.length;
    timeout = 300;
  }
  
  setTimeout(type, timeout);
}

document.addEventListener('DOMContentLoaded', type);
