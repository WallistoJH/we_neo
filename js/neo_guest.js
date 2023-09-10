/*
  작업자: 박재한
  문의: wallisto_jh@icloud.com / insta: jaehan.p__k
*/


// 전역변수 선언
let Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;
let engine;
let world;
let boxes = [];
let input;
let submitButton;
let ground;
let leftWall;
let rightWall;
let mouseConstraint;
let canvas;


// 함수: P5.js 셋업
// _______________
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  // 물리엔진 세팅
  engine = Engine.create({
    enableSleeping: true
  });
  world = engine.world;
  // 물리엔진 작동
  Engine.run(engine);

  // 인풋 만들기 (html 구현)
  input = createInput();
  input.position(20, 20);
  input.id('NameInput');
  // 버튼 만들기 (html 구현)
  submitButton = createButton('Submit');
  submitButton.position(input.x + input.width, 20);
  submitButton.mousePressed(addBox);
  submitButton.id('NameButton');

  // 로컬 스토리지에서 저장된 텍스트를 불러와서 박스를 생성
  let savedTexts = localStorage.getItem('texts');
  if (savedTexts) {
    let texts = JSON.parse(savedTexts);
    texts.forEach(text => {
      reBox(text);
    });
  }

  // 그라운드 옵션 및 추가
  let groundOptions = {
    friction: 1,
    restitution: 0.6,
    isStatic: true
  };
  ground = Bodies.rectangle(width / 2, height, width, 50, groundOptions);
  World.add(world, ground);

  // 벽 옵션 및 추가
  let wallOptions = {
    friction: 1,
    restitution: 0.6,
    isStatic: true
  };
  leftWall = Bodies.rectangle(0, height / 2, 50, height, wallOptions);
  rightWall = Bodies.rectangle(width, height / 2, 50, height, wallOptions);
  World.add(world, [leftWall, rightWall]);

  // 마우스 제약 설정
  let canvasMouse = Mouse.create(canvas.elt);
  let mouseOptions = {
    mouse: canvasMouse
  };
  mouseConstraint = MouseConstraint.create(engine, mouseOptions);
  World.add(world, mouseConstraint);
}


// 함수: 창 리사이즈시 새로고침
// _______________
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
//   alert('창크기가 변경되어 새로고침합니다.');
//   location.reload();
}


// 함수: P5.js 드로우
// _______________
function draw() {
  background(0);
  // 박스 배열을 순회하며 각 박스를 그림.
  for (let i = 0; i < boxes.length; i++) {
    let box = boxes[i];
    let pos = box.position;
    let angle = box.angle;

    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text(box.text, 0, 0);
    pop();
  }
  // 물리적인 바닥과 벽을 그림.
  push();
  fill('rgba(0,0,0,0)');
  rectMode(CENTER);
  rect(ground.position.x, ground.position.y, width, 50);
  rect(leftWall.position.x, leftWall.position.y, 50, height);
  rect(rightWall.position.x, rightWall.position.y, 50, height);
  pop();
}


// 함수: input입력시 텍스트박스
// _______________
function addBox(text) {
  // 텍스트의 길이에 따라 박스의 너비 조정
  let boxWidth = text ? text.length * 45 : 100;
  let boxHeight = 50;
  let x = random(windowWidth * 0.45, windowWidth * 0.55);
  let y = -boxHeight / 2;
  // Matter.js에서 박스 생성
  let box = Bodies.rectangle(x, y, boxWidth, boxHeight, {
    friction: 0.3, // 마찰력
    restitution: 0.8
  });
  boxes.push(box);
  World.add(world, box);
  // 텍스트 입력값을 박스에 저장
  if (text) {
    box.text = text;
  } else {
    box.text = input.value();
    input.value('');
  }
  // 텍스트 배열을 로컬 스토리지에 저장
  let texts = boxes.map(box => box.text);
  localStorage.setItem('texts', JSON.stringify(texts));
  input.value('');
}


// 함수: 새로고침시 로컬스토리지 텍스트박스 처리
// _______________
function reBox(text) {
  // 텍스트의 길이에 따라 박스의 너비 조정
  let boxWidth = text ? text.length * 45 : 100;
  let boxHeight = 50;
  let x = random(windowWidth * 0.2, windowWidth * 0.8);
  let y = random(-2000, 0);
  // Matter.js에서 박스 생성
  let box = Bodies.rectangle(x, y, boxWidth, boxHeight, {
    friction: 0.3, // 마찰력
    restitution: 0.8
  });
  boxes.push(box);
  World.add(world, box);
  // 텍스트를 박스에 저장
  box.text = text;
  // 텍스트 배열을 로컬 스토리지에 저장
  let texts = boxes.map(box => box.text);
  localStorage.setItem('texts', JSON.stringify(texts));
}

// 함수: 텍스트 박스 삭제
// _______________
function deleteBox(box) {
  // Matter.js에서 박스 제거
  World.remove(world, box);
  let index = boxes.indexOf(box);
  boxes.splice(index, 1);

  // 텍스트 배열을 로컬 스토리지에 저장
  let texts = boxes.map(box => box.text);
  localStorage.setItem('texts', JSON.stringify(texts));
}

// 함수: 텍스트박스 더블클릭
// _______________
function doubleClicked() {
  for (let i = boxes.length - 1; i >= 0; i--) {
    let box = boxes[i];
    let pos = box.position;
    let boxWidth = box.bounds.max.x - box.bounds.min.x;
    let boxHeight = box.bounds.max.y - box.bounds.min.y;
    // 마우스 클릭 위치와 텍스트박스의 위치 비교
    if (
      mouseX >= pos.x - boxWidth / 2 &&
      mouseX <= pos.x + boxWidth / 2 &&
      mouseY >= pos.y - boxHeight / 2 &&
      mouseY <= pos.y + boxHeight / 2
    ) {
      deleteBox(box);
      break;
    }
  }
}

// 함수: 키프레스(엔터)
// _______________
function keyPressed() {
  if (keyCode === ENTER) {
    let text = input.value(); // 입력된 텍스트 값을 가져옴
    addBox(text); // addBox() 함수에 텍스트 값을 전달하여 호출
  }
}


// 함수: 로컬스토리지 리셋
// _______________
function resetMessages() {
  boxes = [];
  localStorage.removeItem('texts');
  location.reload();
  setTimeout(function () {
    location.reload();
  }, 400);
}


// 함수: CSV파일 내보내기
// _______________
function exportCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  let texts = boxes.map(box => box.text);
  texts.forEach(text => {
    csvContent += text + "\n";
  });

  let encodedUri = encodeURI(csvContent);
  let link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
}


// 함수: CSV파일 불러오기
// _______________
function importCSV(event) {
  let file = event.target.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    let contents = e.target.result;
    let lines = contents.split("\n");
    let texts = [];
    lines.forEach(line => {
      let text = line.trim();
      if (text !== "") {
        texts.push(text);
      }
    });
    boxes = [];
    texts.forEach(text => {
      reBox(text);
    });
    localStorage.setItem('texts', JSON.stringify(texts));
    location.reload();
  };
  reader.readAsText(file);
}


// CSV파일 가져올때 이벤트 리스너 체인지
// _______________
document.getElementById('CSVFileInput').addEventListener('change', importCSV);


// 리셋버튼 클릭시 새로고침 트리거
// _______________
$(document).ready(function () {
  $('#ResetButton').click(function () {
    setTimeout(function () {
      location.reload();
    }, 100);
  });
});