import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
// an instance of the draco loader and path to the draco dir with all the webassembly files
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
// an instance of the gltf loader and enabling the dracoloader to be able to use the draco files
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
// // loading gltf-def \\ \\
// // duck
// gltfLoader.load(
//   "/models/Duck/glTF/Duck.gltf",
//   (gltf) => {
//     // adding gltf model to the scene
//     scene.add(gltf.scene.children[0]);
//   }
//   // () => {
//   //   console.log(`progress`);
//   // },
//   // () => {
//   //   console.log(`error`);
//   // }
// );
// // helmet
// gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
//   // adding gltf model to the scene
//   // console.log(gltf.scene);
//   // scene.add(gltf.scene.children[0]);
//   // not working as parts get removed from the original child array
//   // gltf.scene.children.forEach((child) => scene.add(child));
//   // working solution 1
//   // while (gltf.scene.children.length) {
//   //   scene.add(gltf.scene.children[0]);
//   // }
//   // working solution 2
//   // const modelParts = [...gltf.scene.children];
//   // modelParts.forEach((part) => scene.add(part));
//   // working solution 3
//   scene.add(gltf.scene);
// });
// // fox
let mixer = null;
gltfLoader.load("/models/Fox/glTF/Fox.gltf", (gltf) => {
  // an instance of the animation mixer
  mixer = new THREE.AnimationMixer(gltf.scene);
  // an animation action
  const action = mixer.clipAction(gltf.animations[2]);
  // calling the action to play our animation
  action.play();

  // fitting the scene containing for to our three.js scene
  gltf.scene.scale.set(0.025, 0.025, 0.025);
  scene.add(gltf.scene);
  // scene.add(gltf.scene.children[0]);
});

// // loading gltf-bin \\ \\
// gltfLoader.load(
//   "/models/Duck/glTF-Binary/Duck.glb",
//   (gltf) => {
//     scene.add(gltf.scene.children[0]);
//   }
// );

// // loading gltf-embedded \\ \\
// gltfLoader.load("/models/Duck/glTF-Embedded/Duck.gltf", (gltf) => {
//   scene.add(gltf.scene.children[0]);
// });

// // loading gltf-draco \\ \\
// gltfLoader.load("./models/Duck/glTF-Draco/Duck.gltf", (gltf) => {
//   //
//   scene.add(gltf.scene);
// });

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#444444",
    metalness: 0,
    roughness: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // update mixer for animation
  // as mixer is null initially to prevent the error until our model is loaded
  if (mixer !== null) {
    mixer.update(deltaTime);
  }
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// There are numerous 3D model formats each one responding to a problem
// What data, weight, compression, compatibility, copyrights, etc.

// There are also different criterias
// Dedicated to 1 software, very light but might lack specific data, almost all data but heavy, open source, not ope source, binary, ASCII, etc
// We can create our own format as well
// Popular formats are:
// OBJ, FBX, STL, PLY, COLLADA, 3DS, GLTF
// The most popular among them that has almost become a standard is GLTF

// GL Transmission Format - made by the khronos group
// It supports different sets of data like geometries, materials, cameras, lights, scene graph(like conmponents within components and so on), animation, skeletons, morphing, etc.
// It also supports various formats like JSON, binary, embed textures
// Note that it is not obligatory to use GLTF on each case

// A glTF file can have different formats:

// 1)glTF - the default format; contains multiple files
// .gltf is of type json and contains all the necessary info about the model, except geometries and textures
// .bin is a binary that usually contains data like geometries(vertices positions, UV coordinates, normals, colors, etc.)
// .png is the texture
// When we load .gltf file the other files should auto be loaded

// 2) gltf-binary - only one file of type binary, that contains all the data that we have talked. It's usually lighter, easier to load but hard to modify

// 3) gltf-draco - same as gltf default but the buffer data is compressed using the Draco algo. Much lighter

// 4) gltf-embedded - one file like the gltf-binary, but of type JSON (so we can read it), and is heavier

// Choosing which type to use depends on the project. If you want to alter the files better use gltf-default, and for one file approach better use gltf-binary
// When you export models from different 3d softwares in gltf format, it will use the standart principles like pbr (physically based rendering)

// to be able to use 3d model of gltf type we first have to import the GLTFLoader like we did with texture, font, cubeTexture loaders.
// Next we have to instantiate new GLTFLoader
// Just like other loaders we can use a loading manager (to mutualize the events)
// Next we have to use the .load() method on that instance, which receives a path to the 3d model file (starting form inside the static dir), a success, progress and error callback functions
// When we load the model we can get the access to what has been loaded by checking the arg passed to the 2nd (success) callb function
// When you load a model you don't get it rendered instantly, but you get the data back to be used to render that model
// The scene prop of that arg contains everything we need. We have one Group inside it which contains Children, that is an array of Object3Ds, which in turn have childrens of type array containing PerspectiveCamera and Mesh
// Mesh should be our 3d Model, The camera and the ed model are in an Object3D
// That object has the scale set to a small val.
// When you load a model always watch for its position, rotation, and scale

// We have multiple ways of adding our 3d model to our scene:
// 1. Add the whole scene to our scene (Not the best way)
// 2. Add every children of the scene to our scene and ignore the PerspectiveCamera
// 3. Filter the children before adding them to the scene
// 4. Add only the Mesh and end up with the model of the wrong scale, position, and rotation as they are stored in the parent
// 5. Open the model in 3d software, get rid of the unnecessary stuff ensuring that you leave the proper scale and reimport it back

// There are many models consisting of numerous children parts and if we try to loop through them and add them to our three.js scene they get removed from the original array and we don't get the entire model, but some random parts of it
// One solution for this problem is to loop through the entire children array and on each iteration only get the first child (as 1st is removed on each iteration and next one would be the new 1st element)
// Another solution would be to create a duplicate of the original children array and then loop though it, where elements won't be removed
// Another and most simplest way among all is to simply add gltf.scene to our three.js scene. Note that in this case will add othen unnecessary stuff as well

// As mentioned before the Draco version of the gltf model can be much lighter than the def one. Compression is applied to the buffer data, typically the geometry. Draco isn't exclusive to gltf format, but they are often used together. Google develops the draco algo under the apache license
// To be able to load the gltf model compressed with the draco we need to use the DRACOLoader. 1st import it. Next instantiate it before the gltf loader
// Note that decoder is also available in WebAssembly, and it can run in a worker to improve the performance. We should provide draco as a different file to the worker. To be able to use the draco grab the necessary dir: node-modules->three->js->libs->draco and pass it to our static dir. Next we have to reference to that dir using setDecoderPath() and passing the elative path inside the static dir "/draco/". With this we ensure that draco uses the webassembly version with the worker making our model to load much faster. Finally we have to pass the dracoLoader to the gltfLoader using the setDRACOLoader() method
// Note that in case if we load a non-draco version of the model, the draco loader won't even be initialized/used

// Draco loader isn't a win-win situation. The geometries are lighter but the user has to load both DRACOLoader class and decoder + it takes time/resources for your comp to decode the compressed data
// So the rule of thumb is to use Draco loader in case you have big files in MBs and not when you have small files in KBs

// GLTF supports animations (animations array) and three.js can handle them

// When you have huge models it isn't good ide to scale the model itself to fit it to our three.js scene. Instead we can scale the scene of the gltf model using .scale.set() methods as we did with simple objects and add it to our three.js scene.

// The loaded gltf model can contain multiple AnimationClips.
// An AnimationClip is a reusable set of keyframe tracks which represent an animation
// We need to create an AnimationMixer. It's like a player assoc. with an obj that can contain >=1 AnimationClips
// 1st inside the success function of the gltfLoader create anc instance of the AnimationMixer with models scene as an arg. Next we can pass one of the animations from the gltf model animations array to mixerInstance.clipAction() to be able to play that animation. As a result we get what's called an AnimationAction obj with all the details of the animation. Then we have to call .play() on the variableNameForAction to play the animation. Finally we need to tell our instance of animation mixer to update itself on each frame in our tick function by calling .update(deltaTime) on that mixer instance

// three.js editor is like a small online 3D software. It's similar ot othe 3D softwares like Blender where you can test your models
