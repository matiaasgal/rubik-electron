const btn = document.getElementById('start')
btn.addEventListener('click', iniciarCubo)

function iniciarCubo() {
    document.getElementById('start').style.display = 'none';
    document.getElementById('cubeCanvas').style.display = 'block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const render = new THREE.WebGLRenderer({canvas: document.getElementById('cubeCanvas')})
    render.setSize(window.innerWidth, window.innerHeight)

    const cubeSize = 3
    const cubeletSize = 1
    const cubelets = []
    const wireframes = []  // Array para almacenar los wireframes

    const colors = [
        0xff0000,
        0x00ff00,
        0x0000ff,
        0xffff00,
        0xffa500,
        0xffffff
    ]

    for (let x = 0; x < cubeSize; x++) {
        for (let y = 0; y < cubeSize; y++) {
            for (let z = 0; z < cubeSize; z++){
                const geometry = new THREE.BoxGeometry(cubeletSize * 0.95, cubeletSize * 0.95, cubeletSize * 0.95)
                const materials = [
                    new THREE.MeshBasicMaterial({ color: colors[0] }),
                    new THREE.MeshBasicMaterial({ color: colors[1] }),
                    new THREE.MeshBasicMaterial({ color: colors[2] }),
                    new THREE.MeshBasicMaterial({ color: colors[3] }),
                    new THREE.MeshBasicMaterial({ color: colors[4] }),
                    new THREE.MeshBasicMaterial({ color: colors[5] })
                ]

                // Crear el cubito principal con colores
                const cubelet = new THREE.Mesh(geometry, materials)
                cubelet.position.set(x - 1, y - 1, z - 1)
                
                // Crear bordes negros usando wireframe
                const wireframeGeometry = new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize)
                const wireframeMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x000000, 
                    wireframe: true, 
                    linewidth: 3
                })
                const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
                wireframe.position.set(x - 1, y - 1, z - 1)
                
                // Agregar ambos a la escena y a los arrays
                cubelets.push(cubelet)
                wireframes.push(wireframe)
                scene.add(cubelet)
                scene.add(wireframe)
            }
        }
    }

    camera.position.z = 5
    const controls = new THREE.OrbitControls(camera, render.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.25
    controls.enableZoom = true

    function rotateSide(axis, layer, direction){
        const rotateAxis = new THREE.Vector3();
        rotateAxis[axis] = 1
        const rotateMatrix = new THREE.Matrix4().makeRotationAxis(rotateAxis, direction * Math.PI / 2);

        // Rotar cubelets
        cubelets.forEach(cubelet => {
            if (Math.round(cubelet.position[axis]) === layer){
                cubelet.applyMatrix4(rotateMatrix)
                cubelet.position.round()
            }
        })
        
        // Rotar wireframes
        wireframes.forEach(wireframe => {
            if (Math.round(wireframe.position[axis]) === layer){
                wireframe.applyMatrix4(rotateMatrix)
                wireframe.position.round()
            }
        })
    }

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

    // randomRotations()

    function animate(){
        requestAnimationFrame(animate)
        controls.update()
        render.render(scene, camera);
        checkIfSolved()
    }

    animate()

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                rotateSide('y', 1, 1)
                break
            case 'ArrowDown':
                rotateSide('y', -1, -1)
                break
            case 'ArrowLeft':
                rotateSide('x', -1, -1)
                break
            case 'ArrowRight':
                rotateSide('x', 1, 1)
                break
            case 'w':
                rotateSide('z',-1, 1)
                break
            case 's':
                rotateSide('z', 1, -1)
                break
            case 'a':
                rotateSide('y', -1, 1)
                break
            case 'd':
                rotateSide('y', 1, -1)
                break
            case 'q':
                rotateSide('x', -1, 1)
                break
            case 'e':
                rotateSide('x', 1, -1)
                break
            case 'z':
                rotateSide('x', 0, 1)
                break
            case 'x':
                rotateSide('x', 0, -1)
                break
            case 'c':
                rotateSide('y', 0, 1)
                break
            case 'v':
                rotateSide('y', 0, -1)
                break
            case 'b':
                rotateSide('z', 0, 1)
                break
            case 'n':
                rotateSide('z', 0, -1)
                break
        }
        checkIfSolved()
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