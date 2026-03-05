const humano = "X";
const pc = "O";

let jogador = humano;
let dificuldade = "facil";
let jogoAtivo = true;
let tabuleiro = ["", "", "", "", "", "", "", "", ""];

let pontosX = 0;
let pontosO = 0;
let totalEmpates = 0;

const celulas = document.querySelectorAll(".celula");
const botoesDif = document.querySelectorAll(".btn-dif");

celulas.forEach(c => c.addEventListener("click", clicar));

botoesDif.forEach(botao => {
    botao.addEventListener("click", () => {
        dificuldade = botao.dataset.dif;
        botoesDif.forEach(b => b.classList.remove("ativo"));
        botao.classList.add("ativo");
    });
});

function clicar(e) {

    const index = e.target.dataset.index;

    if (!jogoAtivo || jogador !== humano || tabuleiro[index] !== "") return;

    tabuleiro[index] = humano;
    e.target.textContent = humano;

    if (verificarFimDeJogo(tabuleiro, humano)) return;

    jogador = pc;

    setTimeout(() => jogadaPC(), 400);
}

function jogadaPC() {

    if (!jogoAtivo) return;

    let escolha;

    switch (dificuldade) {
        case "facil":
            escolha = jogadaAleatoria(tabuleiro);
            break;
        case "medio":
            escolha = jogadaMedia();
            break;
        case "dificil":
            escolha = jogadaDificil();
            break;
        case "minimax":
            escolha = jogadaMinimax();
            break;
    }

    executarJogada(escolha);
}

function executarJogada(posicao) {

    tabuleiro[posicao] = pc;
    celulas[posicao].textContent = pc;

    if (verificarFimDeJogo(tabuleiro, pc)) return;

    jogador = humano;
}

function verificarFimDeJogo(tab, jogadorAtual) {

    const combinacao = verificarVitoria(tab, jogadorAtual);

    if (combinacao) {

        if (jogadorAtual === humano) {
            pontosX++;
            document.getElementById("pontosX").textContent = pontosX;
        } else {
            pontosO++;
            document.getElementById("pontosO").textContent = pontosO;
        }

        combinacao.forEach(i => celulas[i].classList.add("vencedora"));

        document.getElementById("mensagemVitoria")
            .textContent = jogadorAtual === humano ? "Você venceu!" : "PC venceu!";

        document.getElementById("overlay")
            .classList.add("ativo");

        jogoAtivo = false;
        return true;
    }

    if (!tab.includes("")) {

        totalEmpates++;
        document.getElementById("empates").textContent = totalEmpates;

        document.getElementById("mensagemVitoria").textContent = "Empate!";
        document.getElementById("overlay").classList.add("ativo");

        jogoAtivo = false;
        return true;
    }

    return false;
}

function verificarVitoria(tab, jogadorAtual) {

    const combinacoes = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (let comb of combinacoes) {
        const [a,b,c] = comb;

        if (
            tab[a] === jogadorAtual &&
            tab[b] === jogadorAtual &&
            tab[c] === jogadorAtual
        ) {
            return comb;
        }
    }

    return null;
}

/* ======================= */
/* NÍVEIS DE DIFICULDADE */
/* ======================= */

function jogadaAleatoria(tab) {

    const vazias = tab
        .map((v, i) => v === "" ? i : null)
        .filter(v => v !== null);

    return vazias[Math.floor(Math.random() * vazias.length)];
}

function jogadaMedia() {

    let jogada = encontrarJogadaVencedora(pc);
    if (jogada !== null) return jogada;

    jogada = encontrarJogadaVencedora(humano);
    if (jogada !== null) return jogada;

    return jogadaAleatoria(tabuleiro);
}

function jogadaDificil() {

    let jogada = encontrarJogadaVencedora(pc);
    if (jogada !== null) return jogada;

    jogada = encontrarJogadaVencedora(humano);
    if (jogada !== null) return jogada;

    if (tabuleiro[4] === "") return 4;

    const cantos = [0,2,6,8].filter(i => tabuleiro[i] === "");
    if (cantos.length > 0)
        return cantos[Math.floor(Math.random() * cantos.length)];

    return jogadaAleatoria(tabuleiro);
}

function encontrarJogadaVencedora(jogadorTeste) {

    for (let i = 0; i < tabuleiro.length; i++) {

        if (tabuleiro[i] === "") {

            tabuleiro[i] = jogadorTeste;

            if (verificarVitoria(tabuleiro, jogadorTeste)) {
                tabuleiro[i] = "";
                return i;
            }

            tabuleiro[i] = "";
        }
    }

    return null;
}

/* ======================= */
/* MINIMAX CORRETO */
/* ======================= */

function jogadaMinimax() {
    return minimax([...tabuleiro], pc).index;
}

function minimax(novoTab, jogadorAtual) {

    const vazias = novoTab
        .map((v, i) => v === "" ? i : null)
        .filter(v => v !== null);

    if (verificarVitoria(novoTab, humano)) return { score: -10 };
    if (verificarVitoria(novoTab, pc)) return { score: 10 };
    if (vazias.length === 0) return { score: 0 };

    let movimentos = [];

    for (let i of vazias) {

        let movimento = {};
        movimento.index = i;

        novoTab[i] = jogadorAtual;

        let resultado;

        if (jogadorAtual === pc) {
            resultado = minimax([...novoTab], humano);
        } else {
            resultado = minimax([...novoTab], pc);
        }

        movimento.score = resultado.score;
        novoTab[i] = "";

        movimentos.push(movimento);
    }

    let melhorMovimento;

    if (jogadorAtual === pc) {
        let melhorScore = -Infinity;

        for (let i = 0; i < movimentos.length; i++) {
            if (movimentos[i].score > melhorScore) {
                melhorScore = movimentos[i].score;
                melhorMovimento = i;
            }
        }

    } else {

        let melhorScore = Infinity;

        for (let i = 0; i < movimentos.length; i++) {
            if (movimentos[i].score < melhorScore) {
                melhorScore = movimentos[i].score;
                melhorMovimento = i;
            }
        }
    }

    return movimentos[melhorMovimento];
}

/* ======================= */
/* REINICIAR */
/* ======================= */

function reiniciar() {

    tabuleiro = ["", "", "", "", "", "", "", "", ""];
    jogador = humano;
    jogoAtivo = true;

    celulas.forEach(c => {
        c.textContent = "";
        c.classList.remove("vencedora");
    });

    document.getElementById("overlay")
        .classList.remove("ativo");
}
