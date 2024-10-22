window.addEventListener("load", function () {
  // Pega o offsetHeight do tamanho atual do card da calculadora
  // e acrescenta a diferença como margin top do elemento abaixo.
  const flipcardfront = document.querySelector(".flip-card-front").offsetHeight;
  const botoesextras = document.querySelector(".botoes-extras");
  botoesextras.style.marginTop = flipcardfront - 400 + "px";
});

// Formatar máscaras dos valores (para campos de input com valores monetários e percentuais)
$(".value").mask("000.000.000,00", { reverse: true }); // Formata o valor monetário com pontuação e vírgula (ex: 1.000,00)
$(".percent").mask("00,00", { reverse: true }); // Formata o valor percentual com vírgula (ex: 10,00%)

// Recupera valores previamente salvos no sessionStorage e preenche os campos correspondentes
document.getElementById("periodo").value =
  sessionStorage.getItem("periodo") || "";
document.getElementById("txPeriodo").value =
  sessionStorage.getItem("txPeriodo") || "";
document.getElementById("vlrEmprestimo").value =
  sessionStorage.getItem("vlrEmprestimo") || "";
document.getElementById("vlrParcela").value =
  sessionStorage.getItem("vlrParcela") || "";
document.getElementById("tipoAmortizacao").value =
  sessionStorage.getItem("tipoAmortizacao") || "price";

// Limpar o Session Storage ao clicar no botão de reset
document.querySelector("#btn-reset").addEventListener("click", function () {
  sessionStorage.clear(); // Limpa todos os dados do sessionStorage
});

// FUNÇÃO BASE: CALCULAR EMPRÉSTIMO
// Função de cálculo de Empréstimo
function calcularemprestimo() {
  // Captura os valores inseridos pelo usuário
  const periodo = document.getElementById("periodo").value;
  const txPeriodo = document.getElementById("txPeriodo").value;
  const vlrEmprestimo = document.getElementById("vlrEmprestimo").value;
  const vlrParcela = document.getElementById("vlrParcela").value;
  const tipoAmortizacao = document.getElementById("tipoAmortizacao").value;

  // Salva os valores no sessionStorage para manter as informações na página
  sessionStorage.setItem("periodo", periodo);
  sessionStorage.setItem("txPeriodo", txPeriodo);
  sessionStorage.setItem("vlrEmprestimo", vlrEmprestimo);
  sessionStorage.setItem("vlrParcela", vlrParcela);
  sessionStorage.setItem("tipoAmortizacao", tipoAmortizacao);

  // Array que contém os campos preenchidos pelo usuário
  let camposPreenchidos = [
    periodo,
    txPeriodo,
    vlrEmprestimo,
    vlrParcela,
    tipoAmortizacao,
  ];
  let totalCamposNPreenchidos = 0;
  let campoEmBranco = -1; // Variável para identificar o campo em branco

  // Verifica quais campos estão vazios
  camposPreenchidos.forEach((item, index) => {
    if (item === "") {
      totalCamposNPreenchidos++;
      campoEmBranco = index; // Guarda o índice do campo que está vazio
    }
  });

  // Se houver mais de um campo em branco, alerta o usuário
  if (totalCamposNPreenchidos !== 1) {
    alert("Deixe apenas um campo em branco para cálculo.");
    return;
  }

  // Função para formatar valores (de acordo com o sistema utilizado - true para formato internacional 1,000.00)
  function formatarValor(valor, sistema = true) {
    if (sistema) {
      return valor.replace(/\./g, "").replace(",", ".");
    } else {
      return valor
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  }

  // Função para calcular o tempo em anos e meses
  function calcularAnosEMeses(totalMeses) {
    const anos = Math.floor(totalMeses / 12); // Calcula os anos inteiros
    const meses = totalMeses % 12; // Calcula os meses restantes

    const anoTexto = anos === 1 ? "1 ano" : `${anos} anos`; // Plural e singular para "ano"
    const mesTexto = meses === 1 ? "1 mês" : `${meses} meses`; // Plural e singular para "mês"

    // Se for menos de 1 ano, retorna apenas os meses
    if (anos === 0) {
      return mesTexto; // Retorna apenas meses
    }

    // Se os meses forem 0, retorna apenas os anos
    if (meses === 0) {
      return `${totalMeses} meses (ou ${anoTexto})`; // Exemplo: "12 meses (ou 1 ano)"
    }

    // Retorna no formato "X meses (ou X anos e X meses)"
    return `${totalMeses} meses (ou ${anoTexto} e ${mesTexto})`; // Exemplo: "13 meses (ou 1 ano e 1 mês)"
  }

  // Conversão e cálculo dos valores
  let prazo = periodo ? periodo : 0,
    taxa = txPeriodo ? parseFloat(formatarValor(txPeriodo)) : 0,
    emprestimo = vlrEmprestimo ? parseFloat(formatarValor(vlrEmprestimo)) : 0,
    parcela = vlrParcela ? parseFloat(formatarValor(vlrParcela)) : 0,
    amortizacao = tipoAmortizacao,
    parcelaInicial = 0,
    parcelaFinal = 0,
    total = 0,
    juros = 0;

  // Cálculo baseado no campo vazio identificado
  switch (campoEmBranco) {
    case 0:
      // Calcular o prazo
      console.log("Calcular Prazo");
      prazo = 0;
      taxa = 0;
      emprestimo = 0;
      parcelaInicial = 0;
      parcelaFinal = 0;
      total = 0;
      juros = 0;
      break;
    case 1:
      // Calcular a taxa
      console.log("Calcular Taxa");
      prazo = 0;
      taxa = 0;
      emprestimo = 0;
      parcelaInicial = 0;
      parcelaFinal = 0;
      total = 0;
      juros = 0;
      break;
    case 2:
      // Calcular o valor do emprestimo
      console.log("Calcular Empréstimo");
      prazo = 0;
      taxa = 0;
      emprestimo = 0;
      parcelaInicial = 0;
      parcelaFinal = 0;
      total = 0;
      juros = 0;
      break;
    case 3:
      // Calcular as parcelas
      let calcParcela = 0;
      let calcParcelaFinal = 0;
      let calcTotal = 0;
      let calcJuros = 0;

      if (tipoAmortizacao === "price") {
        calcParcela =
          (emprestimo * (taxa / 100)) / (1 - Math.pow(1 + taxa / 100, -prazo));
        calcParcelaFinal = calcParcela;
        calcTotal = prazo * calcParcela;
        calcJuros = prazo * calcParcela - emprestimo;
      }

      let parcelas = [];
      if (tipoAmortizacao === "sac") {
        saldoDevedor = emprestimo;
        amortizacaoMensal = saldoDevedor / prazo;
        for (i = 1; i <= prazo; i++) {
          parcelaNr = i;
          juros = saldoDevedor * (taxa / 100);
          amortizacaoMensal;
          parcelaValor = parseFloat((juros + amortizacaoMensal).toFixed(2));
          saldoDevedor = parseFloat(
            (saldoDevedor + juros - parcelaValor).toFixed(2)
          );
          calcTotal += parcelaValor;
          calcJuros += juros;

          parcelas.push({
            parcelaNr,
            juros,
            amortizacaoMensal,
            parcelaValor,
            saldoDevedor,
          });
        }

        calcParcela = parcelas[0].parcelaValor;
        calcParcelaFinal = parcelas[parcelas.length - 1].parcelaValor;
      }

      prazo = prazo;
      taxa = taxa;
      emprestimo = emprestimo;
      parcelaInicial = calcParcela;
      parcelaFinal = calcParcelaFinal;
      total = calcTotal;
      juros = calcJuros;
      break;
  }

  // Validações para evitar resultados infinitos
  if (
    emprestimo == Infinity ||
    parcelaInicial == Infinity ||
    parcelaFinal == Infinity ||
    total == Infinity ||
    juros == Infinity
  ) {
    alert(
      "Valores informados levam a resultados infinitos ou . Verifique os valores e tente novamente."
    );
    return false;
  }

  // Chama a função calcularAnosEMeses para formatar o prazo em anos e meses
  anosEMeses = calcularAnosEMeses(prazo);

  // Salva os resultados no sessionStorage
  sessionStorage.setItem("prazo", prazo ? anosEMeses : "N/A");
  sessionStorage.setItem(
    "parcelaInicial",
    parcelaInicial ? formatarValor(parcelaInicial, false) : "N/A"
  );
  sessionStorage.setItem(
    "parcelaFinal",
    parcelaFinal ? formatarValor(parcelaFinal, false) : "N/A"
  );
  sessionStorage.setItem(
    "emprestimo",
    emprestimo ? formatarValor(emprestimo, false) : "N/A"
  );
  sessionStorage.setItem("juros", juros ? formatarValor(juros, false) : "N/A");
  sessionStorage.setItem("taxa", taxa ? formatarValor(taxa, false) : "N/A");
  sessionStorage.setItem("total", total ? formatarValor(total, false) : "N/A");

  // Animação para "virar o cartão" e mostrar os resultados
  document.querySelector(".flip-card").classList.add("flip-card-flipped");

  // Redireciona para a página de resultados
  setTimeout(() => {
    window.location.href = "results.html";
  }, 500);
}

// Função para voltar ao formulário inicial
function voltarFormulario(e) {
  e.preventDefault(); // Previne o comportamento padrão do botão
  document.querySelector(".flip-card").classList.remove("flip-card-flipped"); // Reverte a animação do cartão
  setTimeout(() => {
    window.location.href = "index.html"; // Redireciona para a página inicial
  }, 500);
}

// Adiciona eventos aos botões de calcular e voltar
document
  .getElementById("calcularBtn")
  .addEventListener("click", calcularemprestimo);

if (document.getElementById("voltarBtn")) {
  document
    .getElementById("voltarBtn")
    .addEventListener("click", voltarFormulario);
}

// Verifica se a página de resultados está acessada diretamente sem cálculo
// currentPage = window.location.pathname.split("/").pop(); // Pega a última parte da URL /index.html, /results.html etc.
// if (currentPage == "results.html" && !sessionStorage.getItem("rendaPassiva")) {
//   window.location.href = "/"; // Redireciona para o início se não houver dados calculados
// }

if (document.getElementById("resultPrazo")) {
  // Exibe os resultados na página de resultados
  document.getElementById("resultPrazo").textContent = `Prazo: ${
    sessionStorage.getItem("prazo") || "---"
  }`;
  document.getElementById(
    "resultParcelaInicial"
  ).textContent = `Parcela Inicial: $ ${
    sessionStorage.getItem("parcelaInicial") || "---"
  }`;
  document.getElementById(
    "resultParcelaFinal"
  ).textContent = `Parcela Final: $ ${
    sessionStorage.getItem("parcelaFinal") || "---"
  }`;
  document.getElementById(
    "resultEmprestimo"
  ).textContent = `Valor do Empréstimo: $ ${
    sessionStorage.getItem("emprestimo") || "---"
  }`;
  document.getElementById("resultJuros").textContent = `Juros Totais: $ ${
    sessionStorage.getItem("juros") || "---"
  }`;
  document.getElementById("resultTaxa").textContent = `Taxa Mensal: ${
    sessionStorage.getItem("taxa") || "---"
  }%`;
  document.getElementById("resultTotal").textContent = `Total a Pagar: $ ${
    sessionStorage.getItem("total") || "---"
  }`;
  document.getElementById(
    "resultSistema"
  ).textContent = `Sistema de Amortização: ${
    sessionStorage.getItem("tipoAmortizacao") === "price"
      ? "Tabela PRICE"
      : "Tabela SAC"
  }`;
}

if (document.getElementById("copiarBtn")) {
  // Função para copiar os resultados
  document.getElementById("copiarBtn").addEventListener("click", function () {
    const prazo = document.getElementById("resultPrazo").textContent;
    const parcelaInicial = document.getElementById(
      "resultParcelaInicial"
    ).textContent;
    const parcelaFinal =
      document.getElementById("resultParcelaFinal").textContent;
    const emprestimo = document.getElementById("resultEmprestimo").textContent;
    const juros = document.getElementById("resultJuros").textContent;
    const taxa = document.getElementById("resultTaxa").textContent;
    const total = document.getElementById("resultTotal").textContent;
    const tipoAmortizacao =
      document.getElementById("resultSistema").textContent;

    // Formata o resultado para ser copiado
    const resultado = `Calcular Empréstimo
https://www.calcularemprestimo.com

Resultados
${emprestimo}
${prazo}
${taxa}
${tipoAmortizacao}
${parcelaInicial}
${parcelaFinal}
${total}
${juros}
`;

    // Copia o texto para a área de transferência e alerta o usuário
    navigator.clipboard
      .writeText(resultado)
      .then(() => {
        alert("Resultados copiados para a área de transferência!");
      })
      .catch((err) => {
        alert("Erro ao copiar os resultados. Tente novamente.");
        console.error("Erro ao copiar", err);
      });
  });
}
