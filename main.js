const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

class Matrix {
    constructor(data) {
        this.data = data
    }

    static vector(raw) {
        const data = raw.map(i => [i])
        return new Matrix(data)
    }

    get size() {
        return this.data[0].length * this.data.length
    }

    get flat() {
        return this.data.reduce((acc, curr) => {
            acc.push(...curr)

            return acc
        }, [])
    }
}

function dot(A, B) {
    const matA = A.data
    const matB = B.data
    if (
        matA.length === 0 ||
            matB.length === 0 ||
            matA[0].length !== matB.length
    ) {
        throw new Error("Invalid input matrices.");
    }

    const numRowsA = matA.length;
    const numColsA = matA[0].length;
    const numRowsB = matB.length;
    const numColsB = matB[0].length;

    const result = [];

    for (let i = 0; i < numRowsA; i++) {
        result[i] = [];
        for (let j = 0; j < numColsB; j++) {
            result[i][j] = 0;
            for (let k = 0; k < numColsA; k++) {
                result[i][j] += matA[i][k] * matB[k][j];
            }
        }
    }

    return new Matrix(result);
}

const cube = [
    [-1, 1, 1],
    [1, 1, 1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, -1, -1]
]

function drawCube(translate, scale, rotate) {
    const points = []
    for(const point of cube) {
        const vec = Matrix.vector([...point, 1])
        const model = dot(
            modelMatrix(
                scale,
                translate,
                rotate
            ),
            vec
        )

        putPixel(model.flat)
        points.push(model.flat)
    }

    drawLine(points[0], points[1])
    drawLine(points[1], points[2])
    drawLine(points[2], points[3])
    drawLine(points[3], points[0])

    drawLine(points[4], points[5])
    drawLine(points[5], points[6])
    drawLine(points[6], points[7])
    drawLine(points[7], points[4])

    drawLine(points[4], points[0])
    drawLine(points[5], points[1])
    drawLine(points[6], points[2])
    drawLine(points[7], points[3])
}

function putPixel([x, y]) {
    ctx.fillStyle = 'rgb(200 0 0)'
    ctx.fillRect(
        x - 5,
        y - 5,
        10,
        10
    )
}

function drawLine(p1, p2) {
    ctx.fillStyle = 'rgb(0 0 0)'
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();
}

function main() {
    //test()

    mainLoop(0)
}

function mainLoop(i) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawCube(
        [250, 200, 0],
        100,
        [i, i, Math.sin(Date.now() / 1000)]
    )
    
    setTimeout(mainLoop.bind(null, (i + (1 / 32)) % 360), 1000 / 60)
}

function translationMatrix([x, y, z]) {
    return new Matrix([
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ])
}

function scalingMatrix(scale) {
    return new Matrix([
        [scale, 0, 0, 0],
        [0, scale, 0, 0],
        [0, 0, scale, 0],
        [0, 0, 0, 1]
    ])
}

function rotationMatrix([pitch, yaw, roll]) {
    const pMat = new Matrix([
        [1, 0, 0, 0],
        [0, Math.cos(pitch), -Math.sin(pitch), 0],
        [0, Math.sin(pitch), Math.cos(pitch), 0],
        [0, 0, 0, 1]
    ])

    const yMat = new Matrix([
        [Math.cos(yaw), 0, Math.sin(yaw), 0],
        [0, 1, 0, 0],
        [-Math.sin(yaw), 0, Math.cos(yaw), 0],
        [0, 0, 0, 1]
    ])

    const rMat = new Matrix([
        [Math.cos(roll), -Math.sin(roll), 0, 0],
        [Math.sin(roll), Math.cos(roll), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ])

    return dot(dot(yMat, pMat), rMat)
}

function modelMatrix(scale, translate, rotation) {
    const tMat = translationMatrix(translate)
    const sMat = scalingMatrix(scale)
    const rMat = rotationMatrix(rotation)

    return dot(dot(tMat, sMat), rMat)
}

main()

function test() {
    const A = new Matrix([
        [50, 0, 0, 100],
        [0, 1, 0, 100],
        [0, 0, 1, 100],
        [0, 0, 0, 1]
    ])

    const B = Matrix.vector([200, 300, 400, 1])

    const result = dot(A.data, B.data)
    console.assert(result[0][0] == 300)
    console.assert(result[1][0] == 400)
    console.assert(result[2][0] == 500)
    console.assert(result[3][0] == 1)
}
