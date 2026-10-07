const $ = (selector) => document.querySelector(selector);
const canvas = $('#graph');
const ctx = canvas.getContext('2d');
const aInput = $('#a');
const bInput = $('#b');
let mode = 'quadratic';
let pointer = null;
let geometry = {};
const number = value => Math.abs(value) < 0.001 ? '0' : String(Math.round(value * 100) / 100).replace('-', '−');
const evaluate = (x, a, b) => mode === 'quadratic' ? a * x * x + b : mode === 'linear' ? a * x + b : a * Math.sin(x) + b;

function drawHero() {
  const svg = $('#hero-graph');
  let content = '';
  for (let x = 0; x <= 540; x += 30) content += `<path d="M${x} 0V350" stroke="#eef0f5"/>`;
  for (let y = 0; y <= 350; y += 30) content += `<path d="M0 ${y}H540" stroke="#eef0f5"/>`;
  content += '<path d="M0 210H535M270 350V7" stroke="#b8bfcc" stroke-width="1.2"/><path d="m530 206 5 4-5 4M266 12l4-5 4 5" fill="none" stroke="#b8bfcc"/><text x="521" y="229" font-size="11" fill="#a1a7b4">x</text><text x="281" y="18" font-size="11" fill="#a1a7b4">y</text>';
  for (let i = -8; i <= 8; i += 2) if (i) content += `<text x="${270 + i * 30}" y="228" font-family="Arial" font-size="9" text-anchor="middle" fill="#a5acb9">${i}</text>`;
  for (let i = -4; i <= 6; i += 2) if (i) content += `<text x="257" y="${214 - i * 30}" font-family="Arial" font-size="9" text-anchor="end" fill="#a5acb9">${i}</text>`;
  const path = fn => Array.from({length:541}, (_,i) => `${i ? 'L' : 'M'}${i},${210 - fn((i-270)/30)*30}`).join(' ');
  content += `<path d="${path(x=>x*x)}" fill="none" stroke="#8a6de0" stroke-width="3"/><path d="${path(x=>Math.sin(x))}" fill="none" stroke="#7baf98" stroke-width="2.5"/><circle cx="270" cy="210" r="5" fill="#8a6de0" stroke="white" stroke-width="2"/>`;
  svg.innerHTML = content;
}

function drawGraph() {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width, height = rect.height;
  if (!width || !height) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const scale = Math.min(width / 14, height / 10);
  const ox = width / 2, oy = height / 2;
  geometry = {width, height, scale, ox, oy};
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#edf0f5';
  ctx.beginPath();
  for (let i = -Math.ceil(width / scale / 2); i <= width / scale / 2; i++) {const x=ox+i*scale;ctx.moveTo(x,0);ctx.lineTo(x,height);}
  for (let i = -Math.ceil(height / scale / 2); i <= height / scale / 2; i++) {const y=oy+i*scale;ctx.moveTo(0,y);ctx.lineTo(width,y);}
  ctx.stroke();
  ctx.strokeStyle = '#b5bdcb'; ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(width-8,oy);ctx.moveTo(ox,height);ctx.lineTo(ox,8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(width-13,oy-3);ctx.lineTo(width-8,oy);ctx.lineTo(width-13,oy+3);ctx.moveTo(ox-3,13);ctx.lineTo(ox,8);ctx.lineTo(ox+3,13);ctx.stroke();
  ctx.font='10px Manrope, Arial';ctx.fillStyle='#929bab';ctx.textAlign='center';
  for(let i=-Math.floor(width/scale/2)+1;i<width/scale/2;i++)if(i)ctx.fillText(number(i),ox+i*scale,oy+17);
  ctx.textAlign='right';
  for(let i=-Math.floor(height/scale/2)+1;i<height/scale/2;i++)if(i)ctx.fillText(number(i),ox-10,oy-i*scale+3);
  ctx.fillText('0',ox-9,oy+17);ctx.fillText('x',width-13,oy-10);ctx.fillText('y',ox+16,16);
  const a=Number(aInput.value), b=Number(bInput.value);
  ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();ctx.strokeStyle='#8264d9';ctx.lineWidth=2.8;ctx.lineJoin='round';ctx.beginPath();
  for(let px=0;px<=width;px++){const y=oy-evaluate((px-ox)/scale,a,b)*scale;px===0?ctx.moveTo(px,y):ctx.lineTo(px,y);}ctx.stroke();
  const py=oy-b*scale;
  ctx.beginPath();ctx.arc(ox,py,5,0,Math.PI*2);ctx.fillStyle='#8264d9';ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();
  if(pointer !== null){
    const x=(pointer-ox)/scale, y=evaluate(x,a,b), screenY=oy-y*scale;
    if(screenY>=0 && screenY<=height){
      ctx.setLineDash([4,4]);ctx.lineWidth=1;ctx.strokeStyle='#c4b5e9';ctx.beginPath();ctx.moveTo(pointer,oy);ctx.lineTo(pointer,screenY);ctx.lineTo(ox,screenY);ctx.stroke();ctx.setLineDash([]);
      ctx.beginPath();ctx.arc(pointer,screenY,5,0,Math.PI*2);ctx.fillStyle='#8264d9';ctx.fill();ctx.strokeStyle='white';ctx.stroke();
      const label=`(${number(x)}; ${number(y)})`;ctx.font='11px Manrope, Arial';const tw=ctx.measureText(label).width+20;
      const tx=Math.min(Math.max(pointer+12,4),width-tw-4),ty=Math.max(4,Math.min(screenY-35,height-30));
      ctx.fillStyle='#f0ebfa';ctx.fillRect(tx,ty,tw,25);ctx.fillStyle='#7358ba';ctx.textAlign='left';ctx.fillText(label,tx+10,ty+17);
    }
  }
  ctx.restore();
}

function update() {
  const a=Number(aInput.value), b=Number(bInput.value);
  $('#a-value').textContent=number(a);$('#b-value').textContent=number(b);
  const term=mode==='quadratic'?'x²':mode==='linear'?'x':'sin(x)';
  const expression=`${number(a)}${term} ${b<0?'−':'+'} ${number(Math.abs(b))}`;
  $('#equation').innerHTML=`f(x) = <span>${number(a)}</span>${term} ${b<0?'−':'+'} <span>${number(Math.abs(b))}</span>`;
  canvas.setAttribute('aria-label',`Графік функції f(x) = ${expression}`);
  const names={quadratic:'Квадратична функція',linear:'Лінійна функція',sine:'Синусоїда'};
  $('#graph-name').textContent=a===0?'Стала функція':names[mode];
  if(a===0){$('#insight').textContent='Коли a = 0, функція стала: f(x) = b. Її графік — горизонтальна пряма.';$('#graph-caption').textContent=`Стала функція: y = ${number(b)}`;}
  else if(mode==='quadratic'){
    $('#insight').textContent=`Коли a ${a>0?'>':'<'} 0, гілки параболи дивляться ${a>0?'вгору':'вниз'}. Що більше |a|, то вужча парабола. Параметр b зміщує її по вертикалі.`;
    $('#graph-caption').textContent=`Вершина: (0; ${number(b)})`;
  }else if(mode==='linear'){
    $('#insight').textContent=`Коефіцієнт a задає нахил: пряма ${a>0?'зростає':'спадає'}. Параметр b — це координата перетину з віссю y.`;
    $('#graph-caption').textContent=`Перетин з віссю y: (0; ${number(b)})`;
  }else{
    $('#insight').textContent='Амплітуда хвилі дорівнює |a|, а b зміщує її вгору або вниз. Від’ємне a віддзеркалює хвилю відносно лінії y = b.';
    $('#graph-caption').textContent=`Амплітуда: ${number(Math.abs(a))} · Період: 2π`;
  }
  drawGraph();
}

function selectMode(next) {
  mode=next;
  document.querySelectorAll('[data-function]').forEach(button=>{const active=button.dataset.function===mode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  update();
}
document.querySelectorAll('[data-function]').forEach(button=>button.addEventListener('click',()=>selectMode(button.dataset.function)));
aInput.addEventListener('input',update);bInput.addEventListener('input',update);
$('#reset').addEventListener('click',()=>{aInput.value=1;bInput.value=0;pointer=null;update();});
canvas.addEventListener('pointermove',event=>{pointer=event.clientX-canvas.getBoundingClientRect().left;drawGraph();});
canvas.addEventListener('pointerleave',()=>{pointer=null;drawGraph();});
canvas.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();pointer=Math.max(0,Math.min(geometry.width,(pointer??geometry.ox)+(event.key==='ArrowRight'?1:-1)*geometry.scale/4));drawGraph();}});
document.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-answer]').forEach(answer=>answer.classList.remove('correct','incorrect'));
  const correct=button.dataset.answer==='down';button.classList.add(correct?'correct':'incorrect');
  $('#quiz-feedback').textContent=correct?'Так! a = −2 < 0, тому гілки спрямовані вниз. А вершина — у точці (0; 3).':'Спробуй ще раз: знак коефіцієнта біля x² визначає напрям гілок. Тут a = −2.';
}));
$('#show-challenge').addEventListener('click',()=>{aInput.value=-2;bInput.value=3;pointer=null;selectMode('quadratic');$('#playground').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
new ResizeObserver(drawGraph).observe(canvas);
drawHero();update();
document.fonts.ready.then(drawGraph);
