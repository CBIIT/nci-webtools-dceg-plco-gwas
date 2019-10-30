import { query, rawQuery } from './query';

export const UPDATE_SUMMARY_RESULTS = 'UPDATE_SUMMARY_RESULTS';
export const UPDATE_VARIANT_LOOKUP = 'UPDATE_VARIANT_LOOKUP';
export const UPDATE_PHENOTYPE_CORRELATIONS = 'UPDATE_PHENOTYPE_CORRELATIONS';
export const UPDATE_PHENOTYPES = 'UPDATE_PHENOTYPES';
export const UPDATE_PHENOTYPES_TREE = 'UPDATE_PHENOTYPES_TREE';

export function updatePhenotypes(data) {
  return { type: UPDATE_PHENOTYPES, data };
}

export function updatePhenotypesTree(data) {
  return { type: UPDATE_PHENOTYPES_TREE, data };
}

export function updateSummaryResults(data) {
  return { type: UPDATE_SUMMARY_RESULTS, data };
}

export function updateVariantLookup(data) {
  return { type: UPDATE_VARIANT_LOOKUP, data };
}

export function updatePhenotypeCorrelations(data) {
  return { type: UPDATE_PHENOTYPE_CORRELATIONS, data };
}

export function fetchRanges() {
  return async function(dispatch) {
    const ranges = await query('data/chromosome_ranges.json');
    dispatch(updateSummaryResults({ ranges }));
  };
}

export function updateSummaryResultsTable(params, includeCounts) {
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loading: true }));
    const response = await query('variants', params);
    const metadata = await query('metadata', params);
    if (!response.error) {
      let data = {results: response.data};
      if (response.count) {
        data.resultsCount = response.count;
      }

      if (includeCounts)
        data.resultsCount = +metadata[`count_${params.gender}`];
      dispatch(updateSummaryResults(data));
    }
    dispatch(updateSummaryResults({ loading: false }));
    return response;
  };
}

/**
 *
 * @param {'summary'|'variants'} plotType
 * @param {object} params - database, chr, bpMin, bpMax, nlogpMin, nlogPmax
 */
export function drawManhattanPlot(plotType, params) {
  console.log('drawing plot', plotType, params);
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loadingManhattanPlot: true }));
    if (params.table.length == 2) {
      // if 2 tables are provided, this is a mirrored plot
      const manhattanPlotData = await rawQuery(plotType, {
        ...params,
        table: params.table[0]
      });

      const manhattanPlotMirroredData = await rawQuery(plotType, {
        ...params,
        table: params.table[1]
      });

      dispatch(updateSummaryResults({
        manhattanPlotData,
        manhattanPlotMirroredData,
      }));
    } else {
      const manhattanPlotData = await rawQuery(plotType, params);
      dispatch(updateSummaryResults({
        manhattanPlotData,
        manhattanPlotMirroredData: {}
      }));
    }

    dispatch(updateSummaryResults({ loadingManhattanPlot: false }));
  };
}

export function drawQQPlot(phenotype) {
  return async function(dispatch) {
    dispatch(updateSummaryResults({ loading: true }));
    const imageMapData = await query(
      `data/qq-plots/${phenotype}.imagemap.json`
    );
    if (!imageMapData.error) {
      dispatch(
        updateSummaryResults({
          ...imageMapData, // lambdaGC, sampleSize, areaItems
          qqplotSrc: `data/qq-plots/${phenotype}.png`,
          loading: false
        })
      );
    }
  };
}

export function drawQQPlotPlotly(phenotype) {
  return async function(dispatch) {
    console.log("drawQQPlotPlotly", phenotype);

    const setLoading = loading => {
      dispatch(updateSummaryResults({ loading }));
    };
    const setQQPlotData = qqplotData => {
      dispatch(updateSummaryResults({ qqplotData }));
    };
    const setQQPlotLayout = qqplotLayout => {
      dispatch(updateSummaryResults({ qqplotLayout }));
    };
    setLoading(true);
    setQQPlotLayout({});
    setQQPlotData([]);
    
    // takes a long time need to optimize
    const ppoints = (n, limit, a) => {
      var size = limit ? Math.min(n, limit) : n;
      var points = new Array(size);
      for (var i = 0; i < points.length; i ++)
        points[i] = ppoint(n, i, a);

      // for (var i = 1; i <= n; i ++) {
      //     var point = parseFloat((Math.log10((i - a) / (n + (1 - a) - a)) * - 1.0).toFixed(3));
      //     points[i - 1] = point;
      //     // points[i - 1] = (Math.log10(point) * -1.0).toFixed(3);
      // }
      return points;
    };

    const ppoint = (n, i, a) => {
      if (!a) {
          a = n <= 10 ? 3/8 : 1/2;
      }
      i ++;
      return parseFloat((Math.log10((i - a) / (n + (1 - a) - a)) * - 1.0).toFixed(3));
    };


    const arrSampler= (arrLen, delta) => {
      var newArr = [];
      for (var i = 0; i < arrLen; i = i + delta) {
        newArr.push(i);
      }
      return newArr;
    }

    var topVariantDataCutOff = 10000;
    const subsetVariantDataMod = 100; // retrieve 1% of the rest of the variants

    const metadata = await query('metadata', {
      database: phenotype + '.db',
    });
    const metadata_count = parseInt(metadata['count_all']);
    console.log('metadata_count', metadata_count);
    const cutoffValue = 0.001;

    const topVariantData = await query('variants', {
      database: phenotype + '.db',
      // table: "",
      // columns: ['chr', 'bp', 'snp', 'p', 'nlog_p'],
      columns: ['nlog_p'],
//      pMin: 0.001,
      pMax: cutoffValue,
      orderBy: 'p',
      order: 'asc',
      // nlogpMin: 3,
      limit: topVariantDataCutOff,
      raw: true
    });
    const topObservedVariants = topVariantData.data.flat();
    console.log("topObservedVariants", topObservedVariants);

    let topVariantDataNLogPCutOff = topObservedVariants[topObservedVariants.length - 1];
    console.log("topVariantDataNLogPCutOff", topVariantDataNLogPCutOff);

    const topVariantDataExpectedCutOff = topObservedVariants.length;
    console.log("topVariantDataExpectedCutOff", topVariantDataExpectedCutOff);

    const subsetVariantData = await query('variants', {
      database: phenotype + '.db',
      // table: "",
      columns: ['nlog_p'],
      pMin: cutoffValue,
//      pMax: 1.0,
//      nlogpMax: topVariantDataNLogPCutOff,
      mod: subsetVariantDataMod,
      orderBy: 'p',
      order: 'asc',
      raw: true
    });
    let subsetObservedVariants = subsetVariantData.data.flat();
    console.log("subsetObservedVariants", subsetObservedVariants);



    // let expected = ppoints(metadata_count);
    // console.log("expected", expected);

    let topExpectedVariants = ppoints(metadata_count, topObservedVariants.length);
    console.log("topExpectedVariants", topExpectedVariants);

    // let expectedVariants2 = expected.slice(topVariantDataExpectedCutOff, expected.length);
    // console.log("expectedVariants2", expectedVariants2);

//    let subsetExpectedVariants = arrSampler(expectedVariants2, subsetVariantDataMod);
    let subsetExpectedVariants = arrSampler(metadata_count, 100)
      .map(i => i + topObservedVariants.length)
      .map(i => ppoint(metadata_count, i));

    console.log("subsetExpectedVariants", subsetExpectedVariants);


    let qqplotData = {
      x: topExpectedVariants,
      y: topObservedVariants,
      mode: 'markers',
      type: 'scattergl',
      marker: {
        size: 8,
        opacity: 0.65
      },
      showlegend: false
    };

    let qqplotData2 = {
      x: subsetExpectedVariants,
      y: subsetObservedVariants,
      mode: 'markers',
      type: 'scattergl',
      marker: {
        size: 8,
        opacity: 0.65
      },
      showlegend: false
    };

    // let qqplotSummaryData = {
    //   x: expectedSummarySample,
    //   y: observedSummary,
    //   mode: 'markers',
    //   type: 'scattergl',
    //   marker: {
    //     size: 8,
    //     // opacity: 0.65
    //   },
    //   showlegend: false
    // };

    let qqplotLineData = {
      x: [0.0, qqplotData.x[0]],
      y: [0.0, qqplotData.x[0]],
      mode: 'lines',
      type: 'scattergl',
      line: {
        color: 'gray',
        width: 1
      },
      opacity: 0.5,
      showlegend: false
    };

    let qqplotLayout = {
      dragmode: 'pan',
      width: 800,
      height: 800,
      title: {
        text: '<b>\u03BB</b> = n/a        <b>Sample Size</b> = ' + metadata_count,
        font: {
          family: 'Arial',
          size: 14,
          color: 'black'
        },
      },
      xaxis: {
        automargin: true,
        rangemode: 'tozero', // only show positive 
        showgrid: false, // disable grid lines
        fixedrange: true, // disable zoom
        title: {
          text: '<b>Expected -log<sub>10</sub>(p)</b>',
          font: {
            family: 'Arial',
            size: 14,
            color: 'black'
          },
        },
        tick0: 0,
        ticklen: 10,
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
      },
      yaxis: {
        automargin: true,
        rangemode: 'tozero', // only show positive 
        showgrid: false, // disable grid lines
        fixedrange: true, // disable zoom
        title: {
          text: '<b>Observed -log<sub>10</sub>(p)</b>',
          font: {
            family: 'Arial',
            size: 14,
            color: 'black'
          },
        },
        tick0: 0,
        ticklen: 10,
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
      }
    };
    setQQPlotLayout(qqplotLayout);
    // setQQPlotData([qqplotData, qqplotSummaryData, qqplotLineData]);
    setQQPlotData([qqplotData, qqplotData2, qqplotLineData]);
    setLoading(false);
  };
}

export function drawHeatmap(phenotypes) {
  return async function(dispatch) {
    const getZColor = (phenotype1, phenotype2, correlationData) => {
      var r2 = 0.0;
      if (phenotype1 in correlationData && phenotype2 in correlationData) {
        if (phenotype2 in correlationData[phenotype1] || phenotype1 in correlationData[phenotype2]) {
          if (phenotype2 in correlationData[phenotype1]) {
            r2 = correlationData[phenotype1][phenotype2];
          } else {
            r2 = correlationData[phenotype2][phenotype1];
          }
        } else {
          r2 = 0.0;
        }
      } else {
        r2 = 0.0;
      }


      if (r2 === -1.0 || r2 === 1.0) {
        r2 = 0.0;
      }

      return r2;
    };
    const getZText = (phenotype1, phenotype2, correlationData) => {
      var r2 = 0.0;
      if (phenotype1 in correlationData && phenotype2 in correlationData) {
        if (phenotype2 in correlationData[phenotype1] || phenotype1 in correlationData[phenotype2]) {
          if (phenotype2 in correlationData[phenotype1]) {
            r2 = correlationData[phenotype1][phenotype2];
          } else {
            r2 = correlationData[phenotype2][phenotype1];
          }
        } else {
          r2 = 0.0;
        }
      } else {
        r2 = 0.0;
      }

      return r2;
    };
    const setLoading = loading => {
      dispatch(updateSummaryResults({ loading }));
    };
    const setHeatmapData = heatmapData => {
      dispatch(updatePhenotypeCorrelations({ heatmapData }));
    };
    const setHeatmapLayout = heatmapLayout => {
      dispatch(updatePhenotypeCorrelations({ heatmapLayout }));
    }
    const setPopupTooltipStyle = popupTooltipStyle => {
      dispatch(updatePhenotypeCorrelations({ popupTooltipStyle }));
    };
    const setPopupTooltipData = popupTooltipData => {
      dispatch(updatePhenotypeCorrelations({ popupTooltipData }));
    };

    setLoading(true);
    setPopupTooltipStyle({display: 'none'});
    setPopupTooltipData(null);

    setHeatmapLayout({});
    setHeatmapData([]);

    const correlationData = await query(`data/sample_correlations_sanitized.json`);

    var uniquePhenotypes = phenotypes.map(phenotype => phenotype.title ? phenotype.title : phenotype.label);
    let n = uniquePhenotypes.length;
    let x = uniquePhenotypes;
    let y = uniquePhenotypes;
    let zColor = [];
    let zText = [];

    for (var xidx = 0; xidx < n; xidx++) {
      let rowColor = [];
      let rowText = [];
      for (var yidx = 0; yidx < n; yidx++) {
        rowColor.push(getZColor(x[xidx], y[yidx], correlationData));
        rowText.push(getZText(x[xidx], y[yidx], correlationData));
      }
      zColor.push(rowColor);
      zText.push(rowText);
    }

    let heatmapData = {
      x,
      y,
      z: zColor,
      zmin: -1.0,
      zmax: 1.0,
      text: zText,
      xgap: 1,
      ygap: 1,
      type: 'heatmap',
      colorscale: [
        ['0.0', 'rgb(0,0,255)'],
        ['0.49999999', 'rgb(255,255,255)'],
        ['0.5', 'rgb(204,204,204)'],
        ['0.50000001', 'rgb(255,255,255)'],
        ['1.0', 'rgb(255,0,0)']
      ],
      showscale: false,
      hoverinfo: 'x+y',
      hovertemplate:
        '%{x}<br>' +
        '%{y}<br>' +
        '<b>Correlation</b>: %{text}' +
        '<extra></extra>'
    };
    let heatmapLayout = {
      width: 1000,
      height: 1000,
      margin: {
        t: 120
      },
      // title: 'Example Heatmap',
      xaxis: {
        automargin: true,
        // autorange: 'reversed',
        side: 'top',
        tickangle: -45,
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
        tickvals: uniquePhenotypes,
        ticktext: uniquePhenotypes.map(phenotype => phenotype.length > 20 ? phenotype.substring(0, 20) + "..." : phenotype),
        // dtick: 5,
      },
      yaxis: {
        automargin: true,
        autorange: 'reversed',
        tickangle: 'auto',
        tickfont: {
          family: 'Arial',
          size: 10,
          color: 'black'
        },
        tickvals: uniquePhenotypes,
        ticktext: uniquePhenotypes.map(phenotype => phenotype.length > 20 ? phenotype.substring(0, 20) + "..." : phenotype),
        // dtick: 5
      }
    };
    setHeatmapLayout(heatmapLayout);
    setHeatmapData([heatmapData]);
    setLoading(false);
  };
}

export function lookupVariants(phenotypes, variant) {
  return async function(dispatch) {
    dispatch(
      updateVariantLookup({
        loading: true,
        results: [],
        submitted: new Date()
      })
    );

    var tableList = [];
    for (let i = 0; i < phenotypes.length; i++) {
      const { data } = await query('variants', {
        database: phenotypes[i].value + '.db',
        snp: variant,
      });
      console.log("data", data);
      if (!data || data.length === 0) {
        tableList.push({
          phenotype: phenotypes[i].title ? phenotypes[i].title : phenotypes[i].label,
          a1: '-',
          a2: '-',
          bp: '-',
          chr: '-',
          or: '-',
          p: '-',
          variant_id: '-'
        });
      } else {
        for (let j = 0; j < data.length; j++) {
          console.log(data[j]);
          data[j]['phenotype'] = phenotypes[i].title ? phenotypes[i].title : phenotypes[i].label;
          tableList.push(data[j]);
        }
      }
    }
    dispatch(
      updateVariantLookup({
        loading: false,
        results: tableList
      })
    );
  };
}
