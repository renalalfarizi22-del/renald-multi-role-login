// Popup system (dinamis)
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");
const closePopup = document.getElementById("closePopup");

window.showPopup = function(message) {
  popupMessage.textContent = message;
  popup.classList.remove("hidden");
};

closePopup.addEventListener("click", () => {
  popup.classList.add("hidden");
});
