//// SCRIPT BOTÃO BACK TO TOP
// Exibe o botão quando o usuário rola para baixo
window.onscroll = function () {
  const backToTopButton = document.getElementById("backToTop");
  if (document.documentElement.scrollTop > 300) {
    // Mostrar após 300px de rolagem
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
};

// Função para rolar suavemente até o topo
document.getElementById("backToTop").onclick = function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
////----

//Compartilhar
document.getElementById("shareButton").addEventListener("click", async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Calculadora de Empréstimo",
        text: "A Calculadora de Empréstimo foi desenvolvida para ajudar você a calcular diferentes aspectos de um empréstimo, como valor das parcelas, prazo, taxa de juros ou valor total financiado.",
        url: "https://calcularemprestimo.com",
      });
      console.log("Compartilhamento bem-sucedido!");
    } catch (error) {
      console.log("Erro ao compartilhar:", error);
    }
  } else {
    alert(
      "A API de compartilhamento não é suportada neste navegador. Tente copiar os resultados e colar."
    );
  }
});
////----

// Formatar máscaras dos valores (para campos de input com valores monetários e percentuais)
$(".value").mask("000.000.000,00", { reverse: true }); // Formata o valor monetário com pontuação e vírgula (ex: 1.000,00)
$(".percent").mask("00,00", { reverse: true }); // Formata o valor percentual com vírgula (ex: 10,00%)

//// CONVERTE PRAZO MENSAL EM ANUAL E VICE VERSA
// Pega os campos onde o usuário digita os prazos
const periodoAnual = document.querySelector("#periodoAnual");
const periodo = document.querySelector("#periodo");
// Enquanto o usuário digita o prazo anual, transforma em prazo mensal e preenche o campo Prazo (meses)
periodoAnual.addEventListener("input", function () {
  if (this.value == "") periodo.value = "";
  else periodo.value = Math.floor(periodoAnual.value * 12);
});
// Enquanto o usuário digita o prazo mensal, transforma em prazo anual e preenche o campo Prazo (anos)
// O campo Prazo (anos) fica desabilitado quando o usuário preenche o Prazo (meses) e habilita quando está em branco
periodo.addEventListener("input", function () {
  if (this.value == "") {
    periodoAnual.value = "";
    periodoAnual.removeAttribute("disabled");
  } else {
    periodoAnual.setAttribute("disabled", true);
    periodoAnual.value = Math.floor(periodo.value / 12);
  }
});
//// -----------

//// CONVERTE JUROS MENSAIS EM ANUAIS E VICE VERSA
// Pega os campos onde o usuário digita as taxas de juros
const txAnual = document.querySelector("#txAnual");
const txPeriodo = document.querySelector("#txPeriodo");
// Enquanto o usuário digita o juros anual, transforma em juros mensal e preenche o campo Taxa Mensal
txAnual.addEventListener("input", function () {
  if (this.value == "") {
    txPeriodo.value = "";
  } else {
    let value = this.value.replace(",", ".");
    let txMensal = Math.pow(1 + value / 100, 1 / 12) - 1;
    txPeriodo.value = (txMensal * 100).toFixed(2).replace(".", ",");
  }
});
// Enquanto o usuário digita o juros mensal, transforma em juros anual e preenche o campo Taxa Anual
txPeriodo.addEventListener("input", function () {
  if (this.value == "") {
    txAnual.value = "";
  } else {
    let value = this.value.replace(",", ".");
    let txPeriodo = Math.pow(1 + value / 100, 12) - 1;
    txAnual.value = (txPeriodo * 100).toFixed(2).replace(".", ",");
  }
});
//// -----------

// Recupera valores previamente salvos no sessionStorage e preenche os campos correspondentes
document.getElementById("periodo").value =
  sessionStorage.getItem("periodo") || "";

document.getElementById("periodoAnual").value =
  sessionStorage.getItem("periodoAnual") ?? "";

document.getElementById("txPeriodo").value =
  sessionStorage.getItem("txPeriodo") || "";

document.getElementById("txAnual").value =
  sessionStorage.getItem("txAnual") || "";

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
  const periodoAnual = document.getElementById("periodoAnual").value;
  const txPeriodo = document.getElementById("txPeriodo").value;
  const txAnual = document.getElementById("txAnual").value;
  const vlrEmprestimo = document.getElementById("vlrEmprestimo").value;
  const vlrParcela = document.getElementById("vlrParcela").value;
  const tipoAmortizacao = document.getElementById("tipoAmortizacao").value;

  // Salva os valores no sessionStorage para manter as informações na página
  sessionStorage.setItem("periodo", periodo);
  sessionStorage.setItem("periodoAnual", periodoAnual);
  sessionStorage.setItem("txPeriodo", txPeriodo);
  sessionStorage.setItem("txAnual", txAnual);
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
    taxaAnual = txAnual ? parseFloat(formatarValor(txAnual)) : 0,
    emprestimo = vlrEmprestimo ? parseFloat(formatarValor(vlrEmprestimo)) : 0,
    parcela = vlrParcela ? parseFloat(formatarValor(vlrParcela)) : 0,
    parcelaInicial = 0,
    parcelaFinal = 0,
    total = 0,
    juros = 0;

  // Cálculo baseado no campo vazio identificado
  switch (campoEmBranco) {
    // Calcular o prazo
    case 0:
      if (tipoAmortizacao === "price") {
        saldoDevedor = emprestimo;
        prazo = 0;
        while (saldoDevedor > 0.01) {
          saldoDevedor = saldoDevedor - parcela + saldoDevedor * (taxa / 100);
          prazo++;

          if (prazo > 999) {
            break;
          }
        }
        parcelaInicial = parcela;
        parcelaFinal = parcela;
        total = parcela * prazo;
        juros = total - emprestimo;

        // Exemplo simplificado de como montar o array de parcelas
        let parcelas = [];
        let calcParcela =
          (emprestimo * (taxa / 100)) / (1 - Math.pow(1 + taxa / 100, -prazo));
        saldoDevedor = emprestimo;
        for (let i = 1; i <= prazo; i++) {
          // Aqui você calcula os valores para cada parcela:
          let parcelaNr = i;
          let juros = saldoDevedor * (taxa / 100);
          let parcelaValor = calcParcela;
          let amortizacaoMensal = parcelaValor - juros;
          saldoDevedor = saldoDevedor + juros - parcelaValor;

          parcelas.push({
            parcelaNr,
            parcelaValor: parcelaValor.toFixed(2),
            juros: juros.toFixed(2),
            amortizacaoMensal: amortizacaoMensal.toFixed(2),
            saldoDevedor: saldoDevedor.toFixed(2),
          });
        }

        console.log(parcelas);
      }

      if (tipoAmortizacao === "sac") {
        saldoDevedor = emprestimo;
        prazo = 0;

        amortizacaoMensal = parseFloat(
          (parcela - saldoDevedor * (taxa / 100)).toFixed(2)
        );
        prazo = parseInt((emprestimo / amortizacaoMensal).toFixed(2));

        let parcelas = [];
        for (i = 1; i <= prazo; i++) {
          parcelaNr = i;
          juros = saldoDevedor * (taxa / 100);
          amortizacaoMensal;
          parcelaValor = parseFloat((juros + amortizacaoMensal).toFixed(2));
          saldoDevedor = parseFloat(
            (saldoDevedor + juros - parcelaValor).toFixed(2)
          );
          total += parcelaValor;

          parcelas.push({
            parcelaNr,
            juros,
            amortizacaoMensal,
            parcelaValor,
            saldoDevedor,
          });
        }

        console.log(parcelas);

        parcelaInicial = parcela;
        parcelaFinal = parcelas[parcelas.length - 1].parcelaValor;
        juros = total - emprestimo;
      }
      break;
    // Calcular a taxa
    case 1:
      if (tipoAmortizacao === "price") {
        function calcularParcela(emprestimo, taxa, prazo) {
          return (emprestimo * taxa) / (1 - Math.pow(1 + taxa, -prazo));
        }

        let taxaBaixa = 0; // Limite inferior para a taxa de juros
        let taxaAlta = 1; // Limite superior (assumindo que 100% é o limite superior)
        let taxa = (taxaBaixa + taxaAlta) / 2; // Estimativa inicial
        let precisao = 1e-9; // Precisão desejada

        while (taxaAlta - taxaBaixa > precisao) {
          let parcelaCalculada = calcularParcela(emprestimo, taxa, prazo);

          if (parcelaCalculada > parcela) {
            taxaAlta = taxa; // Aumenta a precisão, ajustando o limite superior
          } else {
            taxaBaixa = taxa; // Ajusta o limite inferior
          }

          taxa = (taxaBaixa + taxaAlta) / 2; // Recalcula a taxa
        }

        taxaCalculada = taxa * 100;
        parcelaInicial = parcela;
        parcelaFinal = parcela;
        total = parcela * prazo;
      }

      if (tipoAmortizacao === "sac") {
        amortizacao = emprestimo / prazo;
        taxaCalculada = ((parcela - amortizacao) / emprestimo) * 100;

        let parcelas = [];
        saldoDevedor = emprestimo;
        for (i = 1; i <= prazo; i++) {
          parcelaNr = i;
          juros = saldoDevedor * (taxaCalculada / 100);
          amortizacaoMensal = amortizacao;
          parcelaValor = parseFloat((juros + amortizacaoMensal).toFixed(2));
          saldoDevedor = parseFloat(
            (saldoDevedor + juros - parcelaValor).toFixed(2)
          );
          total += parcelaValor;

          parcelas.push({
            parcelaNr,
            juros,
            amortizacaoMensal,
            parcelaValor,
            saldoDevedor,
          });
        }

        parcelaInicial = parcela;
        parcelaFinal = parcelas[parcelas.length - 1].parcelaValor;
      }

      taxaAnual = (Math.pow(1 + taxaCalculada / 100, 12) - 1) * 100;

      taxa = taxaCalculada;
      juros = total - emprestimo;
      break;
    // Calcular o valor do emprestimo
    case 2:
      if (tipoAmortizacao === "price") {
        emprestimo =
          ((parcela * (1 - Math.pow(1 + taxa / 100, -prazo))) / taxa) * 100;
        parcelaInicial = parcela;
        parcelaFinal = parcela;
        total = parcela * prazo;
      }

      if (tipoAmortizacao === "sac") {
        emprestimo = parcela / (1 / prazo + taxa / 100);

        saldoDevedor = emprestimo;
        amortizacaoMensal = saldoDevedor / prazo;
        let parcelas = [];
        for (i = 1; i <= prazo; i++) {
          parcelaNr = i;
          juros = saldoDevedor * (taxa / 100);
          amortizacaoMensal;
          parcelaValor = parseFloat((juros + amortizacaoMensal).toFixed(2));
          saldoDevedor = parseFloat(
            (saldoDevedor + juros - parcelaValor).toFixed(2)
          );
          total += parcelaValor;

          parcelas.push({
            parcelaNr,
            juros,
            amortizacaoMensal,
            parcelaValor,
            saldoDevedor,
          });
        }

        console.log(parcelas);

        parcelaInicial = parcela;
        parcelaFinal = parcelas[parcelas.length - 1].parcelaValor;
      }

      juros = total - emprestimo;
      break;
    // Calcular as parcelas
    case 3:
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

        // Exemplo simplificado de como montar o array de parcelas
        let parcelas = [];
        let saldoDevedor = emprestimo;
        for (let i = 1; i <= prazo; i++) {
          // Aqui você calcula os valores para cada parcela:
          let parcelaNr = i;
          let juros = saldoDevedor * (taxa / 100);
          let parcelaValor = calcParcela;
          let amortizacaoMensal = parcelaValor - juros;
          saldoDevedor = saldoDevedor + juros - parcelaValor;

          parcelas.push({
            parcelaNr,
            parcelaValor: parcelaValor.toFixed(2),
            juros: juros.toFixed(2),
            amortizacaoMensal: amortizacaoMensal.toFixed(2),
            saldoDevedor: saldoDevedor.toFixed(2),
          });
        }

        console.log(parcelas);
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

      console.log(parcelas);

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
  sessionStorage.setItem(
    "taxaAnual",
    taxaAnual ? formatarValor(taxaAnual, false) : "N/A"
  );
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
currentPage = window.location.pathname.split("/").pop(); // Pega a última parte da URL /index.html, /results.html etc.
if (currentPage == "results.html" && !sessionStorage.getItem("emprestimo")) {
  window.location.href = "/"; // Redireciona para o início se não houver dados calculados
}

if (document.getElementById("resultPrazo")) {
  // Exibe os resultados na página de resultados
  document.getElementById(
    "resultEmprestimo"
  ).innerHTML = `<span>Valor do Empréstimo:</span> $ ${sessionStorage.getItem("emprestimo") || "---"
  }`;

  document.getElementById(
    "resultTaxa"
  ).innerHTML = `<span>Taxa Mensal:</span> ${sessionStorage.getItem("taxa") || "---"
  }%`;

  document.getElementById(
    "resultTaxaAnual"
  ).innerHTML = `<span>Taxa Anual:</span> ${sessionStorage.getItem("taxaAnual") || "---"
  }%`;
  document.getElementById("resultPrazo").innerHTML = `<span>Prazo:</span> ${sessionStorage.getItem("prazo") || "---"
    }`;

  document.getElementById(
    "resultParcelaInicial"
  ).innerHTML = `<span>Parcela Inicial:</span> $ ${sessionStorage.getItem("parcelaInicial") || "---"
  }`;

  document.getElementById(
    "resultParcelaFinal"
  ).innerHTML = `<span>Parcela Final:</span> $ ${sessionStorage.getItem("parcelaFinal") || "---"
  }`;

  document.getElementById(
    "resultSistema"
  ).innerHTML = `<span>Sistema de Amortização:</span> ${sessionStorage.getItem("tipoAmortizacao") === "price"
    ? "Tabela PRICE"
    : "Tabela SAC"
  }`;

  document.getElementById(
    "resultTotal"
  ).innerHTML = `<span>Total a Pagar:</span> $ ${sessionStorage.getItem("total") || "---"
  }`;

  document.getElementById(
    "resultJuros"
  ).innerHTML = `<span>Juros Totais:</span> $ ${sessionStorage.getItem("juros") || "---"
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
    const taxaAnual = document.getElementById("resultTaxaAnual").textContent;
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
${taxaAnual}
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
