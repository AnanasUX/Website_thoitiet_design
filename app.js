  function toggleExpandedButtons() {
    const expandedButtons = document.querySelector(".expanded-buttons");
    const floatingButton = document.querySelector(".floating-button");
    expandedButtons.classList.toggle("visible");
    floatingButton.classList.remove("visible");
  }
  
  function closeExpandedButtons() {
    const expandedButtons = document.querySelector(".expanded-buttons");
    const floatingButton = document.querySelector(".floating-button");
    expandedButtons.classList.remove("visible");
    floatingButton.classList.toggle("visible");
  }
  function closeAds() {
    const closeBtn = document.querySelector(".close-btn");
    const ads = document.querySelector(".ads");
    closeBtn.addEventListener("click", () => {
      console.log(1);
      ads.classList.remove("visible");
    });
  }
  //function handleButtonClick(buttonNumber) {
  //  if (buttonNumber == 1) {
  //    window.open("https://zalo.me/vangphuquy");
  //  }
  //  if (buttonNumber == 2) {
  //    window.open("tel:0949693030");
  //  }
  //  if (buttonNumber == 3) {
  //    window.open("https://m.me/phuquygroup.vn");
  //  }
  //  if (buttonNumber == 4) {
  //      window.open("tel:0904891213");
  //  }
//}
function handleButtonClick(target) {
    if (target) {
        window.open(target);
    }
}

  function onClickConnect(i){
    if(i==2){
      window.open("https://www.facebook.com/phuquygroup2003")
    }
    if(i==1){
      window.open("https://www.facebook.com/profile.php?id=61555539582901")
    }
    if(i==3){
      window.open("https://zalo.me/vangphuquy")
    }
  }
  
  function toPhuQuy() {
   window.location.href = "https://phuquy.com.vn"
  }
  call = (number) =>{

  }