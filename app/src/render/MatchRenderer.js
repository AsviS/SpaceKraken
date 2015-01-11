import jquery from '../lib/JQuery';
import Babylon from '../lib/Babylon';

function factory(canvas, engine, match) {
    let scene = new Babylon.Scene(engine);
    scene.clearColor = new Babylon.Color3(0, 0, 0);

    // Camera
    let camera = new Babylon.FreeCamera('camera1', new Babylon.Vector3(0, 5, -10), scene);
    camera.setTarget(Babylon.Vector3.Zero());
    camera.attachControl(canvas, false);

    // Light
    let light = new Babylon.HemisphericLight('light1', new Babylon.Vector3(0, 1, 0), scene);
    light.intensity = 0.5;

    // Map
    let map = match.map;
    map.getPlanets().forEach(planet => {
        let position = map.getPosition(planet);

        // Planets
        let sphere = Babylon.Mesh.CreateSphere(planet.name, 8, planet.size, scene);
        sphere.position.x = - (map.width / 2) + position.x;
        sphere.position.z = - (map.height / 2) + position.y;

        // Paths
        // FIXME: Each connection is drawn twice!
        let connections = map.getConnections(planet);
        connections.forEach(connection => {
            let other = map.getPosition(connection);

            let dx = position.x - other.x;
            let dy = position.y - other.y;
            let hy = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            let path = Babylon.Mesh.CreatePlane(planet.name + connection.name + 'Path', 1, scene);
            path.parent = sphere;

            path.position.x = - dx / 2;
            path.position.z = - dy / 2;
            path.rotation.y = - Math.asin(Math.abs(dy) / hy);
            path.rotation.x = Math.PI / 2;
            path.scaling.x = hy;
            path.scaling.y = 0.1;
        })
    });

    // Debug ground
    let ground = Babylon.Mesh.CreateGround('ground', map.width, map.height, Math.max(map.width, map.height), scene);
    ground.material = new Babylon.StandardMaterial("texture1", scene);
    ground.material.wireframe = true;

    return scene;
}

export default class {
    constructor(canvas, match) {
        this._engine = new Babylon.Engine(canvas, true);
        this._scene = factory(canvas, this._engine, match);
        this._resizeHandler = () => {
            this._engine.resize();
        };

        this._engine.runRenderLoop(() => {
            this._scene.render();
        });        
        jquery(window).on('resize', this._resizeHandler);
    }

    destroy() {
        jquery(window).off('resize', this._resizeHandler);
        this._engine.dispose();
    }
};