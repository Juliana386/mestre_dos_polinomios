// --- CONFIGURAÇÕES GERAIS ---
let nomeAluno = "";
let inputNome, btnComecar;
let estado = "INICIO"; // Estados: INICIO, JOGANDO, GAME_OVER, VITORIA
let vidas = 3;

// Dicas e mensagens motivacionais infantis
let dicasMatematica = [
  "Oops! Quase lá. O leãozinho sabe que você consegue na próxima!",
  "Leãozinho confia em você, continue praticando!" 
];
let dicaAtual = "";

// Variáveis de Tempo e Ranking
let tempoInicio = 0;
let tempoJogo = 0;
let tempoFinalFormatado = "";
let ranking = []; 

// Variáveis de Animação de Fundo
let decoracoes = [];

// Variáveis do Jogo de Polinômios
let botoes = []; 
let passo = 0; 
let timerErro = 0;
let fases = []; 
let faseAtual = 0;

// Efeitos de Confetes para Vitória
let confetes = [];

function setup() {
  createCanvas(800, 650);
  
  // --- CENTRALIZAÇÃO E FUNDO ESCURO DO BROWSER ---
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.backgroundColor = "#0A0A1A"; 
  document.body.style.display = "flex";
  document.body.style.justifyContent = "center";
  document.body.style.alignItems = "center";
  document.body.style.minHeight = "100vh";
  // ------------------------------------------------

  textAlign(CENTER, CENTER);
  textFont('Verdana');
  
  carregarRanking(); 

  // Criar decoração de fundo animado
  for(let i=0; i<30; i++) {
    decoracoes.push({
      x: random(width), y: random(height),
      velY: random(-0.5, -2.0), velRot: random(-0.05, 0.05), rot: random(TWO_PI),
      simbolo: random(['x²', 'x', '±', '√', '0', '=', '÷', '+', '()']),
      tam: random(20, 50), 
      cor: random(['#00E5FF', '#FF007F', '#B388FF', '#00E676', '#FFEA00']) 
    });
  }
  
  // Estilo do Input da Tela Inicial
  inputNome = createInput("");
  inputNome.position(width / 2 - 140, height / 2 + 20);
  inputNome.size(280, 40);
  inputNome.style('font-family', 'Verdana');
  inputNome.style('font-size', '18px');
  inputNome.style('text-align', 'center');
  inputNome.style('border-radius', '8px');
  inputNome.style('border', '2px solid #00E5FF'); 
  inputNome.style('background', '#0B0C10'); 
  inputNome.style('color', '#00E5FF'); 
  inputNome.style('outline', 'none');
  inputNome.style('box-shadow', '0 0 10px rgba(0, 229, 255, 0.4)');
  
  // Estilo do Botão de Começar
  btnComecar = createButton("🚀 COMEÇAR A AVENTURA!");
  btnComecar.position(width / 2 - 140, height / 2 + 80);
  btnComecar.mousePressed(iniciarJogo);
  btnComecar.style('background', 'linear-gradient(90deg, #FF007F 0%, #7000FF 100%)');
  btnComecar.style('color', 'white');
  btnComecar.style('font-family', 'Verdana');
  btnComecar.style('font-weight', '900');
  btnComecar.style('font-size', '15px');
  btnComecar.style('border', '2px solid #FFFFFF');
  btnComecar.style('border-radius', '25px');
  btnComecar.style('padding', '12px 20px');
  btnComecar.style('width', '280px');
  btnComecar.style('cursor', 'pointer');
  btnComecar.style('box-shadow', '0px 0px 15px rgba(255, 0, 127, 0.8)'); 
}

// --- SISTEMA DE RANKING LOCAL ---
function carregarRanking() {
  let salvo = localStorage.getItem('rankingPolinomios');
  if (salvo) {
    try { ranking = JSON.parse(salvo); } 
    catch(e) { ranking = []; }
  }
}

function salvarRanking(nome, tempoSegundos, tempoStr) {
  ranking.push({ nome: nome, tempo: tempoSegundos, formatado: tempoStr });
  ranking.sort((a, b) => a.tempo - b.tempo); 
  ranking = ranking.slice(0, 5); 
  localStorage.setItem('rankingPolinomios', JSON.stringify(ranking));
}

// --- FUNÇÕES AUXILIARES ---
function formatarCoeficiente(n) {
  if (n === 1) return "";
  if (n === -1) return "-";
  return n;
}

function limparEquacao(str) {
  return str.replace(/\+ \-/g, "- ").replace(/\b1x\b/g, "x").replace(/x \· x/g, "x²");
}

// --- GERADORES DE FASES COM DIFICULDADE PROGRESSIVA ---

function criarFaseFatoracao(nivel) {
  let a = floor(random(2, 6));
  let b = floor(random(2, 6));
  let c = floor(random(2, 8)); 

  let a_fmt = formatarCoeficiente(a);
  let b_fmt = formatarCoeficiente(b);

  let eqStr = `${a_fmt}x · (${b_fmt}x + ${c})`;

  let p1_c = `(${a_fmt}x · ${b_fmt}x) + (${a_fmt}x · ${c})`;
  let p1_e1 = nivel > 5 ? `(${a_fmt}x · ${b_fmt}x) + (${a} · ${c})` : `(${a_fmt}x · ${b_fmt}x) + ${c}`;
  let p1_e2 = `(${a_fmt}x + ${b_fmt}x) + (${a_fmt}x + ${c})`; 

  let p2_c = `${a*b}x² + (${a_fmt}x · ${c})`;
  let p2_e1 = nivel > 7 ? `${a*b}x + (${a_fmt}x · ${c})` : `${a+b}x² + (${a_fmt}x · ${c})`; 
  let p2_e2 = `${a*b}x² + ${c}x`; 

  let p3_c = limparEquacao(`${a*b}x² + ${a*c}x`);
  let dist_c = nivel > 8 ? (a*c) + (random()>0.5?1:-1) : a+c;
  let p3_e1 = limparEquacao(`${a*b}x² + ${dist_c}x`); 
  let p3_e2 = limparEquacao(`${a*b}x + ${a*c}x`);

  return {
    eqTxt: eqStr, cor: "#1565C0",
    passos: [
      { perg: "1. Aplique a distributiva (chuveirinho):", c: p1_c, e1: p1_e1, e2: p1_e2, dica: "Multiplique o termo de fora por CADA termo de dentro." },
      { perg: "2. Multiplique o primeiro termo (x · x = x²):", c: p2_c, e1: p2_e1, e2: p2_e2, dica: "Multiplique os números e lembre que x vezes x é x²." },
      { perg: "3. Multiplique o segundo termo (Resultado Final):", c: p3_c, e1: p3_e1, e2: p3_e2, dica: "Multiplique o número de fora pelo segundo número de dentro." }
    ]
  };
}

function criarFaseSomaSub(nivel) {
  let a = floor(random(3, 8));
  let b = floor(random(2, 7));
  let c = floor(random(1, a)); 
  let d = floor(random(1, b)); 

  let ehSoma = random() > 0.5;
  let a_fmt = formatarCoeficiente(a);
  let c_fmt = formatarCoeficiente(c);

  let res_x2 = ehSoma ? (a + c) : (a - c);
  let res_x = ehSoma ? (b + d) : (b - d);

  let dist_x2 = res_x2 + (random()>0.5?1:-1);
  let dist_x = res_x + (random()>0.5?1:-1);

  let eqStr, p1_c, p1_e1, p1_e2, p2_c, p2_e1, p2_e2, p3_c, p3_e1, p3_e2;

  if (!ehSoma) {
    eqStr = `(${a_fmt}x² + ${b}x) - (${c_fmt}x² + ${d}x)`;
    p1_c = `${a_fmt}x² + ${b}x - ${c_fmt}x² - ${d}x`;
    p1_e1 = `${a_fmt}x² + ${b}x - ${c_fmt}x² + ${d}x`;
    p1_e2 = `${a_fmt}x² + ${b}x + ${c_fmt}x² - ${d}x`;

    p2_c = `${formatarCoeficiente(res_x2)}x² + ${b}x - ${d}x`;
    p2_e1 = `${formatarCoeficiente(res_x2)}x⁴ + ${b}x - ${d}x`; 
    p2_e2 = `${formatarCoeficiente(dist_x2)}x² + ${b}x - ${d}x`; 

    p3_c = limparEquacao(`${formatarCoeficiente(res_x2)}x² + ${res_x}x`);
    p3_e1 = limparEquacao(`${formatarCoeficiente(res_x2)}x² + ${dist_x}x`);
    p3_e2 = limparEquacao(`${formatarCoeficiente(res_x2)}x² - ${res_x}x`);
  } else {
    eqStr = `(${a_fmt}x² + ${b}x) + (${c_fmt}x² + ${d}x)`;
    p1_c = `${a_fmt}x² + ${b}x + ${c_fmt}x² + ${d}x`;
    p1_e1 = `${a_fmt}x² + ${b}x + ${c_fmt}x² - ${d}x`;
    p1_e2 = `${a_fmt}x² - ${b}x + ${c_fmt}x² + ${d}x`;

    p2_c = `${formatarCoeficiente(res_x2)}x² + ${b}x + ${d}x`;
    p2_e1 = `${formatarCoeficiente(res_x2)}x⁴ + ${b}x + ${d}x`; 
    p2_e2 = `${formatarCoeficiente(dist_x2)}x² + ${b}x + ${d}x`;

    p3_c = limparEquacao(`${formatarCoeficiente(res_x2)}x² + ${res_x}x`);
    p3_e1 = limparEquacao(`${formatarCoeficiente(res_x2)}x² + ${dist_x}x`);
    p3_e2 = limparEquacao(`${formatarCoeficiente(res_x2)}x² + ${b-d}x`);
  }

  return {
    eqTxt: eqStr, cor: ehSoma ? "#2E7D32" : "#C62828",
    passos: [
      { perg: "1. Tire dos parênteses (cuidado com os sinais):", c: p1_c, e1: p1_e1, e2: p1_e2, dica: ehSoma ? "Soma (+) mantém os sinais iguais." : "Menos (-) inverte TODOS os sinais de dentro!" },
      { perg: "2. Agrupe e resolva apenas quem tem x²:", c: p2_c, e1: p2_e1, e2: p2_e2, dica: "Resolva apenas os números. O x² não muda!" },
      { perg: "3. Resolva quem tem x (Resultado Final):", c: p3_c, e1: p3_e1, e2: p3_e2, dica: "Some ou subtraia os números que acompanham o x." }
    ]
  };
}

// NOVA FUNÇÃO: DIVISÃO DE POLINÔMIO POR MONÔMIO
function criarFaseDivisao(nivel) {
  let divisor = floor(random(2, 6)); // O número que vai dividir
  let r1 = floor(random(2, 7)); // Resultado termo 1
  let r2 = floor(random(2, 7)); // Resultado termo 2
  
  let a = divisor * r1; // Para dar divisão exata
  let b = divisor * r2;

  let eqStr = `(${a}x² + ${b}x) ÷ ${divisor}x`;
  
  let p1_c = `${r1}x + (${b}x ÷ ${divisor}x)`;
  let p1_e1 = `${r1}x² + (${b}x ÷ ${divisor}x)`; // Esqueceu de dividir o x² por x
  let p1_e2 = `${a}x + (${b}x ÷ ${divisor}x)`;   // Esqueceu de dividir o coeficiente

  let p2_c = limparEquacao(`${r1}x + ${r2}`);
  let p2_e1 = limparEquacao(`${r1}x + ${r2}x`); // Erro comum: colocar 'x' onde ele foi cortado
  let p2_e2 = limparEquacao(`${r1}x + ${r2+1}`);

  return {
    eqTxt: eqStr, cor: "#8E24AA", // Roxo para divisão
    passos: [
      { perg: `1. Divida o primeiro termo (${a}x² ÷ ${divisor}x):`, c: p1_c, e1: p1_e1, e2: p1_e2, dica: "Divida o número da frente e lembre que x² dividido por x vira x." },
      { perg: `2. Divida o segundo termo (${b}x ÷ ${divisor}x):`, c: p2_c, e1: p2_e1, e2: p2_e2, dica: "Divida o número. x dividido por x corta o x!" }
    ]
  };
}

// NOVA FUNÇÃO FINAL: BINÔMIO X BINÔMIO (MODO DESAFIO)
function criarFaseBinomio() {
  // (ax + b) * (cx + d)
  let a = floor(random(1, 4));
  let b = floor(random(2, 6));
  let c = floor(random(1, 4));
  let d = floor(random(2, 6));

  let a_fmt = formatarCoeficiente(a);
  let c_fmt = formatarCoeficiente(c);

  let eqStr = `(${a_fmt}x + ${b}) · (${c_fmt}x + ${d})`;

  // Resultado: (ac)x² + (ad + bc)x + (bd)
  let r_x2 = a * c;
  let r_x = (a * d) + (b * c);
  let r_num = b * d;

  let p_final_c = limparEquacao(`${formatarCoeficiente(r_x2)}x² + ${r_x}x + ${r_num}`);
  let p_final_e1 = limparEquacao(`${formatarCoeficiente(r_x2)}x² + ${r_x - 2}x + ${r_num}`); // Erro de soma no meio
  let p_final_e2 = limparEquacao(`${formatarCoeficiente(r_x2)}x² + ${r_x}x + ${b+d}`); // Somou em vez de multiplicar no fim

  return {
    eqTxt: eqStr, cor: "#FF6D00", // Laranja Desafio
    passos: [
      { perg: "🔥 DESAFIO FINAL: Multiplicação de 2 Binômios!", c: p_final_c, e1: p_final_e1, e2: p_final_e2, dica: "Chuveirinho Duplo! Multiplique cada termo do 1º por cada termo do 2º e junte os iguais." }
    ]
  };
}

// GERAÇÃO COM VERIFICAÇÃO DE REPETIÇÃO
function gerarFasesAleatorias() {
  let novasFases = [];
  let equacoesUsadas = new Set(); // Guarda as equações para não repetir

  for (let i = 0; i < 15; i++) {
    let faseValida = false;
    let novaFase;

    while (!faseValida) {
      if (i < 3) {
        novaFase = criarFaseFatoracao(i); // Nível fácil
      } else if (i >= 3 && i < 6) {
        novaFase = random() > 0.5 ? criarFaseFatoracao(i) : criarFaseDivisao(i);
      } else if (i >= 6 && i < 12) {
        let sorteio = random();
        if (sorteio < 0.4) novaFase = criarFaseSomaSub(i);
        else if (sorteio < 0.7) novaFase = criarFaseDivisao(i);
        else novaFase = criarFaseFatoracao(i);
      } else {
        // Últimos 3 níveis: O Grande Desafio (Binômio x Binômio)
        novaFase = criarFaseBinomio();
      }

      // Verifica se a equação já foi usada
      if (!equacoesUsadas.has(novaFase.eqTxt)) {
        equacoesUsadas.add(novaFase.eqTxt);
        faseValida = true;
      }
    }
    novasFases.push(novaFase);
  }
  return novasFases;
}

// --- CICLO DO JOGO ---
function draw() {
  if (estado === "INICIO") {
    telaInicial();
  } else if (estado === "JOGANDO") {
    desenharFundoAnimado();
    botoes = []; 
    tempoJogo = floor((millis() - tempoInicio) / 1000);
    desenharHUD();
    desenharFolhaCaderno(); 
    desenharEquacoes();
    desenharPainelAcao();
  } else if (estado === "GAME_OVER") {
    telaGameOver();
  } else if (estado === "VITORIA") {
    telaVitoria();
  }
}

function desenharFundoAnimado() {
  background("#0A0A1A"); 
  for(let d of decoracoes) {
    push();
    translate(d.x, d.y);
    rotate(d.rot);
    fill(d.cor);
    noStroke();
    textSize(d.tam);
    textStyle(BOLD);
    text(d.simbolo, 0, 0);
    pop();
    
    d.y += d.velY;
    d.rot += d.velRot;
    if(d.y < -50) d.y = height + 50; 
  }
}

// --- DESENHO DO LEÃOZINHO NEON ---
function desenharLeaoNeon(x, y, tamanho) {
  let corCabeca = "#FFEA00"; 
  let corJuba = "#FF007F"; 
  let corLagrima = "#00E5FF";
  
  push();
  translate(x, y);
  scale(tamanho); 
  strokeWeight(3);
  
  stroke(corJuba);
  fill(20, 10, 45, 150);
  beginShape();
  for (let angle = 0; angle < TWO_PI; angle += TWO_PI / 12) {
      let a1 = angle;
      let a2 = angle + TWO_PI / 12;
      let mid = (a1 + a2) / 2;
      vertex(cos(a1) * 60, sin(a1) * 60);
      bezierVertex(cos(a1) * 85, sin(a1) * 85, 
                   cos(mid) * 110, sin(mid) * 110, 
                   cos(a2) * 60, sin(a2) * 60);
  }
  endShape(CLOSE);
  
  stroke(corCabeca);
  fill(0);
  arc(-40, -40, 30, 30, PI, TWO_PI);
  arc(40, -40, 30, 30, PI, TWO_PI);

  fill(0, 0, 0, 100); 
  ellipse(0, 0, 100, 100);
  
  stroke(corCabeca);
  noFill();
  strokeWeight(4);
  arc(-20, -10, 20, 10, PI, TWO_PI);
  arc(20, -10, 20, 10, PI, TWO_PI);
  
  fill(255);
  noStroke();
  triangle(-8, 12, 8, 12, 0, 22); 
  
  noFill();
  stroke(255);
  strokeWeight(2);
  arc(-10, 22, 20, 15, 0, PI - 0.5);
  arc(10, 22, 20, 15, 0.5, PI);
  
  line(-25, 15, -45, 10);
  line(-25, 22, -48, 22);
  line(25, 15, 45, 10);
  line(25, 22, 48, 22);

  let posLagrima = (frameCount % 60) / 2;
  noStroke();
  fill(corLagrima);
  push();
  translate(20, -5 + posLagrima);
  beginShape();
  vertex(0, -6);
  bezierVertex(4, -1, 4, 4, 0, 4);
  bezierVertex(-4, 4, -4, -1, 0, -6);
  endShape(CLOSE);
  pop();

  pop();
}

function desenharTabelaNeon(listaRanking) {
  fill("#00E5FF"); 
  textSize(28);
  textStyle(BOLD);
  text("🏅 QUADRO DE HONRA 🏅", width/2, height/2 + 100);
  
  textSize(18);
  textStyle(NORMAL);
  textAlign(LEFT);
  fill("#00E5FF");
  text("Pos", width/2 - 180, height/2 + 140);
  text("Aluno", width/2 - 120, height/2 + 140);
  text("Tempo", width/2 + 120, height/2 + 140);
  
  for (let i = 0; i < listaRanking.length; i++) {
    let r = listaRanking[i];
    let yPos = height/2 + 170 + i * 30;
    
    if (r.nome === nomeAluno && (estado === "VITORIA" || estado === "GAME_OVER")) {
      fill("#00E676"); 
      textStyle(BOLD);
    } else {
      fill(255); 
      textStyle(NORMAL);
    }
    
    text((i + 1) + "º", width/2 - 180, yPos);
    text(r.nome, width/2 - 120, yPos);
    text(r.formatado, width/2 + 120, yPos);
  }
  textAlign(CENTER);
}

function telaInicial() {
  desenharFundoAnimado();
  
  fill(15, 15, 35, 220); 
  stroke("#FF007F"); 
  strokeWeight(3);
  rectMode(CENTER);
  rect(width/2, height/2 - 30, 660, 260, 25);
  noStroke();

  fill("#FF007F"); 
  textSize(34);
  textStyle(BOLD); 
  text("MESTRE DOS POLINÔMIOS", width / 2, height / 2 - 100);
  
  fill("#FFEA00"); 
  textSize(22);
  text("O CORAÇÃO DA ÁLGEBRA!", width / 2, height / 2 - 50);

  fill(220);
  textSize(16);
  textStyle(NORMAL);
  text("DIGITE SEU NOME PARA RESOLVER OS POLINÔMIOS:", width / 2, height / 2 - 10);
}

function iniciarJogo() {
  if (inputNome.value() !== "") {
    nomeAluno = inputNome.value();
    inputNome.hide();
    btnComecar.hide();
    vidas = 3;
    passo = 0;
    fases = gerarFasesAleatorias(); 
    faseAtual = 0;
    tempoInicio = millis();
    tempoJogo = 0;
    dicaAtual = ""; 
    estado = "JOGANDO";
  }
}

function desenharHUD() {
  fill(15, 15, 35, 230);
  stroke("#00E5FF");
  strokeWeight(2);
  rectMode(CORNER);
  rect(-5, -5, width+10, 60);
  rectMode(CENTER);
  noStroke();
  
  fill("#FFFFFF");
  textSize(20);
  textStyle(BOLD);
  textAlign(LEFT);
  text("🦁 " + nomeAluno, 20, 28); 
  
  textAlign(CENTER);
  fill("#00E5FF");
  text("NÍVEL: " + (faseAtual + 1) + " / 15", width / 2 - 40, 28);
  
  fill("#00E676"); 
  let m = floor(tempoJogo / 60);
  let s = tempoJogo % 60;
  text("⏳ " + nf(m, 2) + ":" + nf(s, 2), width / 2 + 100, 28);
  
  textAlign(RIGHT);
  fill("#FF007F");
  text("Vidas: " + "❤️".repeat(vidas), width - 20, 28);
  textAlign(CENTER);
}

function desenharFolhaCaderno() {
  rectMode(CENTER);
  fill(255, 255, 255, 245);
  stroke("#00E5FF"); 
  strokeWeight(4);
  rect(width/2, 230, 680, 320, 20); 
  
  stroke(200, 220, 255, 150);
  strokeWeight(2);
  for(let y = 135; y < 380; y += 40) {
    line(width/2 - 320, y, width/2 + 320, y);
  }
}

function desenharEquacoes() {
  let f = fases[faseAtual];
  
  fill(20); 
  noStroke();
  textSize(38);
  textStyle(BOLD);
  text(f.eqTxt, width/2, 110);

  // Renderiza os passos intermediários, se houver
  if (f.passos.length > 1) {
    if (passo >= 1) {
      fill(f.cor);
      textSize(26);
      textStyle(BOLD);
      text(f.passos[0].c, width/2, 190);
    }
    if (passo >= 2) {
      fill(f.cor);
      textSize(26);
      textStyle(BOLD);
      text(f.passos[1].c, width/2, 260);
    }
  }

  // Renderiza a solução final
  if (passo === f.passos.length) {
    fill("#2E7D32"); 
    textSize(30);
    textStyle(BOLD);
    let yFinal = f.passos.length === 1 ? 230 : 340; 
    text("🎉 MUITO BEM! Solução Final: " + f.passos[f.passos.length - 1].c, width/2, yFinal);
  }
}

function desenharPainelAcao() {
  fill(15, 15, 35, 240);
  stroke("#00E5FF");
  strokeWeight(4);
  rectMode(CORNER);
  rect(-10, 400, width + 20, 260, 30);
  rectMode(CENTER); 
  
  let f = fases[faseAtual];
  fill(255);
  noStroke();
  textSize(20);
  
  if (timerErro > 0) {
    fill("#FF007F"); 
    textStyle(BOLD);
    text("❌ Ops! " + f.passos[passo].dica, width/2, 430);
    textStyle(NORMAL);
    timerErro--;
  }
  
  if (passo < f.passos.length) {
    let pAtual = f.passos[passo];
    if (timerErro === 0) {
      if (f.passos.length === 1) fill("#FF9100");
      text(pAtual.perg, width/2, 450);
      fill(255);
    }
    
    let ordem = (faseAtual + passo) % 3;
    let corBtn = f.cor;
    
    if (ordem === 0) {
      criarBotao(pAtual.c, width/2 - 255, 540, true, corBtn);
      criarBotao(pAtual.e1, width/2, 540, false, corBtn);
      criarBotao(pAtual.e2, width/2 + 255, 540, false, corBtn);
    } else if (ordem === 1) {
      criarBotao(pAtual.e2, width/2 - 255, 540, false, corBtn);
      criarBotao(pAtual.c, width/2, 540, true, corBtn);
      criarBotao(pAtual.e1, width/2 + 255, 540, false, corBtn);
    } else {
      criarBotao(pAtual.e1, width/2 - 255, 540, false, corBtn);
      criarBotao(pAtual.e2, width/2, 540, false, corBtn);
      criarBotao(pAtual.c, width/2 + 255, 540, true, corBtn);
    }
  } else {
    text("🎉 PERFEITO! Você dominou esse polinômio.", width/2, 450);
    criarBotao("AVANÇAR DE NÍVEL ➡️", width/2, 540, "proxima", "#00C853");
  }
}

function criarBotao(txt, x, y, acaoCorrectaOuProxima, corPadrão) {
  let w = 240;
  let h = 70;
  
  fill(acaoCorrectaOuProxima === "proxima" ? "#00C853" : corPadrão);
  noStroke();
  rectMode(CENTER);
  
  push();
  fill(red(color(corPadrão)), green(color(corPadrão)), blue(color(corPadrão)), 100);
  rect(x, y + 5, w + 10, h + 10, 15);
  pop();
  
  rect(x, y, w, h, 15); 
  
  fill(255);
  textSize(16);
  textStyle(BOLD);
  let len = txt.length;
  if(len > 25) textSize(12);
  text(txt, x, y);
  textStyle(NORMAL);
  
  botoes.push({ x: x, y: y, w: w, h: h, acao: acaoCorrectaOuProxima });
}

function mousePressed() {
  if (estado === "JOGANDO") {
    for (let b of botoes) {
      if (mouseX > b.x - b.w/2 && mouseX < b.x + b.w/2 && mouseY > b.y - b.h/2 && mouseY < b.y + b.h/2) {
          if (b.acao === "proxima") {
            faseAtual++;
            if (faseAtual >= fases.length) {
              let m = floor(tempoJogo / 60);
              let s = tempoJogo % 60;
              tempoFinalFormatado = nf(m, 2) + ":" + nf(s, 2);
              salvarRanking(nomeAluno, tempoJogo, tempoFinalFormatado); 
              criarConfetes();
              estado = "VITORIA";
            } else {
              passo = 0;
            }
          } else if (b.acao === true) {
            passo++;
            timerErro = 0;
          } else if (b.acao === false) {
            vidas--;
            timerErro = 180; 
            if (vidas <= 0) {
              estado = "GAME_OVER";
            }
          }
          break; 
      }
    }
  } else if (estado === "GAME_OVER" || estado === "VITORIA") {
    location.reload(); 
  }
}

// --- TELA DE GAME OVER ---
function telaGameOver() {
  desenharFundoAnimado();
  
  if (dicaAtual === "") {
    dicaAtual = random(dicasMatematica);
  }

  let pulse = sin(frameCount * 0.05) * 10;

  stroke(255, 0, 127, 180 + pulse * 5); 
  strokeWeight(4);
  fill(20, 10, 45, 240); 
  rectMode(CENTER);
  rect(width/2, height/2, width - 40, height - 40, 30);
  noStroke();

  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = color(255, 0, 127);
  fill("#FF007F"); 
  textSize(60 + pulse * 0.2); 
  textStyle(BOLD); 
  text("GAME OVER", width / 2, height / 2 - 230);
  drawingContext.shadowBlur = 0; 

  desenharLeaoNeon(width/2, height/2 - 120, 1.2);

  fill("#FFEA00"); 
  textSize(24);
  textStyle(BOLD);
  text("As vidas acabaram, mas a aventura continua!", width / 2, height / 2 - 20);

  fill("#00E5FF"); 
  textSize(18);
  textStyle(NORMAL);
  text("💡 DICA DO LEÃO: " + dicaAtual, width / 2, height / 2 + 15);

  fill("#00E676"); 
  textSize(18);
  textStyle(ITALIC);
  text("Respire fundo e tente mais uma vez!", width / 2, height / 2 + 45);

  push();
  translate(0, 15);
  desenharTabelaNeon(ranking);
  pop();

  let alphaTexto = map(sin(frameCount * 0.1), -1, 1, 100, 255);
  fill(179, 136, 255, alphaTexto); 
  textSize(20);
  textStyle(BOLD);
  text("👉 TOQUE NA TELA PARA JOGAR DE NOVO 👈", width / 2, height - 50);
}

function telaVitoria() {
  desenharFundoAnimado();
  
  for(let c of confetes) {
    c.update();
    c.draw();
  }
  
  stroke("#00E676"); 
  strokeWeight(3);
  fill(15, 15, 35, 230); 
  rectMode(CENTER);
  rect(width/2, height/2, width - 60, height - 60, 20);
  noStroke();

  fill("#FFEA00"); 
  textSize(32);
  textStyle(BOLD); 
  text("🏆 MESTRE DOS POLINÔMIOS! 🏆", width / 2, height / 2 - 200);
  
  textSize(60);
  text("🦁", width/2, height/2 - 120);

  fill(255); 
  textSize(22);
  textStyle(BOLD);
  text("🦁 Missão Cumprida, " + nomeAluno + "!", width / 2, height / 2 - 50);

  fill("#00E676"); 
  textSize(28);
  textStyle(BOLD);
  text("⏳ Tempo Final: " + tempoFinalFormatado, width / 2, height / 2);

  fill(255);
  textSize(16);
  textStyle(NORMAL);
  text("Sua pontuação foi salva no Quadro de Honra.", width / 2, height / 2 + 30);

  desenharTabelaNeon(ranking);

  fill("#B388FF"); 
  textSize(16);
  textStyle(NORMAL);
  text("Toque na tela para jogar novamente.", width / 2, height - 50);
}

function criarConfetes() {
  confetes = [];
  for(let i=0; i<150; i++) {
    confetes.push(new Confete(random(width), random(-height, 0)));
  }
}

class Confete {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(2, 6);
    this.size = random(6, 14);
    this.color = color(random(100, 255), random(100, 255), random(100, 255));
    this.rot = random(TWO_PI);
    this.velRot = random(-0.2, 0.2);
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.velRot;
    
    if(this.y > height + 20) {
      this.y = random(-50, -10);
      this.x = random(width);
    }
  }
  
  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rot);
    fill(this.color);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, this.size, this.size / 2);
    pop();
  }
}
