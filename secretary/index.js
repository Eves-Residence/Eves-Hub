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
      
    case "calendar":
      newSrc = "https://calendar.google.com/calendar/embed?src=f8939355c05bdafed63e7eb02789566c7ebe844c36005d3ce552d4d2fd6cba16%40group.calendar.google.com&ctz=Asia%2FManila";
    break;

    case "attendance":
      newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfXacHkUdWuQNvv1Pwcyx--NDFqFwjITTYL7672ZL6BG4-SgA/viewform?embedded=true";
    break;

    case "off":
      newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSdgQKxcuAsomlhDX6yDsPI1s5O-x-u36-YPtHGGu-33QMMMCQ/viewform?embedded=true";
    break;

    case "ca":
      newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSfhw4VyYKI9fc05UGtkvpRx0kIo98QRTKQsH_3NTpZAdzxi4w/viewform?embedded=true";
    break;

    case "jo":
      newSrc = "https://eves-residence.github.io/JOB-ORDER/";
      break;

    // case "feedback":
    //   newSrc = "https://docs.google.com/forms/d/e/1FAIpQLSc4Nu4EaO-AWIRGSFDixPxj9jMOZ-prjuNlOcnFUKzWKbGE-Q/viewform?embedded=true";
    //   break;

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





