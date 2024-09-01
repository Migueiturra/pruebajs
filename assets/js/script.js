const monto = document.getElementById("monto");
const monedas = document.getElementById("monedas");
const resultado = document.getElementById("resultado");
const calcular = document.getElementById("calcular");

async function mindicador() {
  try {
    const res = await fetch("https://mindicador.cl/api/");
    if (!res.ok) throw new Error("Error al obtener los indicadores");
    const indicadores = await res.json();

    monedas.innerHTML = `<select name="Seleccione la moneda" id="monedas">
              <option value="dolar"> ${indicadores.dolar.nombre} </option>
              <option value="bitcoin"> ${indicadores.bitcoin.nombre} </option>
              <option value="euro"> ${indicadores.euro.nombre} </option>
              </select>`;

    calcular.onclick = function () {
      try {
        let monedaSeleccionada = monedas.value;
        let valorMoneda = indicadores[monedaSeleccionada].valor;

        resultado.innerHTML =
          "Resultado: $" + (Number(monto.value) / valorMoneda).toFixed(2);

        renderGrafica(monedaSeleccionada);
      } catch (error) {
        resultado.innerHTML = "Error en el cálculo: " + error.message;
      }
    };
  } catch (error) {
    resultado.innerHTML = "Error al obtener indicadores: " + error.message;
  }
}

async function getAndCreateDataToChart(moneda) {
  try {
    const res = await fetch(`https://mindicador.cl/api/${moneda}`);
    if (!res.ok) throw new Error("Error al obtener datos históricos");
    const data = await res.json();

    const series = data.serie.slice(0, 10).reverse();

    const labels = series.map((entry) => {
      const date = new Date(entry.fecha);
      return date.toLocaleDateString("es-CL");
    });

    const valores = series.map((entry) => entry.valor);

    const datasets = [
      {
        label: `${data.nombre} en los últimos 10 días`,
        borderColor: "rgb(255, 99, 132)",
        data: valores,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ];

    return { labels, datasets };
  } catch (error) {
    resultado.innerHTML =
      "Error al preparar los datos del gráfico: " + error.message;
    throw error;
  }
}

async function renderGrafica(moneda) {
  try {
    const data = await getAndCreateDataToChart(moneda);
    const config = {
      type: "line",
      data: data,
    };

    const myChartElement = document.getElementById("myChart");
    if (myChartElement) {
      new Chart(myChartElement, config);
    }
  } catch (error) {
    resultado.innerHTML = "Error al renderizar el gráfico: " + error.message;
  }
}

mindicador();
