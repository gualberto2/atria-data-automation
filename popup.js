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

        // Can use or process this json data created from the function above
        // for example:
        if (excelData.length > 0) {
          alert(JSON.stringify(excelData[0]));
        }
      };

      reader.readAsBinaryString(file);
    }
  });
