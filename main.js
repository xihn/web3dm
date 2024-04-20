
import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Rhino3dmLoader } from 'three/addons/loaders/3DMLoader.js';


import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let camera, scene, renderer;
let controls, gui;

init();
animate();

function init() {

  THREE.Object3D.DEFAULT_UP.set( 0, 0, 1 );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 265, - 605, 265 );

  scene = new THREE.Scene();

  //const directionalLight = new THREE.DirectionalLight( 0xffffff, 6 );
  //directionalLight.position.set( 0, 0, 2 );
  //scene.add( directionalLight );

  const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
  dirLight.position.set( - 0, 40, 50 );
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 50;
  dirLight.shadow.camera.bottom = - 25;
  dirLight.shadow.camera.left = - 25;
  dirLight.shadow.camera.right = 25;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 200;
  dirLight.shadow.mapSize.set( 1024, 1024 );
  scene.add( dirLight );

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
  hemiLight.position.set( 0, 100, 0 );
  scene.add( hemiLight );

  const loader = new Rhino3dmLoader();
  //generally, use this for the Library Path: https://cdn.jsdelivr.net/npm/rhino3dm@8.0.1
  loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@8.4.0/' );
  loader.load( 'models/3dm/tempnew.3dm', function ( object ) {

    scene.add( object );
    initGUI( object.userData.layers );

    // hide spinner
    document.getElementById( 'loader' ).style.display = 'none';

  }, function ( progress ) {

    console.log ( ( progress.loaded / progress.total * 100 ) + '%' );

  }, function ( error ) {

    console.log ( error );

  } );

  controls = new OrbitControls( camera, renderer.domElement );

  //controls.addEventListener( 'change', render );
  controls.minDistance = 100;
  controls.maxDistance = 2000;
  //controls.enablePan = false;
  controls.target.set( 0, 20, 0 );
  controls.update();

  const ground = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
  ground.rotation.x = 0;
  ground.position.y = 11;
  ground.receiveShadow = true;
  scene.add( ground );

  window.addEventListener( 'resize', resize );

}

function resize() {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

}

function animate() {

  controls.update();
  renderer.render( scene, camera );

  requestAnimationFrame( animate );

}

function initGUI( layers ) {

  gui = new GUI( { title: 'layers' } );

  for ( let i = 0; i < layers.length; i ++ ) {

    const layer = layers[ i ];
    gui.add( layer, 'visible' ).name( layer.name ).onChange( function ( val ) {

      const name = this.object.name;

      scene.traverse( function ( child ) {

        if ( child.userData.hasOwnProperty( 'attributes' ) ) {

          if ( 'layerIndex' in child.userData.attributes ) {

            const layerName = layers[ child.userData.attributes.layerIndex ].name;

            if ( layerName === name ) {

              child.visible = val;
              layer.visible = val;

            }

          }

        }

      } );

    } );

  }

}