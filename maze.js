window.AVG = window.AVG || {}

const N = 1, S = 2, E = 4, W = 8
const LIMIT = 10000
const DIRECTIONS = [N, E, S, W]
const OPPOSITE = {
    [N] : S,
    [S] : N,
    [E] : W,
    [W] : E
}
const DX = {
    [N] : 0,
    [S] : 0,
    [E] : 1,
    [W] : -1
}
const DY = {
    [N] : -1,
    [S] : 1,
    [E] : 0,
    [W] : 0
}

class Maze {
    constructor(options) {
        this.options = options || {}

        this.X = this.options.x || 20
        this.Y = this.options.y || 20

        this.START = { x: 0, y: 0 }
        this.STOP = { x: this.X - 1, y: this.Y - 1 }
        
        this.el = document.createElement('div')
        this.el.innerHTML = `<div class="avg_wrapper">
                <div class="avg_header">
                    <button class="avg_btn avg_new avg_left">New Maze</button>
                    <button class="avg_btn avg_solve avg_right">Solve</button>
                    <h1 class="avg_title">Maze</h1>
                </div>
                <div class="avg_game avg-table"></div>
            </div>`

        this.table = this.el.querySelector('.avg-table')
        this.el.querySelector('.avg_new').addEventListener('click', this.new_game.bind(this))
        this.btn_solve = this.el.querySelector('.avg_solve')
        this.btn_solve.addEventListener('click', () => {
            this.btn_solve.disabled = true
            this.solve(this.START.x, this.START.y)
            this.get_path(this.START.x, this.START.y)
            this.display()
        });
        this.new_game();
    }

    new_game() {
        clearTimeout(this.timer)
        this.btn_solve.disabled = false
        this.init()
        this.carve_passage(this.START.x, this.START.y)
        this.display()
    }

    init() {
        this.solved = false
        this.grid = []
        this.visits = []
        this.path = []

        for (let i = 0; i < this.X; i++) {
            this.grid[i] = []
            this.visits[i] = []
            this.path[i] = []
            for (let j = 0; j < this.Y; j++) {
                this.grid[i][j] = 0
                this.visits[i][j] = 0
                this.path[i][j] = 0
            }
        }
    }

    rand(min, max) {
        return  Math.floor(Math.random() * (max - min + 1)) + min
    }

    shuffle_array(array) {
        for (let i = 0; i < array.length - 1; i++) {
            let r = i + this.rand(0, array.length - i - 1)
            let temp = array[i]
            array[i] = array[r]
            array[r] = temp
        }
    }

    in_bounds(nx, ny) {
        return nx < this.X && nx >= 0 && ny < this.Y && ny >= 0
    }

    carve_passage(cx, cy) {

        // shuffle the direction array
        let directions = [].slice.call(DIRECTIONS)
        this.shuffle_array(directions)

        // iterates through the direction then test if the cell in that direction is valid and
        // within the bounds of the maze
        directions.forEach(direction => {
            // check if the cell is valid
            let nx = cx + DX[direction]
            let ny = cy + DY[direction]
            
            // check if we are on valid grid and grid is not visited
            if (this.in_bounds(nx, ny) && this.grid[nx][ny] == 0) {
                this.grid[cx][cy] |= direction
                this.grid[nx][ny] |= OPPOSITE[direction]
                this.carve_passage(nx, ny)
            }
        })
    }

    display() {
        /** Display the grid **/

        let output = '<div class="avg_maze-container">'

        for (let j = 0; j < this.Y; j++) {
            output += '<div class="avg_maze-tr">'
            for (let i = 0; i < this.X; i++) {
                let style = ''
                if ((this.grid[i][j] & E) == 0) style += ' right'
                if ((this.grid[i][j] & S) == 0) style += ' bottom'
                
                if (j === 0) {
                    if ((this.grid[i][j] & N) == 0) style += ' top'
                }
                if (i === 0) {
                    if ((this.grid[i][j] & W) == 0) style += ' left'
                }

                if (this.path[i][j] > 0) {
                    style += ' start'
                }

                if (this.START.x === i && this.START.y === j) {
                    style += ' start'
                } else if (this.STOP.x === i && this.STOP.y === j) {
                    style += ' stop'
                }

                let msg = ''
                if (this.options.showArrows && this.path[i][j] > 0) {
                    if (this.visits[i][j] & N) msg = "↑"
                    if (this.visits[i][j] & S) msg = "↓"
                    if (this.visits[i][j] & E) msg = "→"
                    if (this.visits[i][j] & W) msg = "←"
                }
                output += `<div class="avg_maze-td ${style}">${msg}</div>`
            }
            output += '</div>'
        }
        output += '</div>'

        this.table.innerHTML = output
    }

    get_path(cx, cy) {
        if (!this.in_bounds(cx, cy)) return
        if (cx === this.STOP.x && cy === this.STOP.y) {
            console.log('Path completed')
            this.btn_solve.disabled = false
        }
        let direction
        DIRECTIONS.forEach(dir => {
            if (this.visits[cx][cy] & dir) {
                direction = dir
            }
        });
        this.path[cx][cy] = 1
        this.display()
        this.timer = setTimeout(() => {this.get_path(cx + DX[direction], cy + DY[direction])}, 20)
    }

    console() {
        let string = " "
        for (let x = 0; x < this.X * 2; x++) {
            string += "_"
        }
        string += "\n"

        for (let y = 0; y < this.Y; y++) {
            string += "|"
            for (let x = 0; x < this.X; x++) {
                string += ((this.grid[x][y] & S) != 0) ? " " : "_"
                if ((this.grid[x][y] & E) != 0) {
                    string += (( (this.grid[x][y] | this.grid[x + 1][y]) & S) != 0) ?" ":"_"
                } else {
                    string += "|"
                }
            }
            string += "\n"
        }

        console.log(string)
        console.log(this.grid)
    }

    solve(cx, cy) {
        // iterates through the direction then test if the cell in that direction is valid and
        // within the bounds of the maze
        DIRECTIONS.forEach(direction => {
            if (this.solved) return

            // check if the cell is valid
            let nx = cx + DX[direction]
            let ny = cy + DY[direction]

            // check if we are on valid grid and grid is not visited
            if (this.in_bounds(nx, ny) && this.visits[nx][ny] == 0 && (this.grid[cx][cy] & direction) !== 0) {
                this.visits[cx][cy] |= direction
                // this.visits[nx][ny] |= OPPOSITE[direction]

                if (nx === this.STOP.x && ny === this.STOP.y) {
                    this.solved = true
                    console.log("SOLVED")
                } else {
                    this.solve(nx, ny)
                }
            }
        })
    }
}
