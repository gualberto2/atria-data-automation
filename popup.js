// Below we are reading and parsing the excel file into importable data
let excelData = null;
document
  .getElementById("fileinput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const data = e.target.result;
        // Data process step 2 goes here
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        console.log(excelData);
      };

      reader.readAsBinaryString(file);
    }
  });

// Below is the logic to start the automation injection process by opening a new window. As well as sending the
// - parsed data to the newTabScript, via the service_worker.js.....
document.getElementById("start").addEventListener("click", () => {
  // Below is the code that sends a message to start the injection process.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    // Send message to "service_worker.js" to start the injection process
    chrome.tabs.sendMessage(
      activeTab.id,
      { action: "startInjection", data: excelData },
      (response) => {
        if (response && response.status === "success") {
          console.log("Data transfer successful");
        } else {
          console.error("Data injection failed. See error.");
        }
      }
    );
  });
});
