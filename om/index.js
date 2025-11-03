// ===============================
// IFRAME SWITCHER
// ===============================
function changeFrame(type) {
  const iframe = document.getElementById("mainFrame");

  // Initially hide
  iframe.style.opacity = 0;
  iframe.style.display = "none";

  // Choose source
  let newSrc = "";
  switch (type) {
    case "master":
      newSrc = "https://docs.google.com/spreadsheets/d/15ouIKyyo1pfegl7oMxUgNgy_36JPb87Ta4JGxgws5HI/edit?usp=sharing";
      break;

    case "search":
      newSrc = "https://tephdy.github.io/WEB-APP/";
      break;

    case "waitlist":
      newSrc = "https://docs.google.com/spreadsheets/d/1S2v43l75aC6EpyCkXNifSfFYvuXE_XJ9HPcr0RDyhtg/edit?usp=sharing";
      break;

    case "bnb":
      newSrc = "https://docs.google.com/spreadsheets/d/1aWdlIT9aRwT4FktT_3oB0poxC8xyC0lOTDKEj574M2Y/edit?usp=sharing";
      break;

      case "vacancy":
      newSrc = "https://docs.google.com/spreadsheets/d/1Z_3YqO4ve0TvbkV4Lrg6X9utii7EswQiwnczFcAKvsI/edit?usp=sharing";
      break;

      case "feedback":
      newSrc = "https://docs.google.com/spreadsheets/d/1NhuvtNtXWxWPt05lAbrvRs99RnMffoKq8RVIXaFXR-Q/edit?usp=sharing";
      break;

      case "green":
      newSrc = "https://docs.google.com/spreadsheets/d/1HGtfKtk7mxAdqn3sDAV_GMV7iuOYkWYo-0R562rAFUE/edit?usp=sharing";
      break;

    case "calendar":
      newSrc = "https://calendar.google.com/calendar/embed?src=f8939355c05bdafed63e7eb02789566c7ebe844c36005d3ce552d4d2fd6cba16%40group.calendar.google.com&ctz=Asia%2FManila";
      break;

    default:
      newSrc = "https://tephdy.github.io/WEB-APP/";
  }

  // Update src
  setTimeout(() => {
    iframe.src = newSrc;

    // Show iframe once it has a valid src
    if (newSrc && newSrc.trim() !== "") {
      iframe.style.display = "block";
    }

    // Smooth fade-in when loaded
    iframe.onload = () => {
      iframe.style.transition = "opacity 0.4s ease";
      iframe.style.opacity = 1;
    };
  }, 200);
}
