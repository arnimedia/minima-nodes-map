import React, { useRef, useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import MinimaGraph from './components/MinimaGraph';
import Modal from './components/Modal';
import useModal from './components/useModal';
// import SideSlide from './components/SideSlide';
import './Map.css';
import allnodes from './allnodes.json';
import daynodes from './daynodes.json';
import countrygeo from './countrygeo.json';
import LogoDark2x from "../src/images/minima_logo.svg";

mapboxgl.accessToken =
  'pk.eyJ1IjoicGV0ZXJob3dlbGwiLCJhIjoiY2wycmQwenB3MWtlbzNibHhkYm9pZWExMSJ9.IQXGTRlZFUS8mApIZWp53Q';


const Map = () => {

  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [showContentOne, setShowContentOne] = useState(true)
  const [loadData, setloadData] = useState(allnodes)
  const {isShowing, toggle} = useModal();
  const [isMobile, SetIsMobile] = useState(false);
  const [isMap, SetIsMap] = useState('mapbox://styles/peterhowell/cl3c0qjmk000p15nt81wjjog4');

  const [width, setWidth] = useState(window.innerWidth);
  const breakpoint = 620;

  useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleWindowResize);

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);


  const country = loadData;
  const countryArray = [];
  
  country.features.forEach(function (country, i) {
    // country.properties.id = i;
    countryArray.push(country.properties.country);
  });
  
  const countsa = Object.values(countryArray.reduce((a, c) => {
    (a[c] || (a[c] = {name: c, count: 0})).count += 1;
    return a;
  }, {})).sort(({count: ac}, {count: bc}) => bc - ac);

  // Initialize map when component mounts
  useEffect(() => {

    // 'mapbox://styles/peterhowell/cl3blrshb000415rvql540uql',
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,  
      style: isMap,
      center: [5, 34],
      zoom: 1.5
    });

    map.on('load', () => {
      map.addSource('allnodes', {
        type: 'geojson',
        data: allnodes,
      });

      map.addLayer({
        id: 'allnodes',
        type: 'circle',
        /* Add a GeoJSON source containing place coordinates and information. */
        source: 'allnodes',
        paint: {
          'circle-color': '#FF9682',
          "circle-opacity": {
            "stops": [
                [5, 0.4],
                [10, 1]
            ]
          },
          'circle-blur': 4,
          "circle-radius": {
            "stops": [
                [5, 5],
                [10, 2]
            ]
          }
        }
      });

      map.addLayer({
        id: 'allnodes1',
        type: 'circle',
        source: 'allnodes',
        paint: {
          'circle-color': '#FF512F',
          'circle-opacity': 0.4,
          'circle-blur': {
            "stops": [
              [5, 5],
              [10, 0]
            ]
          },
          "circle-radius": {
            "stops": [
                [5, 3],
                [10, 6]
            ]
        }
        }
      });

      map.addLayer({
        id: 'allnodes2',
        type: 'circle',
        source: 'allnodes',
        paint: {
          'circle-color': '#FF512F',
          'circle-opacity': 1,
          'circle-blur': {
            "stops": [
              [5, 1],
              [10, 0]
            ]
          },
          "circle-radius": {
            "stops": [
                [5, 2],
                [10, 6]
            ]
        }
        }
      });

      map.addSource('daynodes', {
        type: 'geojson',
        data: daynodes,
      });

      map.addLayer({
        id: 'daynodes',
        type: 'circle',
        source: 'daynodes',
        paint: {
          'circle-color': '#FF512F',
          'circle-opacity': 0.5,
          'circle-radius': 3,
        }
      });

      map.setLayoutProperty('daynodes', 'visibility', 'none');
      setMap(map);
    });

    // Clean up on unmount
    return () => map.remove();
  }, []);
    
  function handleContentOne(){
    setloadData(allnodes);
    setShowContentOne(true)
    map.setLayoutProperty('allnodes', 'visibility', 'visible');
    map.setLayoutProperty('allnodes1', 'visibility', 'visible');
    map.setLayoutProperty('allnodes2', 'visibility', 'visible');
    map.setLayoutProperty('daynodes', 'visibility', 'none');
    flyToCountry();
}

function handleContentTwo(){
    setloadData(daynodes);
    setShowContentOne(false);
    map.setLayoutProperty('allnodes', 'visibility', 'none');
    map.setLayoutProperty('allnodes1', 'visibility', 'none');
    map.setLayoutProperty('allnodes2', 'visibility', 'none');
    map.setLayoutProperty('daynodes', 'visibility', 'visible');
    flyToCountry();
}

function flyToCountry(location) {
  if(width < breakpoint){SetIsMobile(true)};
  const locations = countrygeo;
  map.flyTo({
    center: locations[location] == null ? [5, 34] : locations[location].geo,
    zoom: locations[location] == null ? 1.5 : locations[location].zoom
  });
}

  const SideBar = () => {
    const [margin, setMargin] = useState("");
    const setStyle = (margin) => {
      setMargin(margin);
    };

    return (
      <>
          <div className="slide-side">
              <div className="logo">
                  <img className="logo-dark logo-img" src={LogoDark2x} alt="logo" />
                  <span>Minima <br />Node count</span>
              </div>
              <div className='tabs'>
                <div onClick={() => {setStyle('move-left'); handleContentOne();}} className={`tab-one ${showContentOne ? "active" : ""}`}>All</div>
                <div onClick={() => {setStyle('move-right'); handleContentTwo();}} className={`tab-two ${showContentOne ? "" : "active"}`}>Last 24Hrs</div>
              </div>
              <div className="info-box">
              {showContentOne ? "Total Global Nodes" : "24 Hour Global Nodes"}
                <span>{country.features.length.toLocaleString()}</span> 
              </div>
              <div className={`minima-graph ${showContentOne ? "" : "none"}`}>
                <div className="graph-zoom" onClick={toggle}>&#43;</div>
                <MinimaGraph />
                <Modal
                  isShowing={isShowing}
                  hide={toggle}
                />
              </div>
              <div className='results'>
                {countsa.map(((item, index)=>(
                  <div className='results-item' key={index} onClick={()=>{flyToCountry(item.name)}}>
                      <div className='results-order'>{index + 1}.</div>
                      <div className='results-copy'>{item.name}<span>{item.count.toLocaleString()} Node{item.count === 1 ? "" : "s"}</span></div>
                  </div>
                  ))
                )}
              </div>
          </div>
      </>
    );
  };

  const Slider = ({ margin }) => {
    return (
      <div margin={margin} className={`slider ${margin}`}></div>
    );
  };

  const SideToggle = () => {
    return (
      <>
        <input id="menu1Toggle" type="checkbox" onClick={() => SetIsMobile(!isMobile)} checked={isMobile} /><label className="menu-toggle menu-1-toggle" for="menu1Toggle"><span className="menu-label">&#60;</span><span className="close-label">&#62;</span></label>
      </>
    );
  };

  return (
    <div>
      <div ref={mapContainerRef} className='map-container' />
      <SideToggle />
      <SideBar />
    </div>
  );
};

export default Map;