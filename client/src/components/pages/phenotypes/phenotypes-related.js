import React from "react";
import { PlotlyWrapper as Plot } from '../../plots/plotly/plotly-wrapper';
import { hoverLayout } from './phenotypes-charts';

export function PhenotypesRelated({
  selectedPhenotype,
  phenotypeType,
  relatedData
}) {
  relatedData = relatedData.sort((a, b) => b.correlation - a.correlation);
  const data = [
    {
      x: relatedData.map((e, i) => i + 1),
      y: relatedData.map(e => e.correlation),
      text: relatedData.map(e =>
        [
          e.name,
          `Correlation: <b>${e.correlation}</b>`,
          `Sample Size: <b>${e.sampleSize ? e.sampleSize.toLocaleString() : e.participant_count.toLocaleString()}</b>`
        ].join("<br>")
      ),
      hoverinfo: "text",
      mode: "markers",
      marker: {
        size: relatedData.map(e => 10 * (e.sampleSize ? Math.log(e.sampleSize) : Math.log(e.participant_count))),
        color: [
          "rgb(93, 164, 214)",
          "rgb(255, 144, 14)",
          "rgb(44, 160, 101)",
          "rgb(255, 65, 54)"
        ]
      }
    }
  ];

  const layout = {
    ...hoverLayout,
    // title: `Phenotypes Related to ${selectedPhenotype.title}`,
    showlegend: false,
    xaxis: {
      showticklabels: false,
      zeroline: true
    },
    yaxis: {
      title: "Correlation",
      showline: true,
    },
    autosize: true
  };

  const config = {
    displayModeBar: false,
    responsive: true
  };

  return (
    <Plot
      style={{ width: "100%", height: "600px" }}
      data={data}
      layout={layout}
      config={config}
      onLegendClick={_ => false}
    />
  );
}
