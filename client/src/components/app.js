import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Navbar } from './navbar';
import { Home } from './pages/home';
import { About } from './pages/about';
import { Gwas } from './pages/gwas';
import { Phenotypes } from './pages/phenotypes';
import { Downloads } from './pages/downloads';
import { ShareWrapper } from './pages/share-wrapper';


function App() {
  const [params, setParams] = useState({ trait: 'example' });

  const links = [
    {
      route: '/about',
      title: 'About',
      // cardTitle: 'About',
      image: 'assets/images/about.svg',
      navIndex: 3
    },
    {
      route: '/gwas',
      action: 'Explore',
      title: 'GWAS',
      cardTitle: 'GWAS Results',
      cardText: 'Visualize genome-wide association results with dynamic Manhattan plots and tables',
      image: 'assets/images/gwas.svg',
      navIndex: 0
    },
    {
      route: '/phenotypes',
      action: 'Browse',
      title: 'Phenotypes',
      cardTitle: 'Phenotype Characteristics',
      cardText: 'Browse trait and case definitions, descriptive characteristics and genetic correlations',
      image: 'assets/images/phenotypes.svg',
      navIndex: 1
    },
    {
      route: '/downloads',
      action: 'Download',
      title: 'Data',
      cardTitle: 'Access Data',
      cardText: 'Download files of genome-wide association study estimates and summary statistics',
      image: 'assets/images/downloads.svg',
      navIndex: 2
    },
    {
      route: '/link'
    },
  ];

  // const QueryShareLink = async (props) => {
  //   const { shareID } = props.match.params;
  //   console.log("shareID", shareID)
  //   const response = await query('share-link', {share_id:shareID});
  //   // console.log("response", response);
  //   // const updateStore = {
  //   //   "#/gwas/summary": updateSummaryResults,
  //   //   "#/gwas/lookup": updateVariantLookup,
  //   //   "#/gwas/correlations": updatePhenotypeCorrelations,
  //   //   "#/phenotypes": updateBrowsePhenotypes
  //   // }[params.route];
  //   return (
  //     <>
  //       {'123'}
  //     </>
  //   )
  // }

  return (
    <Router>
      <Navbar links={links} />
      <Route path="/" exact={true} render={_ => <Home links={links} />} />
      <Route path="/about" component={About} />
      {/* <Route path="/search/:searchType" component={Search} /> */}
      <Route
        path="/gwas"
        render={_ => <Gwas params={params} setParams={setParams} />}
      />
      <Route
        path="/phenotypes"
        render={_ => <Phenotypes params={params} setParams={setParams} />}
      />
      <Route path="/downloads" component={Downloads} />
      {/* <Redirect to="/search/gwas" /> */}
      <Route 
        path="/link/:shareID" 
        component={ShareWrapper}
        // render={_ => <QueryShareLink />}
      />
    </Router>
  );
}

export default App;
