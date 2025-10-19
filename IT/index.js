
// ===============================
// IFRAME SWITCHER
// ===============================
function changeFrame(type) {
  const iframe = document.getElementById("mainFrame");
  iframe.style.opacity = 0;

  setTimeout(() => {
    switch (type) {
      case "master":
        iframe.src = "https://docs.google.com/spreadsheets/d/15ouIKyyo1pfegl7oMxUgNgy_36JPb87Ta4JGxgws5HI/edit?usp=sharing";
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
      case "calendar":
        iframe.src = "https://calendar.google.com/calendar/embed?src=f8939355c05bdafed63e7eb02789566c7ebe844c36005d3ce552d4d2fd6cba16%40group.calendar.google.com&ctz=Asia%2FManila";
        break;
      default:
        iframe.src = "https://tephdy.github.io/WEB-APP/";
    }
    iframe.onload = () => (iframe.style.opacity = 1);
  }, 200);
}

//task manager

