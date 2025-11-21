function generateChart(
  canvasId,
  chartType,
  ratio_arg = true,
  label_input = "titulo por default",
  data_input = [1, 2, 3, 4, 5, 6],
  labels_input = ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  backgroundColor_input = colores_morenos([1, 2, 3, 4, 5, 6], 0.8),
  borderColor_input = colores_morenos([1, 2, 3, 4, 5, 6], 1),
  xAxes_input = true,
  dataset_input = [],
  etiquetas_superior = false,
  stacked_input = false
) {
  const ctx = document.getElementById(canvasId);
  if (dataset_input.length == 0) {
    dataset_input = [
      {
        label: "Histórico",
        data: data_input,
        backgroundColor: backgroundColor_input,
        borderColor: borderColor_input,
        borderWidth: 1,
        tension: 0.1,
      },
    ];
  }
  if (canvasId === "myChart3_2") {
    console.log(dataset_input);
  }
  new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels_input,
      datasets: dataset_input,
    },
    options: {
      responsive: true,
      maintainAspectRatio: ratio_arg,
      title: {
        display: true,
        text: label_input,
      },
      tooltips: {
        mode: "index",
        intersect: false,
      },
      scales: {
        xAxes: [
          {
            stacked: stacked_input, // Activa el apilamiento en el eje x
            beginAtZero: true,
            ticks: {
              display: xAxes_input,
            },
          },
        ],
        yAxes: [
          {
            stacked: stacked_input, // Activa el apilamiento en el eje y
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
      legend: etiquetas_superior
        ? {
            display: true,
            position: "top",
            labels: {
              generateLabels: function (chart) {
                let labels = [];
                chart.data.labels.forEach((label, index) => {
                  labels.push({
                    text: label,
                    fillStyle: chart.data.datasets[0].backgroundColor[index],
                    strokeStyle: chart.data.datasets[0].borderColor[index],
                    lineWidth: 1,
                  });
                });
                return labels;
              },
            },
          }
        : {},
    },
  });
}
function colores_morenos(value, opacity = 1) {
  // Define six base colors for values 1 to 6
  const colors = [
    [98, 17, 50],
    [157, 36, 73],
    [112, 114, 114],
    [212, 193, 156],
    [179, 142, 93],
    [29, 29, 27],
    [35, 91, 78],
  ];

  // Helper function to compute the rgba color for a single value
  function computeColor(val) {
    const lowerIndex = Math.floor(val) - 1;
    const upperIndex = Math.ceil(val) - 1;

    if (lowerIndex === upperIndex) {
      const color = colors[lowerIndex];
      return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
    }

    const proportion = val - lowerIndex - 1;
    const color1 = colors[lowerIndex];
    const color2 = colors[upperIndex];
    const blendedColor = color1.map((c, i) =>
      Math.round(c * (1 - proportion) + color2[i] * proportion)
    );

    return `rgba(${blendedColor[0]}, ${blendedColor[1]}, ${blendedColor[2]}, ${opacity})`;
  }

  // Check if 'value' is an array
  if (Array.isArray(value)) {
    return value.map((val) => computeColor(val));
  } else {
    return computeColor(value);
  }
}
function format(x) {
  if (isNaN(x)) return "";

  n = x.toString().split(".");
  return (
    n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (n.length > 1 ? "." + n[1] : "")
  );
}

document.addEventListener("DOMContentLoaded", function () {
  //Inicia el procesamiento una vez que está cargada la página.
  //let municipios=[]
  let datosPIB = [];
  let municipios = [];
  fetch("inputs/datos/pib_turismo.csv")
    .then((response) => response.text())
    .then((data) => {
      // Dividir las líneas del archivo CSV
      var lines = data.split("\n");
      lines.slice(1).forEach((line, index) => {
        let values = line.split(",");
        let tema = values[0].trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
        // Asignar la línea a su correspondiente objeto según el "Tema"
        municipios.push(values[2].replace(/^"|"$/g, "").replace(/^'|'$/g, ""));
        datosPIB.push(
          values.slice(3).map((value) => {
            // Normalizar el valor eliminando posibles caracteres extraños (como '\r')
            const cleanValue = value.trim();

            // Manejar casos 'NA' y convertir a número en los demás
            return cleanValue === "NA" ? "NA" : Number(cleanValue);
          })
        );
      });

      const ctx = document.getElementById("myChart4_1");

      // Datos simulados
      const anios = ["2018", "2019", "2020", "2021", "2022"];

      // Generar datasets
      const createDataset = (municipio, index) => ({
        label: municipio,
        data: datosPIB[index],
        borderColor: `hsl(${index * 50}, 70%, 50%)`,
        backgroundColor: `hsl(${index * 50}, 70%, 70%)`,
        fill: false,
        tension: 0.3,
      });

      // Inicializa un gráfico vacío
      let chart = new Chart(ctx, {
        type: "line",
        label: "AAA",
        data: {
          labels: anios,
          datasets: [],
        },
        options: {
          title: {
            display: true,
            text: "PIB Turístico histórico",
          },
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Año",
              },
            },
            y: {
              title: {
                display: true,
                text: "PIB",
              },
              beginAtZero: true,
            },
          },
        },
      });

      // Generar los checkboxes dinámicamente
      const checkboxContainer = document.getElementById("checkbox-container");

      const selectedMunicipios = new Set(); // Conjunto para guardar los índices seleccionados

      const renderCheckboxes = (filter = "") => {
        checkboxContainer.innerHTML = ""; // Limpiar el contenedor

        municipios.forEach((municipio, index) => {
          if (!municipio.toLowerCase().includes(filter.toLowerCase())) return;

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = `municipio-${index}`;
          checkbox.value = index;

          // Restaurar el estado desde selectedMunicipios
          checkbox.checked = selectedMunicipios.has(index);

          const label = document.createElement("label");
          label.htmlFor = checkbox.id;
          label.textContent = municipio;

          const div = document.createElement("div");
          div.appendChild(checkbox);
          div.appendChild(label);

          checkboxContainer.appendChild(div);

          // Evento para actualizar el gráfico y el conjunto de seleccionados
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              // Agregar el índice al conjunto y el dataset al gráfico
              selectedMunicipios.add(index);
              chart.data.datasets.push(createDataset(municipio, index));
            } else {
              // Quitar el índice del conjunto y el dataset del gráfico
              selectedMunicipios.delete(index);
              chart.data.datasets = chart.data.datasets.filter(
                (ds) => ds.label !== municipio
              );
            }
            chart.update(); // Actualizar el gráfico
          });
        });
      };

      // Inicializar checkboxes
      renderCheckboxes();

      // Función de búsqueda
      const searchBar = document.getElementById("search-bar");
      searchBar.addEventListener("input", (e) => {
        const searchTerm = e.target.value;
        renderCheckboxes(searchTerm); // Filtrar y volver a renderizar los checkboxes
      });
    });
    let years_interes=[2018,2019,2020,2021,2022,2023]
    let indicadores=[[],[],[],[],[],[],[],[],[],[],[]]
    fetch("inputs/datos/IND_TURISMO_ESTATAL.csv")
    .then((response) => response.text())
    .then((data) => {
      // Dividir las líneas del archivo CSV
      var lines = data.split("\n");
      lines.slice(1).forEach((line, index) => {
        //index va del 0 5
        let values = line.split(",");
        // Asignar la línea a su correspondiente objeto según el "Tema"
        values.slice(1).forEach((item,index)=>{
          indicadores[index].push(item.trim().replace(/\s/g, ''))
        })
      });
      //alert(indicadores[5])
      generateChart(
        canvasId='myChart5_1',              // canvasId
        'line',                 // chartType
        false,                  // ratio_arg
        ['Días promedio de estadía por categoría','','Activa las categorías que quieres visualizar'], // label_input
        [],                     // data_input (no se usa en multiseries)
        ['2018', '2019', '2020', '2021', '2022', '2023'], // labels_input (años)
        [],                     // backgroundColor_input
        [],  
        xAxes_input=true,                   // borderColor_input
        [
          {
          label: '5 estrellas',
          data: indicadores[0],
          backgroundColor: colores_morenos(Array(6).fill(5),1),
          borderColor: colores_morenos(Array(6).fill(5),1),
          borderWidth: 1,
          fill: false,
          tension: 0.1
      },
          {
          label: '4 estrellas',
          data: indicadores[1],
          backgroundColor: colores_morenos(Array(6).fill(1),1),
          borderColor: colores_morenos(Array(6).fill(1),1),
          borderWidth: 1,
          fill: false,
          tension: 0.1
      },
          {
          label: '3 estrellas',
          data: indicadores[2],
          backgroundColor: colores_morenos(Array(6).fill(4),1),
          borderColor: colores_morenos(Array(6).fill(4),1),
          borderWidth: 1,
          fill: false,
          tension: 0.1
      },
          {
          label: '2 estrellas',
          data: indicadores[3],
          backgroundColor: colores_morenos(Array(6).fill(6),1),
          borderColor: colores_morenos(Array(6).fill(6),1),
          borderWidth: 1,
          fill: false,
          tension: 0.1
      },
          {
          label: '1 estrella',
          data: indicadores[4],
          backgroundColor: colores_morenos(Array(6).fill(7),1),
          borderColor: colores_morenos(Array(6).fill(7),1),
          borderWidth: 1,
          fill: false,
          tension: 0.1
      },
           
            // Agrega más objetos para otros municipios si es necesario
        ],etiquetas_superior=false
    );
    generateChart(
      canvasId='myChart1_1',              // canvasId
      'line',                 // chartType
      false,                  // ratio_arg
      ['Número de turistas según condición de residencia','','Activa las categorías que quieres visualizar'], // label_input
      [],                     // data_input (no se usa en multiseries)
      ['2018', '2019', '2020', '2021', '2022', '2023'], // labels_input (años)
      [],                     // backgroundColor_input
      [],  
      xAxes_input=true,                   // borderColor_input
      [
        {
        label: 'Residen en México',
        data: indicadores[5],
        backgroundColor: colores_morenos(Array(6).fill(5),1),
        borderColor: colores_morenos(Array(6).fill(5),1),
        borderWidth: 1,
        fill: false,
        tension: 0.1,
        hidden:true,
    },
        {
        label: 'No residen en México',
        data: indicadores[6],
        backgroundColor: colores_morenos(Array(6).fill(1),1),
        borderColor: colores_morenos(Array(6).fill(1),1),
        borderWidth: 1,
        fill: false,
        tension: 0.1
    },
        
         
          // Agrega más objetos para otros municipios si es necesario
      ],etiquetas_superior=false
  );
    generateChart(
      canvasId='myChart2_1',              // canvasId
      'line',                 // chartType
      false,                  // ratio_arg
      ['Número de turistas según condición de residencia','','Activa las categorías que quieres visualizar'], // label_input
      [],                     // data_input (no se usa en multiseries)
      ['2018', '2019', '2020', '2021', '2022', '2023'], // labels_input (años)
      [],                     // backgroundColor_input
      [],  
      xAxes_input=true,                   // borderColor_input
      [
        {
        label: 'Residen en México',
        data: indicadores[7],
        backgroundColor: colores_morenos(Array(6).fill(5),1),
        borderColor: colores_morenos(Array(6).fill(5),1),
        borderWidth: 1,
        fill: false,
        tension: 0.1,
        hidden:true,
    },
        {
        label: 'No residen en México',
        data: indicadores[8],
        backgroundColor: colores_morenos(Array(6).fill(1),1),
        borderColor: colores_morenos(Array(6).fill(1),1),
        borderWidth: 1,
        fill: false,
        tension: 0.1
    },
        
         
          // Agrega más objetos para otros municipios si es necesario
      ],etiquetas_superior=false
  );
    generateChart(
      canvasId='myChart3_1',              // canvasId
      'line',                 // chartType
      false,                  // ratio_arg
      ['Número de turistas según condición de residencia','','Activa las categorías que quieres visualizar'], // label_input
      [],                     // data_input (no se usa en multiseries)
      ['2018', '2019', '2020', '2021', '2022', '2023'], // labels_input (años)
      [],                     // backgroundColor_input
      [],  
      xAxes_input=true,                   // borderColor_input
      [
        {
        label: 'Residen en México',
        data: indicadores[9],
        backgroundColor: colores_morenos(Array(6).fill(5),1),
        borderColor: colores_morenos(Array(6).fill(5),1),
        borderWidth: 1,
        fill: false,
        tension: 0.1,
        hidden:true,
    },
        {
        label: 'No residen en México',
        data: indicadores[10],
        backgroundColor: colores_morenos(Array(6).fill(1),1),
        borderColor: colores_morenos(Array(6).fill(1),1),
        borderWidth: 1,
        fill: false,
        tension: 0.1
    },
        
         
          // Agrega más objetos para otros municipios si es necesario
      ],etiquetas_superior=false
  );

    })


  
});
