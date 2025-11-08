document.getElementById('startCube').addEventListener('click', startCube);

function startCube() {
    // console.log("hola")
    document.getElementById('startCube').style.display = 'none';
    document.getElementById('title').style.display = 'none';
    document.getElementById('subtitle').style.display = 'none';
    document.getElementById('cubeCanvas').style.display = 'block';
    document.getElementById('controls').style.display = 'block';
    document.getElementById('instructions').style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const render = new THREE.WebGLRenderer({canvas: document.getElementById('cubeCanvas')});
    render.setSize(window.innerWidth, window.innerHeight);

    const cubeSize = 3;
    const cubeletSize = 1
    const cubelets = []
    const wireframes = []
    const initialPositions = [] // guardar posiciones iniciales para reset

    const colors = [
        0xff0000, // rojo
        0x00ff00, // verde
        0x0000ff, // azul
        0xffff00, // amarillo
        0xffa500, // naranjo
        0xffffff  // blanco
    ]

    // creacion de los 27 cubitos
    for (let x = 0; x < cubeSize; x++) {
        for (let y = 0; y < cubeSize; y++) {
            for (let z = 0; z < cubeSize; z++){
                const geometry = new THREE.BoxGeometry(cubeletSize * 0.95, cubeletSize * 0.95, cubeletSize * 0.95)
                const materials = [
                    new THREE.MeshBasicMaterial({ color: colors[0] }), // cara roja
                    new THREE.MeshBasicMaterial({ color: colors[1] }), // cara verde
                    new THREE.MeshBasicMaterial({ color: colors[2] }), // cara azul
                    new THREE.MeshBasicMaterial({ color: colors[3] }), // cara amarilla
                    new THREE.MeshBasicMaterial({ color: colors[4] }), // cara naranja
                    new THREE.MeshBasicMaterial({ color: colors[5] })  // cara blanca
                ]

                const cubelet = new THREE.Mesh(geometry, materials)
                cubelet.position.set(x - 1, y - 1, z - 1)
                
                const wireframeGeometry = new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize)
                const wireframeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000, 
                    wireframe: true, 
                    linewidth: 3
                })
                const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
                wireframe.position.set(x - 1, y - 1, z - 1)
                
                // Guardar posición inicial para reset
                initialPositions.push({
                    cubelet: { x: x - 1, y: y - 1, z: z - 1 },
                    wireframe: { x: x - 1, y: y - 1, z: z - 1 }
                })
                
                cubelets.push(cubelet)
                wireframes.push(wireframe)
                scene.add(cubelet)
                scene.add(wireframe)
            }
        }
    }

    camera.position.z = 5 // cantidad de unidades de alejamiento de la camara
    const controls = new THREE.OrbitControls(camera, render.domElement) // rotacion y zoom de la camara
    controls.enableDamping = true // movimiento suave
    controls.dampingFactor = 0.25 // cantidad de suavizado
    controls.enableZoom = true // permite zoom

    function rotateSide(axis, layer, direction){
        const rotateAxis = new THREE.Vector3();
        rotateAxis[axis] = 1
        const rotateMatrix = new THREE.Matrix4().makeRotationAxis(rotateAxis, direction * Math.PI / 2);

        cubelets.forEach(cubelet => {
            if (Math.round(cubelet.position[axis]) === layer){
                cubelet.applyMatrix4(rotateMatrix)
                cubelet.position.round()
            }
        })
        
        wireframes.forEach(wireframe => {
            if (Math.round(wireframe.position[axis]) === layer){
                wireframe.applyMatrix4(rotateMatrix)
                wireframe.position.round()
            }
        })
    }

    // funcion para resetea el cubo
    function resetCube() {
        for (let i = 0; i < cubelets.length; i++) {
            cubelets[i].position.set(
                initialPositions[i].cubelet.x,
                initialPositions[i].cubelet.y,
                initialPositions[i].cubelet.z
            );
            wireframes[i].position.set(
                initialPositions[i].wireframe.x,
                initialPositions[i].wireframe.y,
                initialPositions[i].wireframe.z
            );
            
            cubelets[i].rotation.set(0, 0, 0); 
            cubelets[i].updateMatrix();
            
            wireframes[i].rotation.set(0, 0, 0); 
            wireframes[i].updateMatrix();
        }
        
        scene.updateMatrixWorld(true);
    }
        
    document.getElementById('reset').addEventListener('click', resetCube) // boton reset

    // funcion para randomizar el orden
    function randomRotations() {
        const axes = ['x', 'y', 'z']
        const layers = [-1, 0, 1]
        const directions = [-1, 1]

        for (let i = 0; i<20; i++){
            const axis = axes[Math.floor(Math.random() * axes.length)]
            const layer = layers[Math.floor(Math.random() * layers.length)]
            const direction = directions[Math.floor(Math.random() * directions.length)]
            rotateSide(axis,layer,direction)
        }
    }

    document.getElementById('random').addEventListener('click', randomRotations); // boton random

    function animate(){
        requestAnimationFrame(animate)
        controls.update()
        render.render(scene, camera);
        checkIfSolved()
    }

    animate()

    // teclas
    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        const key = e.key.toLowerCase();
        const invert = e.shiftKey ? -1 : 1;
        if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
            document.activeElement.blur();
        }

        switch (key) {
            case 'arrowup': rotateSide('y', 1, invert); break;
            case 'arrowdown': rotateSide('y', -1, -invert); break; // si tu convención para down está invertida
            case 'arrowleft': rotateSide('x', -1, -invert); break;
            case 'arrowright': rotateSide('x', 1, invert); break;
            case 'q': rotateSide('z', 1, -invert); break;
            case 'w': rotateSide('z', -1, invert); break;
            case 'e': rotateSide('x', 0, invert); break;
            case ' ': rotateSide('y', 0, invert); break;
            case 'r': rotateSide('z', 0, invert); break;
        }
        checkIfSolved() // se verifica si se resolvio en cada movimiento
     })

     window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix();
        render.setSize(window.innerWidth, window.innerHeight)
     })

     function checkIfSolved(){
        // Lógica simplificada - solo verifica que no haya errores
        // Para una implementación completa del cubo de Rubik, 
        // necesitarías verificar que cada cara tenga un solo color
        try {
            const currentColors = cubelets.flatMap(cubelet => {
                if (Array.isArray(cubelet.material)) {
                    return cubelet.material.map(material => material.color.getHex())
                } else {
                    return [cubelet.material.color.getHex()]
                }
            })
            // Console.log removido - se ejecutaba 60 veces por segundo
        } catch (error) {
            console.error('Error in checkIfSolved:', error)
        }
     }
}

