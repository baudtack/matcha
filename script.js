"use strict";

document.addEventListener("DOMContentLoaded", (event) => {
  let evalCount = 0;
  let evalButton = document.getElementById("eval");

  evalButton.addEventListener("click", (e) => {
      let code = document.getElementById("code").value;
      let resultDiv = document.getElementById("result");
      let old = document.getElementById("old");
      let hist = document.createElement("div");
      
      resultDiv.textContent = evaluate(read(code));

      evalCount++;

      hist.id = evalCount;
      hist.textContent = code;

      old.prepend(hist);
  });
});