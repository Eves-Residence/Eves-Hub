
// ===============================
// IFRAME SWITCHER
// ===============================
function changeFrame(type) {
  const iframe = document.getElementById("mainFrame");
  iframe.style.opacity = 0;

  setTimeout(() => {
    switch (type) {
      case "vacancy":
        iframe.src = "https://docs.google.com/spreadsheets/d/18xxjZHVO_4Ert_uTvuYWKfqz5x_eAkdqzo5YvWGPRkI/edit?usp=sharing";
        break;  
      case "search":
        iframe.src = "https://tephdy.github.io/WEB-APP/";
        break;
      case "waitlist":
        iframe.src = "https://docs.google.com/spreadsheets/d/1S2v43l75aC6EpyCkXNifSfFYvuXE_XJ9HPcr0RDyhtg/edit?usp=sharing";
        break;
      case "bnb":
        iframe.src = "https://docs.google.com/spreadsheets/d/1aWdlIT9aRwT4FktT_3oB0poxC8xyC0lOTDKEj574M2Y/edit?usp=sharing";
        break;
      case "task":
        iframe.src = "https://eves-residence.github.io/Task-Manager/";
        break;
      default:
        iframe.src = "https://tephdy.github.io/WEB-APP/";
    }
    iframe.onload = () => (iframe.style.opacity = 1);
  }, 200);
}
