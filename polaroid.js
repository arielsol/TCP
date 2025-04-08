let nodes = [];
let draggingNode = null;
let offsetX = 0,
  offsetY = 0;
let nodeImage;
let zoom = 1;
let lastMouseX, lastMouseY;
let isPanning = false;

function preload() {
  // Load a sample image from the web
  nodeImage = loadImage("assets/Laos-29.JPG");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");
  textSize(14);

  let radius = 200;
  let centerX = width / 2;
  let centerY = height / 2;

  // Create 32 nodes positioned in a circle
  for (let i = 0; i < 32; i++) {
    let angle = (TWO_PI * i) / 32;
    let x = centerX + radius * cos(angle);
    let y = centerY + radius * sin(angle);
    nodes.push(new Node(x, y, `Node ${i + 1}`));
  }
}

function draw() {
  background(245);

  translate(offsetX, offsetY); // Apply pan to the entire canvas
  scale(zoom); // Apply zoom

  // Wait until the image is loaded
  if (!nodeImage || !nodeImage.width) {
    fill(0);
    text("Loading image...", 20, 20);
    return;
  }

  // Draw connections between all nodes
  stroke(180);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
    }
  }

  // Draw all nodes
  for (let node of nodes) {
    node.display();
  }
}

function mouseWheel(event) {
  zoom += event.delta * -0.001; // Adjust the zoom speed
  zoom = constrain(zoom, 0.5, 3); // Constrain zoom level to prevent it from being too small or large
}

function touchStarted() {
  draggingNode = null;

  if (touches.length === 0) return;

  let adjustedTouchX = (touches[0].x - offsetX) / zoom;
  let adjustedTouchY = (touches[0].y - offsetY) / zoom;

  // Check if any node is clicked
  for (let node of nodes) {
    if (node.isMouseOver(adjustedTouchX, adjustedTouchY)) {
      draggingNode = node;
      return false;
    }
  }

  // If no node is touched, allow panning
  draggingNode = "pan";
  lastMouseX = touches[0].x;
  lastMouseY = touches[0].y;
  isPanning = false;
  return false;
}

function touchMoved() {
  if (touches.length === 0) return;

  if (draggingNode === "pan") {
    if (dist(touches[0].x, touches[0].y, lastMouseX, lastMouseY) > 5) {
      isPanning = true;
      offsetX += touches[0].x - lastMouseX;
      offsetY += touches[0].y - lastMouseY;
    }
  } else if (draggingNode) {
    let adjustedTouchX = (touches[0].x - offsetX) / zoom;
    let adjustedTouchY = (touches[0].y - offsetY) / zoom;

    draggingNode.x = adjustedTouchX - offsetX;
    draggingNode.y = adjustedTouchY - offsetY;
  }

  lastMouseX = touches[0].x;
  lastMouseY = touches[0].y;
  return false;
}

// Replace mouseReleased with touchEnded for mobile
function touchEnded() {
  draggingNode = null; // Reset draggingNode when touch is released
  isPanning = false; // Reset panning state

  return false; // Prevent the default browser touch action
}

class Node {
  constructor(x, y, label) {
    this.x = x;
    this.y = y;
    this.label = label;
    this.size = 60;
  }

  display() {
    imageMode(CENTER);
    image(nodeImage, this.x, this.y, this.size, this.size);

    // Ensure there's a touch point
    if (touches.length === 0) return;

    // Adjust touch position for zooming
    let adjustedTouchX = (touches[0].x - offsetX) / zoom;
    let adjustedTouchY = (touches[0].y - offsetY) / zoom;

    if (this.isMouseOver(adjustedTouchX, adjustedTouchY)) {
      fill(0);
      noStroke();
      textAlign(CENTER);
      text(this.label, this.x, this.y - this.size / 2 - 10);
    }
  }

  isMouseOver(mouseX, mouseY) {
    return dist(mouseX, mouseY, this.x, this.y) < this.size / 2;
  }
}
