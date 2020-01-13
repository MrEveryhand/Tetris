var then, now
var game_time = 0
var pressed = false
then = Date.now()

var tetris = {
    field_width : 10,
    field_height : 20,
    field_center : function(){
        return Math.floor(this.field_width / 2)
    },
    fieldLength : function(){
        return this.field_height * this.field_width
    },
    level : 1,
    gamespeed : 10,
    fps : 20,
    cillynder: true,
}

var shapes_names = ['o', 'z', 's', 'j', 'l', 't', 'i']
function newShape(name){
    switch(name){
        case 'o': 
        this.init_coords = [
            [tetris.field_center(), 0],
            [tetris.field_center() + 1, 0],
            [tetris.field_center(), 1],
            [tetris.field_center() + 1, 1]
        ]
        this.state_matrixes = null
    
        break;
    case 'z': 
        this.init_coords = [
            [tetris.field_center() - 1, 0],
            [tetris.field_center(), 0],
            [tetris.field_center(), 1],
            [tetris.field_center() + 1, 1]
        ]
        this.state_matrixes = [
            [[0, 0], [0, 0], [0, 0], [0, 0]],
            [[2, 0], [1, 1], [0, 0], [-1, 1]],
            [[2, 2], [0, 2], [0, 0], [-2, 0]],
            [[0, 2], [-1, 1], [0, 0], [-1, -1]],
        ]
    
        break;
    case 's': 
        this.init_coords = [
            [tetris.field_center(), 0],
            [tetris.field_center() + 1, 0],
            [tetris.field_center() - 1, 1],
            [tetris.field_center(), 1]
        ]
        this.state_matrixes = [
            [[0, 0], [0, 0], [0, 0], [0, 0]],
            [[1, 1], [0, 2], [1, -1], [0, 0]],
            [[0, 2], [-2, 2], [2, 0], [0, 0]],
            [[-1, 1], [-2, 0], [1, 1], [0, 0]],
        ]
    
        break;
    case 'j': 
        this.init_coords = [
            [tetris.field_center() - 1, 0],
            [tetris.field_center(), 0],
            [tetris.field_center() + 1, 0],
            [tetris.field_center() + 1, 1]
        ]
        this.state_matrixes = [
            [[0, 0], [0, 0], [0, 0], [0, 0]],
            [[2, 0], [1, 1], [0, 2], [-1, 1]],
            [[2, 2], [0, 2], [-2, 2], [-2, 0]],
            [[0, 2], [-1, 1], [-2, 0], [-1, -1]],
        ]
    
        break;
    case 'l': 
        this.init_coords = [
            [tetris.field_center() - 1, 0],
            [tetris.field_center(), 0],
            [tetris.field_center() + 1, 0],
            [tetris.field_center() - 1, 1]
        ]
        this.state_matrixes = [
            [[0, 0], [0, 0], [0, 0], [0, 0]],
            [[2, 0], [1, 1], [0, 2], [1, -1]],
            [[2, 2], [0, 2], [-2, 2], [2, 0]],
            [[0, 2], [-1, 1], [-2, 0], [1, 1]],
        ]
        break;
    case 't': 
        this.init_coords = [
            [tetris.field_center() - 1, 0],
            [tetris.field_center(), 0],
            [tetris.field_center() + 1, 0],
            [tetris.field_center(), 1]
        ]
        this.state_matrixes = [
            [[0, 0], [0, 0], [0, 0], [0, 0]],
            [[2, 0], [1, 1], [0, 2], [0, 0]],
            [[2, 2], [0, 2], [-2, 2], [0, 0]],
            [[0, 2], [-1, 1], [-2, 0], [0, 0]],
        ]
        break;
    case 'i': 
        this.init_coords = [
            [tetris.field_center() - 1, 0],
            [tetris.field_center(), 0],
            [tetris.field_center() + 1, 0],
            [tetris.field_center() + 2, 0]
        ]
        this.state_matrixes = [
            [[0, 0], [0, 0], [0, 0], [0, 0]],
            [[2, -2], [1, -1], [0, 0], [-1, 1]],
        ]
        break;
    }
}

function createGame(options){
    this.options = options
    this.game_over = false
    this.pause = false
    this.free_color = 'rgb(250, 250, 250)'
    
    this.field_map = []

    for(var i = 0; i < this.options.fieldLength(); i++){
        this.field_map.push(this.free_color)
    }

    this.fieldCleanup = function(){
        var occupied_counter = 0
        var row_counter = 0
        for(var i = 0; i < this.options.fieldLength(); i++){
            row_counter++
            this.field_map[i] != this.free_color ? occupied_counter++ : null
            if(occupied_counter == this.options.field_width){
                this.field_map.splice(i - this.options.field_width + 1, this.options.field_width)
                for(var j = 0; j < this.options.field_width; j++){
                    this.field_map.splice(0, 0, this.free_color)
                }
            } 
            if(!(row_counter % this.options.field_width)){
                occupied_counter = 0
                row_counter = 0
            } 
        }
    }

    this.checkFreePlaces = function(figure, direction){
        var free = true
        figure.forEach((e, i) => {
            switch(direction){
                case 'create':
                    if(this.field_map[getCoords(e[0], e[1])] != this.free_color){
                        free = false
                    }
                    break;
                case 'down':
                    if(this.field_map[getCoords(e[0], e[1] + 1)] != this.free_color ||
                        getCoords(e[0], e[1] + 1) > this.options.fieldLength()){
                        free = false
                    }
                    break;
                case 'left':
                    if(!this.options.cillynder){
                        if(this.field_map[getCoords(e[0] - 1, e[1])] != this.free_color 
                            || e[0] - 1 < 0){
                            free = false
                        }
                    } else {
                        var test_x = e[0] - 1 < 0 ? this.options.field_width - 1 : e[0] - 1
                        if(this.field_map[getCoords(test_x, e[1])] != this.free_color){
                            free = false
                        }
                    }
                    break;
                case 'right':
                    if(!this.options.cillynder){
                        if(this.field_map[getCoords(e[0] + 1, e[1])] != this.free_color 
                            || e[0] + 1 >= this.options.field_width){
                            free = false
                        }
                    } else {
                        var test_x = e[0] + 1 >= this.options.field_width ? 0 : e[0] + 1
                        console.log(test_x)
                        if(this.field_map[getCoords(test_x, e[1])] != this.free_color){
                            free = false
                        }
                    }
                    break;
                case 'turn_left':
                    var old_state = this.current_figure.state
                    var test_state = this.current_figure.state - 1 < 0 ? this.current_figure.shape.state_matrixes.length - 1 :
                        this.current_figure.state - 1
                    var test_x = game.current_figure.shape.init_coords[i][0] 
                        - game.current_figure.shape.state_matrixes[old_state][i][0] 
                        + game.current_figure.shape.state_matrixes[test_state][i][0]
                    var test_y = game.current_figure.shape.init_coords[i][1] 
                        - game.current_figure.shape.state_matrixes[old_state][i][1] 
                        + game.current_figure.shape.state_matrixes[test_state][i][1]
                    if(this.field_map[getCoords(test_x, test_y)] != this.free_color ||
                        this.field_map[getCoords(test_x, test_y)] === null){
                        free = false
                    }
                    break;
                case 'turn_right':
                    var old_state = this.current_figure.state
                    var test_state = this.current_figure.state + 1 >= this.current_figure.shape.state_matrixes.length ? 0 :
                        this.current_figure.state + 1
                    var test_x = game.current_figure.shape.init_coords[i][0] 
                        - game.current_figure.shape.state_matrixes[old_state][i][0] 
                        + game.current_figure.shape.state_matrixes[test_state][i][0]
                    var test_y = game.current_figure.shape.init_coords[i][1] 
                        - game.current_figure.shape.state_matrixes[old_state][i][1] 
                        + game.current_figure.shape.state_matrixes[test_state][i][1]
                    if(this.field_map[getCoords(test_x, test_y)] != this.free_color ||
                         this.field_map[getCoords(test_x, test_y)] === null){
                        free = false
                    }
                    break;
            }
        })
        return free
    }

    this.current_figure = {
        shape : null,
        color : null,
        orig_coordinates : null,
        coordinates : null,
        state : null,
        fall : false,
    }

    this.generateColor = function(){
        return 'rgb(' +
        (Math.floor(Math.random() * 200) + 55) + ',' +
        (Math.floor(Math.random() * 200) + 55) + ',' +
        (Math.floor(Math.random() * 200) + 55) + ')'
    }
    this.createFigure = function(){
        var chosen_shape = shapes_names[Math.floor(Math.random() * shapes_names.length)]
        this.current_figure.shape = new newShape(chosen_shape)
        this.current_figure.coordinates = this.current_figure.shape.init_coords
        if(!!this.checkFreePlaces(this.current_figure.coordinates, 'create')){
            this.current_figure.color = this.generateColor()
            this.current_figure.state = 0
            this.current_figure.fall = false
        } else {
            this.game_over = true
        }
    }

    this.Fall = function(){
        if(!(game_time % this.options.gamespeed) || !!game.current_figure.fall){
            if(!!this.checkFreePlaces(this.current_figure.coordinates, 'down')){
                this.current_figure.coordinates.forEach(e => e[1] = e[1] + 1)
            } else {
                this.current_figure.coordinates.forEach(e => this.field_map[getCoords(e[0], e[1])] = this.current_figure.color)
                this.fieldCleanup()
                this.createFigure()
            }
        }
    }

    this.Move = function(direction){
        var side = direction > 0 ? 'right' : 'left'
        if(!!this.checkFreePlaces(this.current_figure.coordinates, side) && !game.current_figure.fall && !game.pause){
            this.current_figure.coordinates.forEach(e => {                
                if(!!this.options.cillynder){
                    e[0] = e[0] + direction >= this.options.field_width ? 0 : 
                        e[0] + direction < 0 ? this.options.field_width - 1 : 
                        e[0] + direction
                } else {
                    e[0] = e[0] + direction
                }
            })
        }
    }

    this.Rotate = function(direction){
        if(game.current_figure.shape.state_matrixes != null && !game.current_figure.fall && !game.pause){
            var side = direction > 0 ? 'turn_right' : 'turn_left'
            if(!!this.checkFreePlaces(this.current_figure.coordinates, side)){
                var old_state = this.current_figure.state
                this.current_figure.state = this.current_figure.state + direction
                this.current_figure.state = this.current_figure.state >= this.current_figure.shape.state_matrixes.length ? 0 :
                    this.current_figure.state < 0 ? this.current_figure.shape.state_matrixes.length - 1 : this.current_figure.state
                if(game.current_figure.shape.state_matrixes != null){
                    game.current_figure.coordinates.forEach((e, i) => {
                        e[0] = game.current_figure.shape.init_coords[i][0] 
                            - game.current_figure.shape.state_matrixes[old_state][i][0] 
                            + game.current_figure.shape.state_matrixes[game.current_figure.state][i][0]
                        e[1] = game.current_figure.shape.init_coords[i][1] 
                            - game.current_figure.shape.state_matrixes[old_state][i][1] 
                            + game.current_figure.shape.state_matrixes[game.current_figure.state][i][1]
                    })
                }
            }
        }
    }
}

var game = new createGame(tetris)

function getCoords(x, y){
    var id = !y ? String(x) : String(y) + String(x)
    return id
}

function DrawField(){
    for(var i = 0; i < game.options.fieldLength(); i++){
        var cell = document.createElement('div')
        var side_size = document.getElementById('gamefield').
            offsetWidth / game.options.field_width * 0.995
        cell.style.width = side_size + 'px'
        cell.style.height = side_size + 'px'
        cell.style.backgroundColor = game.free_color
        cell.style.cssFloat = 'left'
        cell.id = 'cell_' + i
        document.getElementById('gamefield').append(cell)
    }
}

function Update(){
    if(game.current_figure.coordinates === null){
        game.createFigure()
    } else {
        game.Fall()
    }  
}

function Draw(){
    for(var i = 0; i < game.field_map.length; i++){
        document.getElementById('cell_' + i).style.backgroundColor = !game.pause ? game.field_map[i] : 'white'
    }
    if(game.current_figure !== null){
        for(var i = 0; i < game.current_figure.coordinates.length; i++){
            var coords = game.current_figure.coordinates[i]
            document.getElementById('cell_' + getCoords(coords[0], coords[1])).style.backgroundColor = !game.pause ? game.current_figure.color : 'white'
        }
    }
}

document.addEventListener('keypress', function(e){
    if(!pressed){
        pressed = true
        switch(e.charCode){
            case 97:
                game.Move(-1)
                break;
            case 100:
                game.Move(1)
                break;
            case 113:
                game.Rotate(-1)
                break;
            case 101:
                game.Rotate(1)
                break;
            case 115:
                game.current_figure.fall = true
                break;
            case 112:
                game.pause = !game.pause ? true : false
                break;
        }
    }
})

document.addEventListener('keyup', function(e){
    if(!!pressed){
        pressed = false
    }
})

function GameLoop(){
    now = Date.now()
    if(now - then > game.options.fps){
        then = Date.now()
        !game.pause ? Update() : null
        Draw()
        !game.pause ? game_time++ : null
    }
    !game.game_over ? requestAnimationFrame(GameLoop) : console.log('GAME OVER')
}

DrawField()
GameLoop()

