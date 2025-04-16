window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  const clearBtn = document.getElementById('clear');
  const predictBtn = document.getElementById('predict');
  const typedText = document.getElementById('typedText');

  let drawing = false;
  let modelReady = false;

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mousemove', draw);

  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });

  function getPos(e) {
    if (e.touches) {
      return [e.touches[0].clientX - canvas.offsetLeft, e.touches[0].clientY - canvas.offsetTop];
    }
    return [e.offsetX, e.offsetY];
  }

  function startDraw(e) {
    drawing = true;
    const [x, y] = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e) {
    if (!drawing) return;
    const [x, y] = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    drawing = false;
    ctx.closePath();
  }

  clearBtn.addEventListener('click', () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  });

  // Load Teachable Machine model
  const URL = "https://teachablemachine.withgoogle.com/models/-uYpKMTS7/";
  let model;

  async function loadModel() {
    if (typeof tmImage === 'undefined') {
      console.error("Teachable Machine library not loaded yet.");
      return;
    }
  
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    modelReady = true;
    predictBtn.disabled = false;
    console.log("Model loaded");
  }

  // Wait for tmImage to be defined before calling loadModel
const waitForTM = setInterval(() => {
    if (typeof tmImage !== 'undefined') {
      clearInterval(waitForTM);
      loadModel();
    }
  }, 100); // check every 100ms

  // Predict from canvas
  predictBtn.addEventListener('click', async () => {
    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = async () => {
        if (!modelReady || !model) {
            output.textContent = "Model not ready yet. Please wait a moment.";
            return;
          }
          const prediction = await model.predict(image);
          console.log("FULL prediction array:", prediction);
          prediction.sort((a, b) => b.probability - a.probability);
      output.textContent = `You drew: ${prediction[0].className} (${(prediction[0].probability * 100).toFixed(1)}%)`;
      typedText.value += prediction[0].className;
    };
  });
});
